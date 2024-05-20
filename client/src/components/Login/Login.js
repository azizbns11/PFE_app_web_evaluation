import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import logo from "../../assets/img/brand/logo.png";
import useAuth from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Alert 
} from "reactstrap";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false); 
  const mainContent = useRef(null);
  const { updateUserRole } = useAuth();

  useEffect(() => {
    document.body.classList.add("bg-default");
    return () => {
      document.body.classList.remove("bg-default");
    };
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }

  
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setCredentials({ ...credentials, email: storedEmail });
    }
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
  
    try {
      const response = await axios.post(
        "http://localhost:8000/login",
        credentials,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const { token, role, completedInfo } = response.data;
      localStorage.setItem("token", token);
      updateUserRole(role);
  
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", credentials.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
  
      if (completedInfo) {
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "employee") {
          navigate("/admin/dashboard");
        } else if (role === "supplier") {
          navigate("/supplier/dashboard");
        } else {
          navigate("/");
        }
      } else {
        navigate("/EditProfile");
      }
  
      console.log("Login successful!");
    } catch (error) {
      if (error.response && error.response.status === 401) {
      
        setError("Invalid email or password. Please try again.");
      } else {
        
        setError(error.response.data.message || "An error occurred.");
      }
    }
  };
  

 
  return (
    <>
      <div className="main-content" ref={mainContent}>
        <div className="header bg-gradient-info py-7 py-lg-8">
          <div className="separator separator-bottom separator-skew zindex-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="fill-default"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </div>
   
        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Col lg="6" md="7">
              <Card className="bg-secondary shadow border-0">
                <CardBody className="px-lg-5 py-lg-5">
                  <div className="text-center mb-4">
                    <img
                      src={logo}
                      alt="Company Logo"
                      style={{ width: "200px", height: "auto" }}
                    />
                  </div>
                  <Form role="form" onSubmit={handleSubmit}>
                    <FormGroup className="mb-3">
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-email-83" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Email"
                          type="email"
                          name="email"
                          value={credentials.email}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormGroup>
                    <FormGroup>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-lock-circle-open" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Password"
                          type="password"
                          name="password"
                          value={credentials.password}
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormGroup>
                    {error && <Alert color="danger">{error}</Alert>} 
                    <div className="custom-control custom-control-alternative custom-checkbox">
                      <input
                        className="custom-control-input"
                        id="customCheckLogin"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="customCheckLogin"
                      >
                        <span className="text-muted">Remember me</span>
                      </label>
                    </div>
                    <div className="text-center">
                      <Button className="my-4" color="primary" type="submit">
                        {" "}
                        Sign in
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
              <Row className="mt-3 justify-content-center">
                <Col xs="4">
                  <Link to="/forgotpassword">Forgot Password</Link>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default Login;