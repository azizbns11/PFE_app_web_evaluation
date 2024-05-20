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
import {
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import useAuth from "../../hooks/useAuth";
import Notification from "../../components/Notifications/Notification";
import LogoutIcon from "@mui/icons-material/Logout";
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userData, setUserData] = useState({ userName: "", image: "" });
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
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
  useEffect(() => {
    console.log("Header component mounted");

    const storedUnreadNotifications = localStorage.getItem(
      "unreadNotifications"
    );
    if (storedUnreadNotifications) {
      setUnreadNotifications(parseInt(storedUnreadNotifications));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("unreadNotifications", unreadNotifications);
  }, [unreadNotifications]);

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
    console.log("Bell clicked. Show sidebar:", !showSidebar);

    if (!showSidebar) {
      setUnreadNotifications(0);
    }
  };
  return (
    <div className="header bg-gradient-white py-0">
      <Notification
        user={user}
        isOpen={showSidebar}
        closeSidebar={() => setShowSidebar(false)}
        setUnreadNotifications={setUnreadNotifications}
      />
      <Navbar
        className="navbar-top navbar-dark"
        expand="md"
        id="navbar-main"
        style={{
          backgroundColor: "#4169E1",
          justifyContent: "space-between",
          paddingLeft: 290,
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          height: 68,
        }}
      >
        <Container>
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <Form className="mt-1 p-0 bg-light rounded shadow-sm">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText
                        style={{ color: "grey", fontSize: "0.8rem" }}
                      >
                        <i className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Search"
                      type="text"
                      style={{ color: "grey", fontSize: "0.8rem" }}
                    />
                  </InputGroup>
                </Form>
              </NavItem>
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
                  >
                    {unreadNotifications > 0 && (
                      <span className="badge badge-danger">
                        {unreadNotifications}
                      </span>
                    )}
                  </i>
                </DropdownToggle>
              </UncontrolledDropdown>

              <NavItem className="d-none d-md-block">
                <UncontrolledDropdown nav inNavbar>
                  <div>
                    <IconButton
                      onClick={handleClick}
                      aria-controls="user-menu"
                      aria-haspopup="true"
                      aria-expanded={anchorEl ? "true" : undefined}
                    >
                      <Avatar
                        src={`${userData.image}`}
                        alt={user.name}
                        sx={{ width: 35, height: 35, marginRight: 1 }}
                      />
                    </IconButton>

                    <Menu
                      id="user-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          overflow: "visible",
                          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                          mt: 1.5,
                          "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                          "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <MenuItem
                        onClick={handleProfileClick}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <i
                          className="fa fa-user"
                          aria-hidden="true"
                          style={{ marginRight: "10px" }}
                        ></i>{" "}
                        {/* Adjust margin as needed */}
                        Profile
                      </MenuItem>

                      <Divider />
                      <MenuItem
                        onClick={handleLogout}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <LogoutIcon
                          style={{
                            color: "black",
                            fontSize: "15px",
                            marginRight: "10px",
                          }}
                        />{" "}
                        {/* Adjust margin as needed */}
                        Logout
                      </MenuItem>
                    </Menu>
                  </div>

                  <DropdownMenu right>
                    <DropdownItem onClick={handleProfileClick}>
                      Profile
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;