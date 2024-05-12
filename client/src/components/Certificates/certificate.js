import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  Col,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  Container,
  Row,
  Button,
  Modal, 
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import AddCertificate from "./AddCertificate";
import EditCertificate from "./EditCertificate";

const Certificates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/certificates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedCertificates = response.data.map((certificate) => ({
        ...certificate,
        ExpireDate: formatDate(certificate.ExpireDate),
        RecertificateDate: formatDate(certificate.RecertificateDate),
      }));
      setCertificates(formattedCertificates);
      setFilteredCertificates(formattedCertificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchQuery(searchTerm);
    const filtered = certificates.filter((certificate) =>
      certificate.CertificateName.toLowerCase().includes(searchTerm)
    );
    setFilteredCertificates(filtered);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
  };

  const openPDFPage = (filename) => {
    window.open(`http://localhost:8000/file/${filename}`, "_blank");
  };
  const toggleDeleteConfirmation = () => setDeleteConfirmationOpen(!deleteConfirmationOpen);

  const handleDeleteConfirmation = (certificate) => {
    setCertificateToDelete(certificate);
    toggleDeleteConfirmation();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/certificates/${certificateToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchCertificates();
      toggleDeleteConfirmation();
    } catch (error) {
      console.error("Error deleting certificate:", error);
    }
  };

  const updateCertificatesList = async () => {
    try {

      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/certificates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedCertificates = response.data.map((certificate) => ({
        ...certificate,
        ExpireDate: formatDate(certificate.ExpireDate),
        RecertificateDate: formatDate(certificate.RecertificateDate),
      }));

      setCertificates(formattedCertificates);
      setFilteredCertificates(formattedCertificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);

  const toggleEditModal = () => setEditModalOpen(!editModalOpen);

  const handleEdit = (certificate) => {
    setSelectedCertificate(certificate);
    toggleEditModal();
  };
  const updateCertificateInList = (updatedCertificate) => {
    setCertificates((prevCertificates) =>
      prevCertificates.map((Certificate) =>
        Certificate._id === updatedCertificate._id
          ? updatedCertificate
          : Certificate
      )
    );
  };

  const getExpirationIcon = (expireDate) => {
    const today = new Date();
    const expirationDate = new Date(expireDate);
  
    if (expirationDate < today) {
      // Certificate expired
      return <i className="fa fa-exclamation-circle text-danger" aria-hidden="true"></i>;
    }
    return null;
  };
  

  
  return (
    <>
      <div style={{ backgroundColor: "#FFFAFA", minHeight: "86vh" }}>
    <Container fluid>
          <Row>
            <Col xl="12">
            <Card className="shadow mt-7" style={{ marginLeft: "250px" }}>
                <CardHeader className="d-flex justify-content-between align-items-center border-0"style={{ boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}>
                  <h3 className="mb-0">Certificates List</h3>
                  <InputGroup style={{ maxWidth: "300px" }}>
                    <Input
                      type="text"
                      placeholder="Search by certificate name"
                      className="mr-2"
                      style={{
                        fontSize: "0.875rem",
                        height: "calc(1.5em + .75rem + 2px)",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.375rem",
                      }}
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText
                        style={{ cursor: "pointer", padding: "0.375rem" }}
                        onClick={toggleAddModal}
                      >
                        <i
                          className="fa fa-plus"
                          aria-hidden="true"
                          style={{ fontSize: "0.8rem" }}
                        ></i>
                        Add
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </CardHeader>
                <div style={{ overflowY: "auto", maxHeight: "400px", boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.3)"}}>
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Supplier</th>
                      <th scope="col">Certificate Name</th>
                      <th scope="col">Certificate Number</th>
                      <th scope="col">Expire date</th>
                      <th scope="col">Recertifcate date</th>
                      <th scope="col">File</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((certificate) => (
                      <tr key={certificate._id}>
                        <td>{certificate.SupplierName}</td>
                        <td>{certificate.CertificateName}</td>
                        <td>{certificate.CertificateNumber}</td>
                        <td>
                          {getExpirationIcon(certificate.ExpireDate)} {certificate.ExpireDate}
                        </td>
                        <td>{certificate.RecertificateDate}</td>
                        <td>
                          <Button
                            outline
                            color="primary"
                            onClick={() =>
                              openPDFPage(certificate.CertificateFile)
                            }
                            className="download-button"
                            style={{
                              padding: "0.2rem 0.4rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            <i
                              className="fa fa-download"
                              aria-hidden="true"
                            ></i>
                          </Button>
                        </td>
                        <td>
                          <Button
                            onClick={() => handleEdit(certificate)}
                            outline
                            color="primary"
                            style={{
                              padding: "0.2rem 0.4rem",
                              fontSize: "0.8rem",
                            }}
                          >
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                          </Button>
                          <Button
                            onClick={() => handleDeleteConfirmation(certificate)}
                            outline
                            color="primary"
                            style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                          >
                            <i className="fa fa-trash " aria-hidden="true"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </div>
              </Card>
            </Col>
          </Row>
          <AddCertificate isOpen={addModalOpen} toggle={toggleAddModal} updateCertificatesList={updateCertificatesList}/>
          <EditCertificate
            isOpen={editModalOpen}
            toggle={toggleEditModal}
            certificate={selectedCertificate}
            certificateId={selectedCertificate ? selectedCertificate._id : null}
            updateCertificatesList={updateCertificatesList}
          />
          <Modal isOpen={deleteConfirmationOpen} toggle={toggleDeleteConfirmation}>
        <ModalHeader toggle={toggleDeleteConfirmation}>Delete Confirmation</ModalHeader>
        <ModalBody>
          Are you sure you want to delete the certificate {certificateToDelete && certificateToDelete.CertificateName}?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleDelete(certificateToDelete._id)}>
            Yes
          </Button>{" "}
          <Button color="secondary" onClick={toggleDeleteConfirmation}>
            No
          </Button>
        </ModalFooter>
      </Modal>
        </Container>
      </div>
    </>
  );
};

export default Certificates;
