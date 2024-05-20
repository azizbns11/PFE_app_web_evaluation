import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import ScrollableFeed from "react-scrollable-feed";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  Avatar,
  Tooltip,
} from "@mui/material";

const ChatBox = ({ selectedChat, onNewMessage, selectedUserName }) => {
  const { user, isLoading, error } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState(0);
  const ENDPOINT = "http://localhost:8000";
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const [senderName, setSenderName] = useState("");
  const [lastMessageIndex, setLastMessageIndex] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    newSocket.emit("setup", user.id);

    newSocket.on("connected", () => {
      console.log("Connected to socket.io");
    });
    newSocket.on("message received", handleNewMessage);

    //console.log("New socket created:", newSocket);

    newSocket.on("typing", () => {
      setIsTyping(true);
    });

    newSocket.on("stop typing", () => {
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user.id]);

  useEffect(() => {}, [isTyping]);

  useEffect(() => {}, [loading]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      return;
    }

    if (!user.isAuthenticated) {
      return;
    }

    if (selectedChat) {
      fetchMessages();
    }
  }, [isLoading, error, user, user.id, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (!selectedChat) return;

    if (socket) {
      socket.on("message", (newMessage) => {
        if (onNewMessage) {
          onNewMessage(newMessage);
        }
      });
    }
  }, [selectedChat, onNewMessage, socket]);
  const fetchMessages = async () => {
    //console.log("Fetching messages for chat:", selectedChat);
    if (!selectedChat) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:8000/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage.trim() !== "") {
      try {
        if (!selectedChat) {
          console.error("Selected chat is not defined");
          return;
        }

        const token = localStorage.getItem("token");
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.post(
          "http://localhost:8000/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        console.log("Message sent successfully:", data);
        setMessages((prevMessages) => [...prevMessages, data]);
        setNewMessage("");
        socket.emit("new message", data);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const getDisplayName = () => {
    if (!selectedChat) {
      console.log("Selected chat is null");
      return "Group Chat";
    }

    if (selectedChat.users && selectedChat.users.length === 2) {
      return selectedUserName;
    }

    return "Group Chat";
  };

  //console.log("Selected chat in ChatBox:", selectedChat);

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  const isSameSenderMargin = (m, userId) => {
    return m.sender._id === userId ? "auto" : 0;
  };

  const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };

  const handleNewMessage = (newMessageReceived) => {
    console.log("Received new message:", newMessageReceived);
    setMessages((prevMessages) => [...prevMessages, newMessageReceived]);

    if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
      const sender = newMessageReceived.sender;

      let senderName = "";

      if (sender.role === "supplier") {
        senderName = sender.groupName;
      } else {
        senderName = `${sender.firstName} ${sender.lastName}`;
      }

      setUnreadMessages((prevCount) => prevCount + 1);

      setSenderName((prevNotifications) => [
        ...prevNotifications,
        { id: sender._id, name: senderName },
      ]);

      console.log("Updated senderName:", senderName);

      const notificationMessage = `You have a new message from ${senderName}`;

      console.log(notificationMessage);

      if (onNewMessage) {
        onNewMessage(senderName, sender._id);
      }
      setLastMessageIndex(messages.length);
    }
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        flexDirection: "column",
        padding: 1,
        bgcolor: "white",
        width: { xs: "100%", md: "calc(100% + 300px)" },
        height: "99%",
        borderRadius: 8,
        borderWidth: "1px",
        margin: { xs: "10px 0", md: "auto" },
        marginLeft: { md: "-200px" },
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
      }}
      style={{ marginTop: "10px" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "593px",
            border: "0px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginTop: "20px",
            position: "relative",
          }}
        >
          {selectedChat !== null ? (
            <>
              <Typography variant="h5" align="center" fontFamily="Arial">
                {getDisplayName()}
              </Typography>

              <Box
                sx={{
                  marginTop: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  height: "calc(100% - 84px)",
                  overflowY: "auto",
                  bgcolor: "#E0E8F2",
                }}
              >
                {isTyping && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "40px",
                      left: "10px",
                    }}
                  >
                    Loading...
                  </div>
                )}
                {loading ? (
                  <CircularProgress
                    sx={{
                      position: "absolute",
                      bottom: "280px",
                      left: "410px",
                    }}
                  />
                ) : (
                  <div
                    className="messages"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflowY: "scroll",
                      scrollbarWidth: "none",
                    }}
                  >
                    <ScrollableFeed forceScroll={true}>
                      {messages &&
                        messages.map((m, i) => {
                          return (
                            <div style={{ display: "flex" }} key={m._id}>
                              {(isSameSender(messages, m, i, user.id) ||
                                isLastMessage(messages, i, user.id)) && (
                                <Tooltip
                                  label={m.sender.name}
                                  placement="bottom-start"
                                >
                                  <Avatar
                                    mt="7px"
                                    mr={1}
                                    size="sm"
                                    cursor="pointer"
                                    name={
                                      m.sender.role === "supplier"
                                        ? m.sender.groupName
                                        : `${m.sender.firstName} ${m.sender.lastName}`
                                    }
                                    src={m.sender.image}
                                  />
                                </Tooltip>
                              )}
                              <span
                                style={{
                                  backgroundColor: `${
                                    m.sender._id === user.id
                                      ? "#BEE3F8"
                                      : "#B9F5D0"
                                  }`,
                                  marginLeft: isSameSenderMargin(m, user.id),
                                  marginTop: isSameUser(messages, m, i)
                                    ? 4
                                    : 10,
                                  borderRadius: "20px",
                                  padding: "5px 15px",
                                  maxWidth: "75%",
                                }}
                              >
                                {m.content}
                              </span>
                            </div>
                          );
                        })}
                      {messages.length > 0 && (
                        <Typography
                          variant="caption"
                          align="center"
                          style={{ marginTop: "60px", marginLeft: "390px" }}
                        >
                          {`${formatDistanceToNow(
                            new Date(messages[messages.length - 1].createdAt)
                          )} ago`}
                        </Typography>
                      )}

                      <div ref={messagesEndRef} />
                    </ScrollableFeed>
                  </div>
                )}
              </Box>

              <TextField
                onKeyPress={sendMessage}
                id="message"
                required
                fullWidth
                margin="normal"
                variant="outlined"
                sx={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  width: "calc(100% - 20px)",
                  background: "#E0E0E0",
                }}
                placeholder="Enter a message.."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </>
          ) : (
            <Typography
              variant="h3"
              align="center"
              fontFamily="Arial"
              sx={{ paddingTop: "210px" }}
            >
              Send Messages
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBox;
