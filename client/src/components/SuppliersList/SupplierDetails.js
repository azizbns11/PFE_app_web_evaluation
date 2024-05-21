import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Label,
} from "reactstrap";
import axios from "axios";
import EvaluationDetails from "../Evaluations/EvaluationDetails";
import CertificateDetails from "../Certificates/CertificateDetails";
import ProtocolDetails from "../Protocol/ProtocolDetails";
import Select from "react-select";
const SupplierDetails = ({
  isOpen,
  toggle,
  supplier,
  supplierId,
  updateSupplierInList,
}) => {
  const [editing, setEditing] = useState(false);
  const [editedFormData, setEditedFormData] = useState({
    groupName: "",
    address: "",
    codeTVA: "",
    codeDUNS: "",
    phone: "",
    country: "",
    email: "",
    zipCode: "",
    fax: "",
    street: "",
    province: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [showEvaluationDetails, setShowEvaluationDetails] = useState(false);
  const [showCertificateDetails, setShowCertificateDetails] = useState(false);
  const [showProtocolDetails, setShowProtocolDetails] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/suppliers/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data } = response;
        setEditedFormData(data);
      } catch (error) {
        console.error("Failed to fetch supplier details:", error);
      }
    };

    fetchSupplierData();
  }, [supplierId]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
        );
        const data = await response.json();

        setCountries(data.countries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!supplierId) return;
      setLoadingEvaluations(true);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/evaluations/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvaluations(response.data);
      } catch (error) {
        console.error("Failed to fetch evaluations:", error);
      } finally {
        setLoadingEvaluations(false);
      }
    };

    fetchEvaluations();
  }, [supplierId]);

  useEffect(() => {
    const fetchProtocols = async () => {
      if (!supplierId) return;
      setLoadingProtocols(true);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/protocols/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProtocols(response.data);
      } catch (error) {
        console.error("Failed to fetch protocols:", error);
      } finally {
        setLoadingProtocols(false);
      }
    };

    fetchProtocols();
  }, [supplierId]);
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!supplierId) return;
      setLoadingCertificates(true);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/certificates/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCertificateData(response.data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };
    fetchCertificates();
  }, [supplierId]);

  const handleEditClick = () => {
    setEditing(true);
    setEditedFormData({
      groupName: supplier.groupName || "",
      address: supplier.address || "",
      codeTVA: supplier.codeTVA || "",
      codeDUNS: supplier.codeDUNS || "",
      phone: supplier.phone || "",
      country: supplier.country || "",
      email: supplier.email || "",
      zipCode: supplier.zipCode || "",
      fax: supplier.fax || "",
      street: supplier.street || "",
      province: supplier.province || "",
    });
  };

  const handleSaveClick = async () => {
    try {
      const token = localStorage.getItem("token");

      const updatedFormData = {
        ...editedFormData,
        country: selectedCountry ? selectedCountry.label : "",
      };

      const response = await axios.put(
        `http://localhost:8000/api/suppliers/${supplierId}`,
        updatedFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedSupplier = response.data;
      updateSupplierInList(updatedSupplier);
      toggle();
      setEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedFormData({
      ...editedFormData,
      [name]: value,
    });
  };
  const toggleEvaluationDetails = async () => {
    setShowEvaluationDetails(!showEvaluationDetails);

    if (!showEvaluationDetails) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/evaluations/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvaluations(response.data);
      } catch (error) {
        console.error("Failed to fetch evaluations:", error);
      }
    }
  };
  const toggleProtocolDetails = async () => {
    setShowProtocolDetails(!showProtocolDetails);

    if (!showProtocolDetails) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/protocols/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProtocols(response.data);
      } catch (error) {
        console.error("Failed to fetch protocols:", error);
      }
    }
  };

  const toggleCertificateDetails = async () => {
    setShowCertificateDetails(!showCertificateDetails);

    if (!showCertificateDetails) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/api/certificates/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCertificateData(response.data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {showEvaluationDetails ||
        showCertificateDetails ||
        showProtocolDetails ? (
          <Button
            onClick={() => {
              showEvaluationDetails
                ? toggleEvaluationDetails()
                : showCertificateDetails
                ? toggleCertificateDetails()
                : toggleProtocolDetails();
            }}
            className="back-button"
            style={{
              backgroundColor: '#6495ED',
              color: 'white',
              padding: '5px 10px',
              fontSize: '12px',
              width: 'auto'
            }}
  
          >
            &#8592;
          </Button>
        ) : (
          "Supplier Details"
        )}
      </ModalHeader>
      <ModalBody style={{ display: "flex", flexDirection: "column" }}>
        {showEvaluationDetails ? (
          <EvaluationDetails
            evaluations={evaluations}
            loading={loadingEvaluations}
            supplierId={supplierId}
          />
        ) : showCertificateDetails ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <CertificateDetails
              certificateData={certificateData}
              loading={loadingCertificates}
              supplierId={supplierId}
            />
          </div>
        ) : showProtocolDetails ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <ProtocolDetails
              protocols={protocols}
              loading={loadingProtocols}
              supplierId={supplierId}
            />
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <p>
                <strong>Group Name:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="groupName"
                    value={editedFormData.groupName}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.groupName ?? ""
                )}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="address"
                    value={editedFormData.address}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.address ?? ""
                )}
              </p>
              <p>
                <strong>Code TVA:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="codeTVA"
                    value={editedFormData.codeTVA}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.codeTVA
                )}
              </p>
              <p>
                <strong>Code DUNS:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="codeDUNS"
                    value={editedFormData.codeDUNS}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.codeDUNS
                )}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="phone"
                    value={editedFormData.phone}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.phone
                )}
              </p>
              <p>
                <strong>Country:</strong>{" "}
                {!editing ? (
                  editedFormData.country
                ) : (
                  <FormGroup>
                    <Label htmlFor="input-country"></Label>
                    <Select
                      options={countries}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      placeholder="Select Country"
                    />
                  </FormGroup>
                )}
              </p>
            </div>
            <div style={{ flex: 1 }}>
              {" "}
              <p>
                <strong>Email:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="email"
                    value={editedFormData.email}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.email
                )}
              </p>
              <p>
                <strong>ZIP Code:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="zipCode"
                    value={editedFormData.zipCode}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.zipCode
                )}
              </p>
              <p>
                <strong>Fax:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="fax"
                    value={editedFormData.fax}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.fax
                )}
              </p>
              <p>
                <strong>Street:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="street"
                    value={editedFormData.street}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.street
                )}
              </p>
              <p>
                <strong>Province:</strong>{" "}
                {editing ? (
                  <Input
                    type="text"
                    name="province"
                    value={editedFormData.province}
                    onChange={handleInputChange}
                    style={{ width: "200px" }}
                  />
                ) : (
                  supplier?.province
                )}
              </p>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {!showEvaluationDetails &&
          !showCertificateDetails &&
          !showProtocolDetails && (
            <>
              {!editing ? (
                <Button onClick={handleEditClick}>
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </Button>
              ) : (
                <Button onClick={handleSaveClick}>Save</Button>
              )}
              <Button onClick={toggleCertificateDetails}>
                <i
                  className="fa fa-trophy"
                  aria-hidden="true"
                  style={{ color: "#00BFFF" }}
                ></i>
              </Button>

              <Button onClick={toggleEvaluationDetails}>
                <i
                  className="fa fa-star"
                  aria-hidden="true"
                  style={{ color: "#FFD700" }}
                ></i>
              </Button>

              <Button onClick={toggleProtocolDetails}>
                <i className="fa fa-flag" aria-hidden="true"></i>
              </Button>
            </>
          )}
      </ModalFooter>
    </Modal>
  );
};

export default SupplierDetails;