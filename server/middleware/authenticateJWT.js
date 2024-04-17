const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateJWT = async (req, res, next) => {
  console.log('Middleware applied for /currentUser route');
  const token = req.headers.authorization;

  try {
   
    if (req.path === '/forgotpassword' || req.path.startsWith('/resetpassword/')) {
      return next();
    }

    if (!token) {
      console.error('Authentication token missing');
      return res.status(401).json({ message: 'Authentication token missing' });
    }


    if (!token.startsWith('Bearer ')) {
      console.error('Invalid token format');
      return res.status(401).json({ message: 'Invalid token format' });
    }


    const tokenValue = token.split(' ')[1];

 
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    const userId = decoded.userId;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      console.error('User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = userId;
    req.userRole = currentUser.role;
    console.log('Token decoded successfully');
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateJWT };
