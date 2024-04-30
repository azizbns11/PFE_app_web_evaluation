import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import { Box, Typography } from "@mui/material";
import useAuth from "../../hooks/useAuth";

const MyChats = ({ onSelectChat, onNotificationClick, selectedUserName }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setChats(response.data);
        // console.log("Chats:", response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);
  useEffect(() => {
    //console.log("Chats updated:", chats);
  }, [chats]);
  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    onSelectChat(chat);
  };

  const getDisplayName = (chat) => {
    if (!user || !chat.users || chat.users.length !== 2) return "Group Chat";

    const otherUser = chat.users.find((u) => u._id !== user.id);

    if (!otherUser) return "Group Chat";

    if (user.role === "supplier") {
      if (otherUser.role === "admin" || otherUser.role === "employee") {
        return `${otherUser.firstName} ${otherUser.lastName}`;
      } else if (otherUser.role === "supplier") {
        return otherUser.groupName;
      }
    } else if (user.role === "admin" || user.role === "employee") {
      if (otherUser.role === "admin" || otherUser.role === "employee") {
        return `${otherUser.firstName} ${otherUser.lastName}`;
      } else if (otherUser.role === "supplier") {
        return otherUser.groupName;
      }
    }

    return "Group Chat";
  };

  return (
    <Box
      sx={{
        display: { xs: selectedChat ? "none" : "flex", md: "flex" },
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
        backgroundColor: "white",
        width: { xs: "100%", md: "80%" },
        height: "99%",
        borderRadius: 8,
        borderWidth: "1px",
        marginTop: "10px",

        "@media (min-width: 768px)": {
          marginLeft: "-100px",
        },

        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
      }}
    >
      <>
        <Box
          sx={{
            paddingBottom: 3,
            paddingLeft: 2,
            paddingRight: 3,
            fontSize: "10px",
            fontFamily: "Work sans",
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <Typography variant="h4" color="black">
            My Chats
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 3,
            width: "100%",
            height: "10%",
            maxHeight: "50vh",
          }}
        >
          {chats
            .filter((chat) => chat.latestMessage)
            .map((chat, index) => (
              <Box
                key={index}
                sx={{
                  cursor: "pointer",
                  py: 2,
                  px: 3,
                  borderRadius: "lg",
                  bgcolor: selectedChat === chat ? "#20B2AA" : "transparent",
                  color: selectedChat === chat ? "white" : "black",
                  "&:hover": {
                    bgcolor: selectedChat === chat ? "#20B2AA" : "#f0f0f0",
                  },
                }}
                onClick={() => handleChatClick(chat)}
              >
                <Typography>{getDisplayName(chat)}</Typography>

                {chat.latestMessage && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: selectedChat === chat ? "white" : "#B4B4B8",
                    }}
                  >
                    {chat.latestMessage.sender._id === user.id ? "You: " : null}
                    {chat.latestMessage.content}
                  </Typography>
                )}
              </Box>
            ))}

          {chats.length === 0 && <ChatLoading />}
        </Box>
      </>
    </Box>
  );
};

export default MyChats;
