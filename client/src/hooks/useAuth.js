import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: null,
    id: null,
  });
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));

        const userId = payload.userId;
        const userRole = payload.role;

        setUser({ isAuthenticated: true, role: userRole, id: userId });
      } catch (error) {
        console.error("Error parsing token:", error);
        setUser({ isAuthenticated: false, role: null, id: null });
      }
    } else {
      setUser({ isAuthenticated: false, role: null, id: null });
    }

    setIsLoading(false); 
  }, []);

  const updateUserRole = (newRole) => {
    setUser((prevUser) => ({ ...prevUser, role: newRole }));
  };

  const logout = () => {
   
    setUser({ isAuthenticated: false, role: null, id: null });
    localStorage.removeItem("token");
  };

  const isAuthenticated = user.isAuthenticated;

  return { user, updateUserRole, isAuthenticated, logout, isLoading,  error, setError};
};

export default useAuth;
