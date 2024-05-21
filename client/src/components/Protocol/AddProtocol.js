import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Button,
  Alert,
  CardBody,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";

const AddProtocol = ({ isOpen, toggle , updateProtocolsList}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    status: "is being validated",
    file: null,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [protocols, setProtocols] = useState([]);
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in local storage");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/suppliers/currentUser",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentUser(response.data);
      setFormData({ ...formData, supplierName: response.data.groupName });
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("supplierName", formData.supplierName);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("protocolTitle", formData.protocolTitle);
      formDataToSend.append("file", formData.file);
      formDataToSend.append("supplierId", currentUser._id);
  
      const response = await axios.post(
        "http://localhost:8000/api/protocols",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      setProtocols([...protocols, response.data]);
  
      setShowSuccess(true);

      setFormData({
        supplierName: currentUser.groupName,
        status: "is being validated",
        protocolTitle: "",
        file: null,
      });
  
    
      updateProtocolsList();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); 
    }
  };
  
  

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>New Protocol</ModalHeader>
      <ModalBody>
        <Container>
          <Form onSubmit={handleSubmit}>
            {showSuccess && (
              <Alert color="success" className="mb-3">
                Protocol added successfully!
              </Alert>
            )}
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="supplierName">Supplier Name</Label>
                  <input
                    id="supplierName"
                    type="text"
                    value={formData.supplierName}
                    readOnly
                    className="form-control"
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="status">Status</Label>
                  <input
                    id="status"
                    name="status"
                    type="text"
                    value={formData.status}
                    readOnly
                    className="form-control"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="protocolTitle">Protocol Title</Label>
                  <input
                    id="protocolTitle"
                    name="protocolTitle"
                    type="text"
                    value={formData.protocolTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        protocolTitle: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label for="protocolFile">Protocol File</Label>
                  <input
                    id="protocolFile"
                    name="protocolFile"
                    type="file"
                    onChange={handleFileChange}
                    className="form-control-file"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        </Container>
      </ModalBody>
    </Modal>
  );
                  }  
export default AddProtocol;
