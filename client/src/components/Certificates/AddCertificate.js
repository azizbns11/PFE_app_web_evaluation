import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Button,
  Alert,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";
import ReactDatetime from "react-datetime";

const AddCertificate = ({ isOpen, toggle }) => {
  const [formData, setFormData] = useState({
    SupplierName: "", 
    ExpireDate: "",
    RecertificateDate: "",
    CertificateNumber: "",
    CertificateName: "",
    certificateFile: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSupplier, setIsSupplier] = useState(false);
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/suppliers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Suppliers data:", response.data);
        setSuppliers(
          response.data.map((supplier) => ({
            value: supplier._id,
            label: supplier.groupName,
          }))
        );
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/suppliers/currentUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const currentUserData = response.data;
        console.log("Current User:", currentUserData); 
        setCurrentUser(currentUserData);
        if (currentUserData.role === "supplier") {
        
          setFormData((prevFormData) => ({
            ...prevFormData,
            SupplierName: currentUserData.groupName,
          }));
          setIsSupplier(true);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token missing");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("SupplierName", formData.SupplierName);
      formDataToSend.append("ExpireDate", formData.ExpireDate);
      formDataToSend.append("RecertificateDate", formData.RecertificateDate);
      formDataToSend.append("CertificateNumber", formData.CertificateNumber);
      formDataToSend.append("CertificateName", formData.CertificateName);
      formDataToSend.append("supplierId", formData.supplierId);
      formDataToSend.append("certificateFile", formData.certificateFile);

      const response = await axios.post(
        "http://localhost:8000/api/certificates",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      setShowSuccess(true);
      setFormData({
        SupplierName: "",
        ExpireDate: "",
        RecertificateDate: "",
        CertificateNumber: "",
        CertificateName: "",
        certificateFile: null,
      });
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleInputChange = (selectedOption) => {
    setFormData({
      ...formData,
      SupplierName: selectedOption.label,
      supplierId: selectedOption.value,
    });
  };
  const handleDateChange = (date, field) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, certificateFile: e.target.files[0] });
  };
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>New Certificate</ModalHeader>
      <ModalBody>
        <Container>
          <Form onSubmit={handleSubmit}>
            {showSuccess && (
              <Alert color="success" className="mb-3">
                Certificate added successfully!
              </Alert>
            )}
            <Row>
              <Col md="6">
              <FormGroup>
                  <Label for="SupplierName">Supplier Name</Label>
                  {isSupplier ? (
                    <input
                      id="SupplierName"
                      type="text"
                      value={formData.SupplierName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          SupplierName: e.target.value,
                        })
                      }
                      disabled
                      className="form-control"
                    />
                  ) : (
                    <Select
                      id="SupplierName"
                      options={suppliers}
                      onChange={handleInputChange}
                      isSearchable
                      placeholder="Select Supplier"
                      value={{ label: formData.SupplierName, value: formData.supplierId }}
                    
                    />
                  )}
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="CertificateNumber">Certificate Number</Label>
                  <input
                    id="CertificateNumber"
                    name="CertificateNumber"
                    type="number"
                    value={formData.CertificateNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        CertificateNumber: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="ExpireDate">Expire Date</Label>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-calendar-grid-58" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <ReactDatetime
                      inputProps={{
                        placeholder: "Expire Date",
                        className: "form-control",
                      }}
                      timeFormat={false}
                      onChange={(date) => handleDateChange(date, "ExpireDate")}
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="RecertificateDate">Recertificate Date</Label>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-calendar-grid-58" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <ReactDatetime
                      inputProps={{
                        placeholder: "Recertificate Date",
                        className: "form-control",
                      }}
                      timeFormat={false}
                      onChange={(date) =>
                        handleDateChange(date, "RecertificateDate")
                      }
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="CertificateName">Certificate Name</Label>
              <input
                id="CertificateName"
                name="CertificateName"
                type="text"
                value={formData.CertificateName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    CertificateName: e.target.value,
                  })
                }
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <Label for="certificateFile">Certificate File</Label>
              <input
                id="certificateFile"
                name="certificateFile"
                type="file"
                onChange={handleFileChange}
                className="form-control-file"
              />
            </FormGroup>
            <Button type="submit" className="btn btn-primary">
              Submit
            </Button>
          </Form>
        </Container>
      </ModalBody>
    </Modal>
  );
};

export default AddCertificate;
