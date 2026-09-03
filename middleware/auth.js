import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Support token in cookies OR authorization header
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin still exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'The admin belonging to this token no longer exists.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'This admin account has been deactivated.' });
    }

    // Grant access
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};
