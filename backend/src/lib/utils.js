import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  // Ensure JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    path: '/', // Ensure cookie is available across the entire site
  };

  // Add secure and sameSite options only in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
    cookieOptions.sameSite = "none";
  }

  console.log(`Setting JWT cookie with options:`, {
    ...cookieOptions,
    environment: process.env.NODE_ENV,
  });

  res.cookie("jwt", token, cookieOptions);

  return token;
};
