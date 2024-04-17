const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};


const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, 'azertyuiop', { expiresIn: '1000d' });
};

const preRegisterAdmin = async () => {
  try {

    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin already pre-registered.');
      return;
    }

    const hashedPassword = await hashPassword('admin');

 
    const newAdmin = new User({
      username: 'admin_username',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });


    await newAdmin.save();
    console.log('Admin pre-registered successfully.');
  } catch (error) {
    console.error('Error pre-registering admin:', error);
  }
};




const registerNewUser = async (req, res) => {
  try {
   
    const { email, password, role } = req.body;

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, newUser.role);

    // Respond with token and user's role
    res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const loginUser = async (req, res) => {
  try {
    // Extract user credentials from request body
    const { email, password } = req.body;

    // Check if user with provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user's profile information is completed
    const completedInfo = checkIfProfileCompleted(user); // Implement this function according to your logic

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, 'azertyuiop', { expiresIn: '24h' });
    
    // Respond with token, user's role, and completedInfo flag
    res.json({ token, role: user.role, completedInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Function to check if user's profile information is completed
const checkIfProfileCompleted = (user) => {
  // Check the user's role
  switch (user.role) {
    case 'admin':
    case 'employee':
      // For admin and employee roles, check if firstname, lastname, and position are populated
      return user.firstName && user.lastName && user.position;
    case 'supplier':
      // For supplier role, check if groupname and fax are populated
      return user.groupName && user.fax ;
    default:
      // For other roles, consider the profile as incomplete
      return false;
  }

};




module.exports = {
  preRegisterAdmin, // Export pre-register admin function
  registerNewUser,
  loginUser
};