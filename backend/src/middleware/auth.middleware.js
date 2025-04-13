import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Enhanced token extraction with detailed logging
    let token = null;

    // CHANGE: Check Authorization header FIRST (prioritize this over cookies)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('Auth middleware - Token found in Authorization header');
      }
    }

    // Then check cookies as fallback
    if (!token && req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log('Auth middleware - Token found in cookies');
    }

    // Log request details for debugging
    console.log('Auth request details:', {
      hasToken: !!token,
      tokenSource: req.headers.authorization ? 'header' : (req.cookies?.jwt ? 'cookie' : 'none'),
      hasCookies: !!req.cookies,
      hasAuthHeader: !!req.headers.authorization,
      path: req.path,
      method: req.method,
      headers: Object.keys(req.headers)
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

    // Handle specific JWT errors with appropriate messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized - Invalid Token Format" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: "Unauthorized - Token Not Active Yet" });
    } else if (error.code === 'ERR_JWS_INVALID') {
      return res.status(401).json({ message: "Unauthorized - Token Signature Invalid" });
    }

    // For MongoDB/Mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Generic server error
    res.status(500).json({ message: "Internal server error" });
  }
};
