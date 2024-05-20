import React, { useState, useEffect } from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
const Notification = ({
  user,
  isOpen,
  closeSidebar,
  setUnreadNotifications,
}) => {
  const socket = io("http://localhost:8000");

  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => {
    const storedReadNotifications =
      JSON.parse(localStorage.getItem("readNotifications")) || [];
    return storedReadNotifications;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleNewProtocol = ({ supplierName, protocolTitle }) => {
      console.log("New protocol received:", protocolTitle);
    
      if (user.role === "admin" || user.role === "employee") {
        setUnreadNotifications((prevCount) => prevCount + 1);
      }
    };

    socket.on("newProtocol", handleNewProtocol);

    return () => {
      socket.off("newProtocol", handleNewProtocol);
    };
  }, [socket, user, setUnreadNotifications]);

  useEffect(() => {
    const handleNewProtocolStatus = (notificationMessage) => {
      console.log("New protocol status received:", notificationMessage);
   
      if (user.role === "supplier") {
        setUnreadNotifications((prevCount) => prevCount + 1);
      }
    };
  
    socket.on("newProtocolStatus", handleNewProtocolStatus);
  
    return () => {
      socket.off("newProtocolStatus", handleNewProtocolStatus);
    };
  }, [socket, user, setUnreadNotifications]);
  
  
  
  useEffect(() => {
    const handleNewEvaluation = () => {
      console.log("New evaluation received ");
    
      if (user.role === "supplier") {
        console.log("Incrementing unread notifications");
        setUnreadNotifications((prevCount) => prevCount + 1);
      }
    };

    socket.on("newEvaluation", handleNewEvaluation);

    return () => {
      socket.off("newEvaluation", handleNewEvaluation);
    };
  }, [socket, user, setUnreadNotifications]);

  useEffect(() => {
    const handleNewCertificate = (notificationData) => {
      console.log("New certificate received");
      const userRole = notificationData.userRole;
      const supplierId = notificationData.supplierId;
      console.log("user role from notif", userRole);
      console.log("Supplier ID:", supplierId);
      console.log("Current User ID:", user.id);

      if (userRole === "admin" || userRole === "employee") {
        if (supplierId === user.id) {
          console.log("Incrementing unread notifications");
          setUnreadNotifications((prevCount) => prevCount + 1);
        }
      } else if (userRole === "supplier" && userRole !== user.role) {
        setUnreadNotifications((prevCount) => prevCount + 1);
      }
    };

    socket.on("newCertificate", handleNewCertificate);

    return () => {
      socket.off("newCertificate", handleNewCertificate);
    };
  }, [socket, user, setUnreadNotifications]);

  useEffect(() => {
    console.log("Notifications:", notifications);
  }, [notifications]);

  useEffect(() => {
    if (user && user.id && isOpen) {
      fetchNotifications(user.id);
    }
  }, [user, isOpen]);

  useEffect(() => {
    localStorage.setItem(
      "readNotifications",
      JSON.stringify(readNotifications)
    );
  }, [readNotifications]);

  const fetchNotifications = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/notifications/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications.reverse());
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = (notificationId, notificationType, index) => {
    switch (notificationType) {
      case "evaluation":
        navigate("/admin/evaluations");
        break;
      case "certificate":
        navigate("/admin/certificates");
        break;
      case "protocol":
        navigate("/Protocol");
        break;
      default:
        break;
    }

    const updatedReadNotifications = [...readNotifications];
    updatedReadNotifications[index] = true; 
    setReadNotifications(updatedReadNotifications);
    closeSidebar();
  };
  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 998,
          }}
          onClick={closeSidebar}
        />
      )}
      <div
        className={`notification-sidebar ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-320px",
          width: "320px",
          height: "100%",
          backgroundColor: "#B0C4DE",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
          transition: "right 0.3s ease",
          zIndex: 999,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            backgroundColor: "white",
            color: "white",
            margin: 0,
          }}
        >
          <h1>Notifications</h1>
          <i
            className="fa fa-times-circle"
            aria-hidden="true"
            style={{
              border: "none",
              background: "none",
              color: "DarkBlue",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            onClick={closeSidebar}
          ></i>
        </div>

        <div style={{ height: "calc(100% - 160px)", overflowY: "auto" }}>
          <ListGroup style={{ padding: "10px", backgroundColor: "#B0C4DE" }}>
            {notifications.reverse().map((notification, index) => (
              <ListGroupItem
                key={notification._id}
                onClick={() =>
                  handleNotificationClick(
                    notification._id,
                    notification.type,
                    index
                  )
                }
                style={{
                  cursor: "pointer",
                  borderRadius: "30px",
                  marginBottom: "10px",
                  backgroundColor: "transparent",
                  color: "black",
                  transition: "background-color 0.3s",
                }}
                className="notification-item"
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#D3D3D3";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {notification.message}
                <br />
                <span style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#0000CD" }}>
                  <span style={{ fontSize: "0.8rem" }}>
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }).replace('about ', '')}
                  </span>
                </span>
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      </div>
    </>
  );
};
export default Notification;