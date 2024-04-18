// Import Dashboard components for each role
import AdminDashboard from "./components/Admin/Dashboard";

import Profile from "./components/Profile/Profile";
import AddUser from "./components/AddUser/AddUser";
import SuppliersList from "./components/SuppliersList/Suppliers";
import Evaluations from "./components/Evaluations/Evaluations";
import Employees from "./components/EmployeeList/Employees";
import Messages from "./components/Messages/Messages";
import Certificates from "./components/Certificates/certificate";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/ForgotPassword/ResetPassword";
import DetailsSupplier from "./components/SuppliersList/SupplierDetails";
import EditProfile from "./components/Profile/EditProfile";
import Protocol from "./components/Protocol/Protocol";
import AddProtocol from "./components/Protocol/AddProtocol";
import SupplierDashboard from "./components/SuppliersList/Dashboard";


const routes = (user) => [

  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    allowedRoles: ["admin", "employee"],
    exact: true,
  },



  {
    path: "/supplier/dashboard",
    element: <SupplierDashboard />,
    allowedRoles: ["supplier"],
    exact: true,
  },
  
 

  {
    path: "/profile",
    element: <Profile />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/admin/adduser",
    element: <AddUser />,
    allowedRoles: ["admin"],
    exact: true,
  },
  {
    path: "/admin/suppliers",
    element: <SuppliersList />,
    allowedRoles: ["admin", "employee"],
    exact: true,
  },

  {
    path: "/admin/evaluations",
    element: <Evaluations />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },

  {
    path: "/admin/employees",
    element: <Employees />,
    allowedRoles: ["admin","employee"],
    exact: true,
  },
  {
    path: "/admin/certificates",
    element: <Certificates />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/resetpassword", 
    element: <ResetPassword />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/details/:supplierId",
    element: <DetailsSupplier />,
    allowedRoles: ["admin", "employee"],
    exact: true,
  },

  {
    path: "/EditProfile",
    element: <EditProfile />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/Protocol",
    element: <Protocol />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
  {
    path: "/AddProtocol",
    element: <AddProtocol />,
    allowedRoles: ["supplier"],
    exact: true,
  },
  {
    path: "/Messages",
    element: <Messages />,
    allowedRoles: ["admin", "employee", "supplier"],
    exact: true,
  },
];

export default routes;
