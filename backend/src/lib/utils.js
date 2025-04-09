import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: "7d",
  });

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Set cookie options - more permissive for production
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    path: '/',
    secure: false, // Set to false to work with HTTP
    sameSite: 'Lax' // More permissive
  };

  // Try to set the cookie
  try {
    res.cookie("jwt", token, cookieOptions);
    console.log(`Cookie set with options:`, {
      ...cookieOptions,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error setting cookie:', error);
  }

  // Also add token to response header for alternative auth method
  res.setHeader('Authorization', `Bearer ${token}`);

  return token;
};
