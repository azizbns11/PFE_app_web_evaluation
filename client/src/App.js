import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/scss/argon-dashboard-react.scss";
import routes from "./routes";
import Login from "./components/Login/Login";
import Layout from "./content/Layouts/Layouts";
import Sidebar from "./content/Sidebar/Sidebar";

import Header from "./content/Header/Navbar";
import axios from "axios";

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ firstName: "" });

  useEffect(() => {
    if (user && user.id) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
   
      if (!user.id) {
        console.error("User ID is undefined");
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/profile/fetch/${user.id}`
      );
      
      const { data } = response;
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <Router>
    <Layout>
      <Header user={userData} />
      <Sidebar
        user={userData} 
        logo={{
          innerLink: "/",
          imgSrc: require("./assets/img/brand/logo.png"),
          imgAlt: "Logo",
        }}
      />
    </Layout>
    <Routes>
      <Route path="/" element={<Login />} />
      
      {routes(user).map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
        
      ))}
    </Routes>
  </Router>
  
  );
};

export default App;