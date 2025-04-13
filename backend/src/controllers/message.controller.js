import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    try {
      // Find all users except the logged-in user
      const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
        .select("-password")
        .sort({ fullName: 1 }); // Sort by name alphabetically

      res.status(200).json(filteredUsers);
    } catch (dbError) {
      console.error("Database error in getUsersForSidebar:", dbError.message);
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Validate user ID
    if (!userToChatId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      }).sort({ createdAt: 1 }); // Sort by creation time ascending

      res.status(200).json(messages);
    } catch (dbError) {
      console.error("Database error in getMessages:", dbError.message);

      if (dbError.name === 'CastError') {
        return res.status(400).json({ error: "Invalid user ID format" });
      }

      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate input
    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Message must contain text or image" });
    }

    let imageUrl;
    if (image) {
      try {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image, {
          timeout: 60000, // 60 seconds timeout for upload
        });
        imageUrl = uploadResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError.message);
        return res.status(500).json({ error: "Failed to upload image. Please try again." });
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Emit socket event if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);

    // Handle specific errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};
