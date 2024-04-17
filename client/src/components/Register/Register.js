import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "", 
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
  
      const response = await axios.post(
        "http://localhost:8000/register",
        userData
      );
      console.log("Registration successful:", response.data);
   
    } catch (error) {
      console.error("Registration failed:", error.response.data.message);

    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={userData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={userData.password}
          onChange={handleChange}
        />
        <select name="role" value={userData.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="supplier">Supplier</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
