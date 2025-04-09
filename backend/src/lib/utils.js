import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: "7d",
  });

  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    path: '/',
    secure: true, // Always secure for cross-origin
    sameSite: "None", // Always None for cross-origin cookies
  };

  res.cookie("jwt", token, cookieOptions);

  return token;
};
