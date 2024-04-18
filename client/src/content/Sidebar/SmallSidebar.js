import React, { useState, useEffect } from "react";
import { NavLink as Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
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
const SmallSidebar = () => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [userData, setUserData] = useState({ userName: "", image: "" });
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const { user } = useAuth();
  const location = useLocation();
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

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
      style={{ zIndex: 1000, width: "70px", }} 
    >
      <Container fluid style={{ marginTop: "53px" }}>
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav inNavbar>
            <DropdownToggle nav>
              {userData.image ? (
                <img
                  src={`http:/localhost:8000/${userData.image}`}
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
        <Collapse navbar isOpen={collapseOpen}>
          <div className="navbar-collapse-header d-md-none"></div>
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
                      ? "/employee/dashboard"
                      : user.role === "supplier"
                      ? "/supplier/dashboard"
                      : "/admin/dashboard"
                  }
                  tag={Link}
                  className="nav-link"
                >
                  <i
                    className="fa fa-line-chart text-primary"
                    aria-hidden="true"
                    style={{ fontSize: "18px" }}
                  ></i>
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
                  >
                    <i
                      className="fa fa-truck text-danger"
                      aria-hidden="true"
                      style={{ fontSize: "18px" }}
                    ></i>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    to="/admin/employees"
                    tag={Link}
                    className="nav-link"
                  >
                    <i
                      className="fa fa-briefcase"
                      aria-hidden="true"
                      style={{ color: "#A0522D", fontSize: "18px" }}
                    ></i>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink to="/admin/adduser" tag={Link} className="nav-link">
                    <i
                      className="fa fa-plus-circle"
                      aria-hidden="true"
                      style={{ color: "#DA70D6", fontSize: "18px" }}
                    ></i>
                  </NavLink>
                </NavItem>
              </>
            ) : null}

            <NavItem>
              <NavLink to="/admin/evaluations" tag={Link} className="nav-link">
                <i
                  className="fa fa-star"
                  aria-hidden="true"
                  style={{ color: "#FFD700", fontSize: "18px" }}
                ></i>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/admin/certificates" tag={Link} className="nav-link">
                <i
                  className="fa fa-trophy text-info"
                  aria-hidden="true"
                  style={{ color: "#FFD700", fontSize: "18px" }}
                ></i>
              </NavLink>
            </NavItem>

            <NavItem>
              <NavLink to="/Protocol" tag={Link} className="nav-link">
                <i
                  className="fa fa-flag"
                  aria-hidden="true"
                  style={{ color: "#FFA07A", fontSize: "18px" }}
                ></i>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/Messages" tag={Link} className="nav-link">
                <i
                  className="fa fa-comments"
                  aria-hidden="true"
                  style={{ color: "#3CB371", fontSize: "18px" }}
                ></i>
              </NavLink>
            </NavItem>
          </Nav>
          <Nav navbar>
            <NavItem className="d-flex justify-content">
              <NavLink
                to="/profile"
                tag={Link}
                className="nav-link"
                style={{ marginTop: "190px" }}
              >
                <i
                  className="fa fa-user-circle"
                  aria-hidden="true"
                  style={{ fontSize: "24px" }}
                ></i>
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      
      </Container>
    </Navbar>
  );
};
SmallSidebar.defaultProps = {
  routes: [{}],
};

SmallSidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string.isRequired,
    imgAlt: PropTypes.string.isRequired,
  }),
  user: PropTypes.object.isRequired,
};
export default SmallSidebar;
