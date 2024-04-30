import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Collapse,
  Navbar,
  Nav,
  NavItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Form,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import Notification from "../../components/Notifications/Notification";
import { FaUser, FaSignOutAlt } from 'react-icons/fa'; // Import icons

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({ userName: "", image: "" });
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user || !user.id) {
          console.error("User ID is missing or undefined");
          return;
        }

        if (!token) {
          console.error("Token is missing");
          return;
        }

        console.log("Fetching user data...");
        const response = await axios.get(
          `http://localhost:8000/profile/fetchUserName/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response:", response.data);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    if (user && user.id && token) {
      fetchUserData();
    }
  }, [user, token]);

  const toggle = () => setIsOpen(!isOpen);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBellClick = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="mr-auto">
      <Notification
        user={user}
        isOpen={showSidebar}
        closeSidebar={() => setShowSidebar(false)}
      />
      <Navbar
        className="navbar-top navbar-dark"
        expand="md"
        id="navbar-main"
        style={{
          backgroundColor: "#0096FF",
          justifyContent: "space-between", // Align items to both ends
          paddingLeft: "350px", // Add right padding
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Container>
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <Form className="mt-1 p-0 bg-light rounded shadow-sm">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText style={{ color: "grey" }}>
                        <i className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Search"
                      type="text"
                      style={{ color: "black" }}
                    />
                  </InputGroup>
                </Form>
              </NavItem>
              <NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav>
                    <i
                      className="fas fa-bell fa-lg bell-icon"
                      style={{
                        marginTop: "21px",
                        cursor: "pointer",
                        color: "white",
                      }}
                      onClick={handleBellClick}
                    />
                  </DropdownToggle>
                </UncontrolledDropdown>
              </NavItem>
              <NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav style={{ color: "white" }}>
                    {userData.image ? (
                      <img
                        src={`http://localhost:8000/${userData.image}`}
                        alt="Your Avatar"
                        style={{
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          marginRight: "10px",
                        }}
                      />
                    ) : (
                      <img
                        src={require("../../assets/img/brand/user.png")}
                        alt="Default Avatar"
                        style={{
                          borderRadius: "50%",
                          width: "30px",
                          height: "30px",
                          marginRight: "10px",
                        }}
                      />
                    )}
                    {userData.userName || "Loading..."}
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem onClick={handleProfileClick}>
                      <FaUser style={{ marginRight: "5px", color: "#007bff" }} /> Profile
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout}>
                      <FaSignOutAlt style={{ marginRight: "5px", color: "#dc3545" }} /> Logout
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </NavItem>
            </Nav>
            <Nav>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>


    </div>
  );
}
export default Header;
