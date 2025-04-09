import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: "7d",
  });

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    path: '/',
    // Only set secure and sameSite in production
    ...(isProduction && {
      secure: true,
      sameSite: 'None'
    })
  };

  res.cookie("jwt", token, cookieOptions);

  // For debugging
  console.log(`Setting cookie with options:`, {
    ...cookieOptions,
    environment: process.env.NODE_ENV
  });

  return token;
};
