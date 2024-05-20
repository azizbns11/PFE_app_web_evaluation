import React, { createContext, useContext, useState, useEffect } from "react";
import { Container, Grid } from "@material-ui/core";
import ChatBox from "../Messages/ChatBox";
import MyChats from "../Messages/MyChats";
import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Input from "@mui/material/Input";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import ChatLoading from "../../components/Messages/ChatLoading";
import CircularProgress from "@mui/material/CircularProgress";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  Badge,
} from "@mui/material";
const useStyles = makeStyles((theme) => ({
  tooltip: {
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: "0.9rem",
    fontFamily: "Arial, sans-serif",
  },
  iconButton: {
    color: "#0d73e1",
    fontSize: "1rem",
    fontFamily: "Arial, sans-serif",
    marginRight: "10px",
    marginLeft: "10px",
  },
}));
const ChatContext = createContext();
const ChatPage = ({ isOpen, onClose, onSelectChat }) => {
  const classes = useStyles();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState({ userName: "", image: "" });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [senderId, setSenderId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [emailAnchorEl, setEmailAnchorEl] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [uniqueSenderIds, setUniqueSenderIds] = useState(new Set());

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user.id) {
          console.error("User ID is missing or undefined");
          return;
        }

        if (!token) {
          console.error("Token is missing");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/profile/fetchUserName/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch user data. Please try again later.");
      }
    };

    if (user.id && token) {
      fetchUserData();
    }
  }, [user.id, token]);

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClick = () => {
    navigate("/Profile");
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleNotificationClick = (senderId) => {
    console.log("Clicked on notification");
    console.log("Sender ID:", senderId);

    const selectedUserChat = chats.find((chat) =>
      chat.users.some((user) => user._id === senderId)
    );

    console.log("Selected user chat:", selectedUserChat);

    if (selectedUserChat) {
      setSelectedChat(selectedUserChat);
      setUnreadMessagesCount(0);
      setDrawerOpen(false);
      console.log("Selected chat:", selectedUserChat);
    }
  };

  const handleEmailClick = (event) => {
    setEmailAnchorEl(event.currentTarget);
  };

  useEffect(() => {
    fetchChats();
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:8000/api/chat",
        config
      );
      setChats(data);
      if (selectedChat && !data.some((chat) => chat._id === selectedChat._id)) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/profile/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response data:", response.data);

      const filteredUsers = response.data.filter((searchUser) => {
        // Exclude the current user
        if (searchUser._id === user.id) {
          return false;
        }

        // If the current user is a supplier, exclude other suppliers
        if (user.role === "supplier" && searchUser.role === "supplier") {
          return false;
        }

        if (
          searchUser.role === "admin" ||
          searchUser.role === "employee" ||
          searchUser.role === "supplier"
        ) {
          if (searchUser.role === "admin" || searchUser.role === "employee") {
            return (
              searchUser.firstName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
              searchUser.lastName?.toLowerCase().includes(search.toLowerCase())
            );
          } else if (searchUser.role === "supplier") {
            return searchUser.groupName
              ?.toLowerCase()
              .includes(search.toLowerCase());
          }
        }
        return false;
      });

      setSearchResult(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFunction = async (userId) => {
    try {
      console.log("Selected user ID:", userId);

      const selectedUser = searchResult.find((user) => user._id === userId);
      if (!selectedUser) {
        console.error("Selected user not found");
        return;
      }

      let selectedUserName = "";
      if (selectedUser.role === "supplier") {
        selectedUserName = selectedUser.groupName;
      } else {
        selectedUserName = `${selectedUser.firstName} ${selectedUser.lastName}`;
      }

      setSelectedUser(selectedUser);
      setSelectedUserName(selectedUserName);

      const existingChat = chats.find((chat) =>
        chat.users.some((user) => user._id === userId)
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        setDrawerOpen(false);
      } else {
        const createdChat = await createChat(userId, handleClose);
        //  console.log("Chat created:", createdChat);

        setSelectedChat(createdChat);
        setDrawerOpen(false);
        // console.log("Selected chat state:", selectedChat);
      }
    } catch (error) {
      console.error("Error handling function:", error);
    }
  };

  const createChat = async (userId, onClose, chatName) => {
    try {
      setLoading(true);
      console.log("Creating chat with user ID:", userId);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `http://localhost:8000/api/chat`,
        { users: [user.id, userId], chatName },
        config
      );

      console.log("Chat Creation Response:", response.data);

      console.log("Chat created successfully:", response.data);
      const newChat = response.data;
      setSelectedChat(newChat);

      setChats((prevChats) => [newChat, ...prevChats]);

      setLoading(false);
      onClose();

      return newChat;
    } catch (error) {
      console.error("Error creating chat:", error);
      setLoading(false);
    }
  };

  const handleNewMessage = (senderName, senderId) => {
    console.log("Received new message:", { senderName, senderId });
    console.log("Handling new message from", senderName);
    setUnreadMessagesCount((prevCount) => prevCount + 1);

    if (!uniqueSenderIds.has(senderId)) {
      uniqueSenderIds.add(senderId);
      const newNotification = {
        senderId: senderId,
        senderName: senderName,
      };
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]);
    }

    setSenderName(senderName);
    setSenderId(senderId);
  };

  const UserListItem = ({ user, handleFunction }) => {
    return (
      <Button
        onClick={() => {
          handleFunction(user._id);
        }}
        component="div"
        cursor="pointer"
        width="100%"
        mb={2}
        overflow="hidden"
        sx={{
          borderRadius: "lg",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          color: "black",
          "&:hover": {
            backgroundColor: "#38B2AC",
            color: "white",
          },
        }}
      >
        <Box bg="#E8E8E8" px={3} py={2} display="flex" alignItems="center">
          <Avatar
            mr={2}
            size="xs"
            name={
              user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.groupName
            }
            src={user.image}
            sx={{ marginRight: "8px" }}
          />

          <Box>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem", textTransform: "none" }}
            >
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.groupName}{" "}
            </Typography>{" "}
            <Typography
              variant="body2"
              fontSize="xs"
              sx={{ fontSize: "0.7rem", textTransform: "none" }}
            >
              <b>Email:</b> {user.email.toLowerCase()}
            </Typography>
          </Box>
        </Box>
      </Button>
    );
  };
  let redirectionURL;
  switch (user.role) {
    case "admin":
      redirectionURL = "/admin/dashboard";
      break;
    case "supplier":
      redirectionURL = "/supplier/dashboard";
      break;
    case "employee":
      redirectionURL = "/admin/dashboard";
      break;
    default:
      redirectionURL = "/";
  }
  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        chats,
        setChats,
        handleNewMessage,
      }}
    >
      <div
        style={{ width: "100%", backgroundColor: "#B0C4DE", height: "100vh" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="white"
          width="100%"
          padding="5px 14px"
          border="0px solid"
        >
          <IconButton
            variant="text"
            size="small"
            onClick={() => navigate(-1)}
            className={classes.iconButton}
          >
            <i
              className="fas fa-arrow-left"
              style={{ marginRight: "40px" }}
            ></i>
          </IconButton>
          <Tooltip
            arrow
            placement="bottom-end"
            classes={{ tooltip: classes.tooltip }}
          >
            <IconButton
              variant="text"
              size="small"
              onClick={handleOpenDrawer}
              style={{
                marginRight: "10px",
                color: "#0d73e1",
                fontSize: "0.9rem",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <i
                className="fas fa-search"
                style={{ marginRight: "9px", color: "#DCDCDC" }}
              ></i>
              Search User
            </IconButton>
          </Tooltip>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            bgcolor="white"
            width="100%"
            padding="5px 15px"
            border="0px solid"
          >
            <a href={redirectionURL} style={{ marginLeft: "420px" }}>
              <img
                src={require("../../assets/img/brand/logo.png")}
                alt="Vernicolor"
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "190px",
                  height: "auto",
                }}
              />
            </a>

            <Box>
              <IconButton onClick={handleEmailClick}>
                <Badge
                  color="secondary"
                  badgeContent={unreadMessagesCount}
                  showZero
                >
                  <EmailIcon />
                </Badge>
              </IconButton>
              <Menu
                id="email-menu"
                anchorEl={emailAnchorEl}
                open={Boolean(emailAnchorEl)}
                onClose={() => setEmailAnchorEl(null)}
              >
                {notifications.map((notification, index) => (
                  <MenuItem
                    key={index}
                    onClick={() =>
                      handleNotificationClick(notification.senderId)
                    }
                  >
                    {`You have a new message from ${notification.senderName}`}
                  </MenuItem>
                ))}
                {unreadMessagesCount === 0 && (
                  <MenuItem>No new messages</MenuItem>
                )}
              </Menu>
            </Box>
          </Box>
          <div>
            <IconButton
              onClick={handleClick}
              aria-controls="user-menu"
              aria-haspopup="true"
              aria-expanded={anchorEl ? "true" : undefined}
              style={{ backgroundColor: "white" }}
            >
              <Avatar src={userData.image} alt={user.name} />
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
        </Box>

        {user && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box sx={{ width: 300 }} role="presentation" onClick={onClose}>
              <Typography variant="h6" align="center" mt={2} mb={1}>
                Search Users
              </Typography>

              <Divider />

              <Box display="flex" alignItems="center" px={2} mt={2}>
                <Input
                  fullWidth
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSearch}
                  sx={{
                    ml: 1,
                    backgroundColor: "lightgrey",
                    color: "black",
                  }}
                >
                  Go
                </Button>
              </Box>
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleFunction(user._id)}
                  />
                ))
              )}
            </Box>
            {loading && (
              <Box ml="auto" display="flex">
                <CircularProgress color="primary" />
              </Box>
            )}
          </Drawer>
        )}

        <Container maxWidth="lg">
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              {user && (
                <MyChats
                  onSelectChat={handleSelectChat}
                  selectedUserName={selectedUserName}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {user && (
                <ChatBox
                  selectedChat={selectedChat}
                  onNewMessage={handleNewMessage}
                  selectedUserName={selectedUserName}
                  selectedUserId={selectedUserId}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </div>
    </ChatContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatContext);
};

export default ChatPage;
