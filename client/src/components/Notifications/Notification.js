import React, { useState, useEffect } from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Notification = ({ user, isOpen, closeSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => {
   
    const storedReadNotifications =
      JSON.parse(localStorage.getItem("readNotifications")) || [];
    return storedReadNotifications;
  });
  const navigate = useNavigate();

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
        setNotifications(response.data.notifications);
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
          backgroundColor: "white",
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
        <div
          style={{
            height: "calc(100% - 80px)",
            overflowY: "auto",
          }}
        >
          <ListGroup style={{ padding: "10px" }}>
            {notifications.map((notification, index) => (
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
                  backgroundColor: readNotifications[index]
                    ? "AliceBlue"
                    : "CornflowerBlue",
                  color: readNotifications[index] ? "black" : "AliceBlue",
                }}
              >
                {notification.message}
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      </div>
    </>
  );
};

export default Notification;
