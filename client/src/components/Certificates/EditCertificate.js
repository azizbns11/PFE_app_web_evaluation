import React, { useState, useEffect } from "react";
import ReactDatetime from "react-datetime";
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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalHeader,
  ModalBody,Input,ModalFooter
} from "reactstrap";
const EditCertificate = ({ isOpen, toggle, certificate, certificateId, updateCertificatesList }) => {
  const [editing, setEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [editedFormData, setEditedFormData] = useState({
    SupplierName: "",
    CertificateName: "",
    CertificateNumber: "",
    ExpireDate: "",
    RecertificateDate: "",
    certificateFile: null,
  });

  useEffect(() => {
    const fetchCertificateData = async () => {
      if (!certificateId) return;
    
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/certificates/${certificateId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const { data } = response;
    
       
        setEditedFormData({
          SupplierName: data.SupplierName || "",
          CertificateName: data.CertificateName || "",
          CertificateNumber: data.CertificateNumber || "",
          ExpireDate: formatDate(data.ExpireDate),
          RecertificateDate: formatDate(data.RecertificateDate),
        });
      } catch (error) {
        console.error("Failed to fetch certificate details:", error);
      }
    };
    

    fetchCertificateData();
  }, [certificateId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
    return formattedDate;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedFormData({
      ...editedFormData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setEditedFormData({
      ...editedFormData,
      certificateFile: e.target.files[0],
    });
  };
  const handleDateChange = (date, field) => {
    setEditedFormData({ ...editedFormData, [field]: date });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const formData = new FormData();
      formData.append("SupplierName", editedFormData.SupplierName);
      formData.append("CertificateName", editedFormData.CertificateName);
      formData.append("CertificateNumber", editedFormData.CertificateNumber);
      formData.append("ExpireDate", editedFormData.ExpireDate);
      formData.append("RecertificateDate", editedFormData.RecertificateDate);
      formData.append("certificateFile", editedFormData.certificateFile); 

      const response = await axios.put(
        `http://localhost:8000/api/certificates/${certificateId}`,
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      updateCertificatesList();
      toggle();
      setEditing(false);

    
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); 
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  if (!certificate) return null;
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Certificate</ModalHeader>
      <ModalBody>
        {showSuccess && (
          <Alert color="success" className="mb-3">
            Certificate updated successfully!
          </Alert>
        )}
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="SupplierName">Supplier Name</Label>
              <Input
                type="text"
                name="SupplierName"
                value={editedFormData.SupplierName || ""}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label for="CertificateName">Certificate Name</Label>
              <Input
                type="text"
                name="CertificateName"
                value={editedFormData.CertificateName || ""}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="CertificateNumber">Certificate Number</Label>
              <Input
                type="text"
                name="CertificateNumber"
                value={editedFormData.CertificateNumber || ""}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
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
        </Row>
        <Row>
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
          <Col md="6">
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
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Save
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
  
};

export default EditCertificate;
