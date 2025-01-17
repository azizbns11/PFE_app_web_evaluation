import React, { useState, useEffect } from "react";
import { NavLink as Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import { useMediaQuery } from "@mui/material";
import PlusOneOutlinedIcon from "@mui/icons-material/PlusOneOutlined";
import {
  Navbar,
  NavItem,
  NavLink,
  Collapse,
  NavbarBrand,
  Container,
  Row,
  Col,
  Form,
  Nav,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [userData, setUserData] = useState({ userName: "", image: "" });
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const { user } = useAuth();
  const location = useLocation();
  const toggleCollapse = () => {
    setCollapseOpen(!collapseOpen);
  };

  const closeCollapse = () => {
    setCollapseOpen(false);
  };
  const handleActiveLink = (path) => {
    if (location.pathname === path) {
      return { fontWeight: "bold", color: "black" }; // Bold and black for active link
    }
    return { color: "black" }; // Just black for inactive links
  };
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

  const { routes, logo } = props;
  const isSmallScreen = useMediaQuery("(max-width:770px)");
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    let redirectionURL;
    switch (user.role) {
      case "admin":
        redirectionURL = "/admin/dashboard";
        break;
      case "supplier":
        redirectionURL = "/supplier/dashboard/";
        break;
      case "employee":
        redirectionURL = "/admin/dashboard";
        break;
      default:
        redirectionURL = "/";
    }

    navbarBrandProps = {
      to: redirectionURL,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }
  const shouldHideSidebar = location.pathname === "/Messages";
  if (shouldHideSidebar) {
    return null;
  }
  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
      style={{ zIndex: 1000 }}
    >
      <Container fluid>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        {!isSmallScreen && (
          <Nav className="align-items-center d-md-none">
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav>
                {userData.image ? (
                  <img
                    src={`http://localhost:8000/${userData.image}`}
                    alt="Avatar"
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                    }}
                  />
                ) : (
                  <img
                    src={require("../../assets/img/brand/user.png")}
                    alt="Default Avatar"
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      marginRight: "10px",
                    }}
                  />
                )}
                <span className="ml-2">{userData.userName}</span>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem to="/profile" tag={Link}>
                  My Profile
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem to="/logout" tag={Link}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        )}
        <Collapse navbar isOpen={collapseOpen}>
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>

          <Nav className="mb-md-3" navbar>
            {(user.role === "employee" ||
              user.role === "supplier" ||
              user.role === "admin") && (
                <NavItem>
                <NavLink
                  to={
                    user.role === "employee"
                      ? "/admin/dashboard"
                      : user.role === "supplier"
                      ? "/supplier/dashboard"
                      : "/admin/dashboard"
                  }
                  tag={Link}
                  className="nav-link"
                  style={handleActiveLink("/admin/dashboard")} // Apply styles based on active link
                >
                  <i
                    className="fa fa-line-chart text-primary"
                    aria-hidden="true"
                    style={{ fontSize: "18px" }}
                  ></i>
                  Dashboard
                </NavLink>
              </NavItem>
            )}
            {user.role === "admin" || user.role === "employee" ? (
              <>
                <NavItem>
                  <NavLink
                    to="/admin/suppliers"
                    tag={Link}
                    className="nav-link"
                    style={handleActiveLink("/admin/suppliers")}
                  >
                    <i
                      className="fa fa-truck text-danger"
                      aria-hidden="true"
                      style={{ fontSize: "18px" }}
                    ></i>
                    Suppliers
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    to="/admin/employees"
                    tag={Link}
                    className="nav-link"
                    style={handleActiveLink("/admin/employees")}
                  >
                    <i
                      className="fa fa-briefcase"
                      aria-hidden="true"
                      style={{ color: "#A0522D", fontSize: "18px" }}
                    ></i>
                    Employees
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/admin/adduser" tag={Link} className="nav-link"   style={handleActiveLink("/admin/adduser")}>
                    <i
                      className="fa-solid fa-user-plus"
                      aria-hidden="true"
                      style={{ color: "#DA70D6", fontSize: "18px" }}
                      
                    ></i>
                    Add User
                  </NavLink>
                </NavItem>
              </>
            ) : null}

            <NavItem>
              <NavLink to="/admin/evaluations" tag={Link} className="nav-link"   style={handleActiveLink("/admin/evaluations")}>
                <i
                  className="fa fa-star"
                  aria-hidden="true"
                  style={{ color: "#FFD700", fontSize: "18px" }}
                ></i>
                Evaluations
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/certificates" tag={Link} className="nav-link"   style={handleActiveLink("/admin/certificates")}>
                <i
                  className="fa fa-trophy text-info"
                  aria-hidden="true"
                  style={{ color: "#FFD700", fontSize: "18px" }}
                ></i>
                Certificates
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink to="/Protocol" tag={Link} className="nav-link"   style={handleActiveLink("/Protocol")}>
                <i
                  className="fa fa-flag"
                  aria-hidden="true"
                  style={{ color: "#FFA07A", fontSize: "18px" }}
                ></i>
                Protocol Status
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/Messages" tag={Link} className="nav-link"   style={handleActiveLink("/admin/Messages")}>
                <i
                  className="fa fa-comments"
                  aria-hidden="true"
                  style={{ color: "#3CB371", fontSize: "18px" }}
                ></i>
                Messages
                <PlusOneOutlinedIcon
                  style={{ marginLeft: "40px", color: "red" }}
                />
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
        <Nav navbar className="mt-auto">
          <NavItem>
            <NavLink to="/profile" tag={Link} className="nav-link"  style={handleActiveLink("/profil")}>
              <i
                className="fa fa-user-circle"
                aria-hidden="true"
                style={{ fontSize: "24px" }}
              ></i>
              Profile
            </NavLink>
          </NavItem>
        </Nav>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
  user: PropTypes.object.isRequired,
};

export default Sidebar;
