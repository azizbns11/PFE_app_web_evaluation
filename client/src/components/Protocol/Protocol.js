// protocol.js
import React, { useState, useEffect } from "react";

import axios from "axios";
import {
  Card,
  CardHeader,
  Col,
  InputGroup,
  Input,
  Table,
  Container,
  Row,
  Button,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import useAuth from "../../hooks/useAuth";
import AddProtocol from "./AddProtocol";
const Protocol = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedprotocol, setSelectedprotocol] = useState(null);
  const [protocols, setProtocols] = useState([]);

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    supplierName: "",
    status: "is being validated",
    file: null,
  });

  useEffect(() => {
    fetchSuppliers();
    fetchProtocols();
  }, []);
  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/suppliers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const [filteredProtocols, setFilteredProtocols] = useState([]);
  useEffect(() => {
    fetchProtocols();
  }, []);
  const fetchProtocols = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.get("http://localhost:8000/api/protocols", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      setProtocols(response.data);
      setFilteredProtocols(response.data);
    } catch (error) {
      console.error("Error fetching protocols:", error);
    }
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchQuery(searchTerm);
    const filtered = protocols.filter((protocol) =>
      protocol.protocolTitle.toLowerCase().includes(searchTerm)
    );
    setFilteredProtocols(filtered);
  };

  const openPDFPage = (filename) => {
    window.open(`http://localhost:8000/file/${filename}`, "_blank");
  };
  const handleDelete = async (protocolId) => {
    try {
      const token = localStorage.getItem("token"); 
      await axios.delete(`http://localhost:8000/api/protocols/${protocolId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      
      fetchProtocols();
    } catch (error) {
      console.error("Error deleting protocol:", error);
    }
  };
  const handleStatusChange = async (protocolId) => {
    try {
      const token = localStorage.getItem("token"); 
      const currentProtocol = protocols.find(
        (protocol) => protocol._id === protocolId
      );
      const newStatus =
        currentProtocol.status === "validated" ? "invalid" : "validated";
      await axios.put(
        `http://localhost:8000/api/protocols/${protocolId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      fetchProtocols();
    } catch (error) {
      console.error("Error changing protocol status:", error);
    }
  };
  const toggleAddModal = () => setAddModalOpen(!addModalOpen);
  const getButtonTextForStatus = (status) => {
    switch (status) {
      case "validated":
        return "Invalid";
      case "invalid":
        return "Valid";
      default:
        return "Validate";
    }
  };

  const getColorForStatus = (status) => {
    switch (status) {
      case "validated":
        return "danger"; 
      case "invalid":
        return "success"; 
      default:
        return "warning"; 
    }
  };
  const getTextColorForStatus = (status) => {
    switch (status) {
      case "validated":
        return "green"; 
      case "invalid":
        return "red"; 
      default:
        return "orange"; 
    }
  };

  return (
    <Container className="mt--5" fluid>
      <Row>
        <Col xl="12">
        <Card className="shadow mt-9" style={{ marginLeft: "250px" }}>
            <CardHeader className="d-flex justify-content-between align-items-center border-0">
              <h3 className="mb-0">Protocol</h3>
              <InputGroup style={{ maxWidth: "300px" }}>
                <Input
                  type="text"
                  placeholder="Search by protocol title"
                  className="mr-2"
                  style={{
                    fontSize: "0.875rem",
                    heigt: "calc(1.5em + .75rem + 2px)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.375rem",
                  }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {user.role === "supplier" && (
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
                )}
              </InputGroup>
            </CardHeader>
            <div style={{ overflowY: "auto", maxHeight: "400px" }}>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Supplier Name</th>
                    <th scope="col">Protocol Title</th>
                    <th scope="col">Status</th>
                    <th scope="col">File</th>
                    {(user.role === "admin" || user.role === "employee") && (
                      <>
                        <th scope="col">Actions</th>
                        <th></th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProtocols.map((protocol) => (
                    <tr key={protocol._id}>
                      <td>{protocol.supplierName}</td>
                      <td>{protocol.protocolTitle}</td>
                      <td
                        style={{
                          color: getTextColorForStatus(protocol.status),
                        }}
                      >
                        {protocol.status}
                      </td>
                      <td>
                        <Button
                          outline
                          color="primary"
                          onClick={() => openPDFPage(protocol.ProtocolFile)}
                          className="download-button"
                          style={{
                            padding: "0.2rem 0.4rem",
                            fontSize: "0.8rem",
                          }}
                        >
                          <i className="fa fa-download" aria-hidden="true"></i>
                        </Button>
                      </td>
                      {(user.role === "admin" || user.role === "employee") && (
                        <>
                          <td>
                            <Button
                              onClick={() => handleStatusChange(protocol._id)}
                              outline
                              color={getColorForStatus(protocol.status)}
                              style={{
                                padding: "0.2rem 0.4rem",
                                fontSize: "0.8rem",
                              }}
                            >
                              {getButtonTextForStatus(protocol.status)}
                            </Button>
                          </td>
                          <td>
                            <Button
                              onClick={() => handleDelete(protocol._id)}
                              outline
                              color="primary"
                              style={{
                                padding: "0.2rem 0.4rem",
                                fontSize: "0.8rem",
                              }}
                            >
                              <i
                                className="fa fa-trash "
                                aria-hidden="true"
                              ></i>
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
          <Card>
            
          </Card>
        </Col>
      </Row>
      <AddProtocol isOpen={addModalOpen} toggle={toggleAddModal} />
    </Container>
  );
};
export default Protocol;
