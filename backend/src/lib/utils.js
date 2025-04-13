import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: "7d",
  });

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Set cookie options based on environment
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    path: '/'
  };

  // In production, we need to set secure and sameSite for HTTPS
  if (isProduction) {
    // For production deployments (like Render)
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'None';
  } else {
    // For local development
    cookieOptions.secure = false;
    cookieOptions.sameSite = 'Lax';
  }

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

  // IMPORTANT: Add token to response header for alternative auth method
  res.setHeader('Authorization', `Bearer ${token}`);

  // Also add token to Access-Control-Expose-Headers to make it available to the client
  const exposedHeaders = res.getHeader('Access-Control-Expose-Headers') || '';
  res.setHeader('Access-Control-Expose-Headers',
    exposedHeaders ? `${exposedHeaders}, Authorization` : 'Authorization');

  console.log('Token generated and set in Authorization header');

  return token;
};
