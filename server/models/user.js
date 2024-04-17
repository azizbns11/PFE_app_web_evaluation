const mongoose = require("mongoose");

// Define Schema for User Profile
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "supplier", "employee"],
    required: true,
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  image: {
    type: String,
    
   
  },
  position: {
    type: String,
  },
  state: {
    type: Number,
  },
  codeUser: {
    type: String,
  },
  groupName: {
    type: String,
  },
  street: {
    type: String,
  },
  province: {
    type: String,
  },
  address: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  country: {
    type: String,
  },
  phone: {
    type: Number,
    index: { unique: false },
    sparse: true,
  },
  fax: { type: Number },

  codeTVA: {
    type: String,
  },
  codeDUNS: {
    type: String,
  },
});


const User = mongoose.model("User", userSchema);

module.exports = User;
