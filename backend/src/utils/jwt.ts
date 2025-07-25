import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  const expires = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // @ts-ignore - TypeScript has issues with jwt.sign overloads
  return jwt.sign({ id }, secret, { expiresIn: expires });
};

export const verifyToken = (token: string): jwt.JwtPayload | string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, secret);
};