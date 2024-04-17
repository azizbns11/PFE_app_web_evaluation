import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Layouts({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/forgotpassword" || location.pathname === "/Messages" || location.pathname === "/EditProfile"|| location.pathname.startsWith("/resetpassword"))setShowSidebar(false);
    else setShowSidebar(true);
  }, [location]);
  return <div>{showSidebar && children}</div>;
}

export default Layouts;