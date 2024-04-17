import React, { useState, useEffect } from "react";

import axios from "axios";
import {
 
  Row,
  Col,
  
  FormGroup,
  Label,
  Button,
  Alert,

  Modal, ModalHeader, ModalBody, ModalFooter, Input
} from "reactstrap";
const EditCertificate = ({ isOpen, toggle, certificate, certificateId, updateCertificateInList }) => {
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

      const updatedCertificate = response.data;
      updateCertificateInList(updatedCertificate);
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
              <Input
                type="text"
                name="ExpireDate"
                value={editedFormData.ExpireDate || ""}
                onChange={handleInputChange}
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="RecertificateDate">Recertification Date</Label>
              <Input
                type="text"
                name="RecertificateDate"
                value={editedFormData.RecertificateDate || ""}
                onChange={handleInputChange}
              />
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
