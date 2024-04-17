import React, { useState, useEffect } from "react";
import SmallSidebar from "../../content/Sidebar/SmallSidebar";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import {
  FormGroup,
  Label,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Navbar,
  NavbarBrand,
} from "reactstrap";

const Messages = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user || !user.id) {
          console.error("Token or user ID not available");
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
        setUserName(response.data.userName);
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserName();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token missing");
        return;
      }

      const response = await axios.get("http://localhost:8000/profile/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setSearchQuery("");
    setSelectedUser(null);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setSelectedUser(null);
    filterUsers(query);
  };

  const filterUsers = (query) => {
    const filteredUsers = users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`;
      const groupName = user.groupName || "";
      return (
        ((user.role === "employee" || user.role === "admin") &&
          fullName.toLowerCase().includes(query)) ||
        (user.role === "supplier" && groupName.toLowerCase().includes(query))
      );
    });
    setDisplayedUsers(filteredUsers);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(
      user.role === "supplier"
        ? user.groupName || ""
        : `${user.firstName || ""} ${user.lastName || ""}`
    );
  };

  const startChat = () => {
    setModalOpen(false); // Close modal when starting chat
    setConversationStarted(true); // Update conversationStarted to true
  };

  const sendMessage = async () => {
    try {
      // Implement sending message functionality here
      console.log("Message sent:", message);
      // Clear message input after sending
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ width: "70px", backgroundColor: "lightgray" }}>
          <SmallSidebar />
        </div>

        <div
          style={{
            flex: 2,
            backgroundColor: "white",
            overflow: "auto",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            className="display-5 text-black"
            style={{ marginTop: "20px", marginLeft: "20px" }}
          >
            {userName || "Loading..."}
          </h1>
          <h4
            className="display-5 text-black"
            style={{ marginTop: "20px", marginLeft: "20px" }}
          >
            Messages
          </h4>
        </div>

        <div
          style={{
            width: "140vh",
            backgroundColor: "lightblue",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {conversationStarted ? (
            <>
              <Navbar color="lightblue" light expand="md">
                <NavbarBrand>
                  {selectedUser && selectedUser.image && (
                    <img
                      src={selectedUser.image}
                      alt="User"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                  )}
                  {selectedUser &&
                    (selectedUser.role === "supplier"
                      ? selectedUser.groupName
                      : `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`)}
                </NavbarBrand>
              </Navbar>

              {/* White Divider */}
              <div
                style={{
                  height: "1px",
                  width: "100%",
                  backgroundColor: "white",
                  margin: "auto", // To center the divider
                }}
              />

              <div style={{ textAlign: "center" }}>
                

                <div
                  style={{
                    width: "130vh",
                    backgroundColor: "lightblue",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginTop: "80vh", // Adjust this value as needed
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      style={{ marginBottom: "10px", width: "130vh" }} // Add margin bottom to create space for the button
                    />
                    <Button
                      color="transparent"
                      onClick={sendMessage}
                      style={{
                        position: "absolute",
                        right: "10px",
                        bottom: "10px",
                        color: "inherit", // Set initial color
                        cursor: "pointer", // Change cursor on hover
                        boxShadow: "none", // Remove shadow
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.color = "blue")
                      } // Change color on hover
                      onMouseOut={(e) =>
                        (e.target.style.color = "inherit")
                      } // Revert color on mouse out
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <i
                className="fa fa-commenting"
                aria-hidden="true"
                style={{ color: "#F0F8FF", fontSize: "120px" }}
              ></i>
              <h5>Start Your Conversation</h5>
              <Button type="button" color="secondary" onClick={toggleModal}>
                Send Message
              </Button>
            </>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>New Message</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="searchQuery">Search Users:</Label>
            <Input
              type="text"
              id="searchQuery"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </FormGroup>

          <ul style={{ listStyleType: "none" }}>
            {searchQuery !== "" &&
              displayedUsers.map((user, index) => {
                return (
                  <li
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    style={{
                      marginBottom:
                        index === displayedUsers.length - 1 ? "0" : "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background-color 0.3s", // Smooth transition for hover effect
                        backgroundColor: "transparent", // Initial background color
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f0f0")
                      } // Change background color on hover
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      } // Revert background color on mouse leave
                    >
                      {user.image ? (
                        <img
                          src={user.image}
                          alt="User"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            marginRight: "10px",
                          }}
                        />
                      ) : (
                        <div>No Image Available</div>
                      )}
                      <span>
                        {user.role === "supplier"
                          ? user.groupName
                          : `${user.firstName || ""} ${user.lastName || ""}`}
                      </span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={startChat} disabled={!selectedUser}>
            Start Chat
          </Button>{" "}
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Messages;
