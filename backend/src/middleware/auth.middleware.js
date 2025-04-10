import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Enhanced token extraction with detailed logging
    let token = null;

    // Check cookies first
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log('Auth middleware - Token found in cookies');
    }

    // Then check Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Auth middleware - Token found in Authorization header');
      }
    }

    // Log request details for debugging
    console.log('Auth request details:', {
      hasToken: !!token,
      hasCookies: !!req.cookies,
      hasAuthHeader: !!req.headers.authorization,
      path: req.path,
      method: req.method
    });

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
