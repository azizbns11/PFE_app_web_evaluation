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

 
    const newUser = new User({
      email,
      password: hashedPassword,
      role
    });


    await newUser.save();


    const token = generateToken(newUser._id, newUser.role);

  
    res.status(201).json({ token, role: newUser.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const loginUser = async (req, res) => {
  try {
   
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

 
    const completedInfo = checkIfProfileCompleted(user); 

  
    const token = jwt.sign({ userId: user._id, role: user.role }, 'azertyuiop', { expiresIn: '24h' });
    

    res.json({ token, role: user.role, completedInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


const checkIfProfileCompleted = (user) => {

  switch (user.role) {
    case 'admin':
    case 'employee':
 
      return user.firstName && user.lastName && user.position;
    case 'supplier':
   
      return user.groupName && user.fax ;
    default:
   
      return false;
  }

};




module.exports = {
  preRegisterAdmin, 
  registerNewUser,
  loginUser
};