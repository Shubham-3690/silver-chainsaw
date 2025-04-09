import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Log request cookies for debugging
    console.log('Request cookies:', req.cookies);

    const token = req.cookies.jwt;

    if (!token) {
      console.log('No JWT token found in cookies');
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log('Token verification returned null');
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    console.log('Decoded token:', { ...decoded, userId: decoded.userId });

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      console.log(`User with ID ${decoded.userId} not found`);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log(`User authenticated: ${user._id}`);

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    console.log("Error name:", error.name);
    console.log("Error stack:", error.stack);

    // Provide more specific error messages based on the error type
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token format" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: "Token not yet valid" });
    }

    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
