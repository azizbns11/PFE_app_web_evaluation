import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Card,
  CardBody,
} from "reactstrap";
import useAuth from "../../hooks/useAuth";
import axios from "axios";

const AddUser = () => {
  const { user } = useAuth();
  const [role, setUserRole] = useState("supplier");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleUserRoleChange = (event) => {
    setUserRole(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const generateRandomPassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      const token = localStorage.getItem('token'); 
      if (!token) {
        throw new Error('Authentication token missing');
      }
  
    
      const randomPassword = generateRandomPassword();
  
    
      const response = await axios.post(
        "http://localhost:8000/send-email",
        { email, password: randomPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
      
        await axios.post(
          "http://localhost:8000/register",
          { email, role, password: randomPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setSuccessMessage("Password sent successfully!");
      } else {
        setError("Failed to send password. Please try again later.");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
     
        setError(error.response.data.message);
      } else {
        setError("Failed to send password. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md="8">
          <Card className="shadow">
            <CardBody>
              <h2 className="text-center mb- mt-2">Add User</h2>
              <Form onSubmit={handleFormSubmit}>
                <FormGroup>
                  <Label for="email">Email:</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
  <Label for="role">Select User Type:</Label>
  <Input
    id="role"
    type="select"
    value={role}
    onChange={(e) => setUserRole(e.target.value)}
    disabled={user.role === "employee"}
  >
    {user.role === "admin" ? (
      <>
        <option value="employee">Employee</option>
        <option value="supplier">Supplier</option>
      </>
    ) : (
      <option value="supplier">Supplier</option>
    )}
  </Input>
</FormGroup>

                <Button
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className="d-block mx-auto"
                >
                  {loading ? "Sending..." : "Send Password"}
                </Button>

                {error && <p className="text-danger mt-3">{error}</p>}
                {successMessage && (
                  <p className="text-success mt-3">{successMessage}</p>
                )}
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
export default AddUser;
