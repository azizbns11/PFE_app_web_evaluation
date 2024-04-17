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
 
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import ReactDatetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import Select from "react-select";
import useAuth from "../../hooks/useAuth";
import axios from "axios";

const AddEvaluation = ({ isOpen, toggle, updateEvaluationsList }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    SupplierName: "",
    evaluationDate: null,
    QualityNote: 0,
    LogisticNote: 0,
    BillingError: 0,
    PaymentTerm: 0,
    Score: 0,
    createdBy: user.id,
  });

  const [suppliers, setSuppliers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get("http://localhost:8000/api/suppliers", {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
    fetchSuppliers();
  }, []);
  
  

  const handleNumberInputChange = (e, name) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateScore = () => {
    const { QualityNote, LogisticNote, BillingError, PaymentTerm } = formData;
    const score =
      QualityNote * 0.4 +
      LogisticNote * 0.3 +
      BillingError * 0.15 +
      PaymentTerm * 0.15;
    setFormData((prevData) => ({
      ...prevData,
      Score: score.toFixed(2),
    }));
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      evaluationDate: date,
    });
  };

  const handleInputChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        SupplierName: selectedOption.label,

        supplierId: selectedOption.value,
      });
    }
  };

  //console.log(formData);


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Authentication token missing');
        return;
      }
  
      const response = await fetch("http://localhost:8000/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          evaluationDate: formData.evaluationDate.toISOString(), 
          supplierId: formData.supplierId,
          SupplierName: formData.SupplierName,
        }),
      });
  
      if (response.ok) {
        console.log("Evaluation saved successfully");
        setShowSuccess(true);
        updateEvaluationsList();
        setFormData({
          SupplierName: "",
          evaluationDate: null,
          QualityNote: 0,
          LogisticNote: 0,
          BillingError: 0,
          PaymentTerm: 0,
          Score: 0,
          createdBy: user.id,
        });
        setTimeout(() => setShowSuccess(false), 3000);
      } else if (response.status === 400) {
        // Handle the case where the previous month's evaluation is missing
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
      } else {
        console.error("Failed to save evaluation");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}> Evaluation Form</ModalHeader>
      <ModalBody>
        <Container>
          <Row className="justify-content-center">
            <Col md="">
              <CardBody>
                <Form onSubmit={handleSubmit}>
                {showSuccess && (
                    <Alert color="success" className="mb-3">
                      Evaluation added successfully!
                    </Alert>
                  )}
                  {showError && (
                    <Alert color="danger" className="mb-3">
                      Evaluation for the previous month is missing. Please add the evaluation for the previous month before adding the evaluation for the current month.
                    </Alert>
                  )}
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="SupplierName">Supplier Name</Label>
                        <Select
                          id="SupplierName"
                          options={suppliers}
                          onChange={handleInputChange}
                          isSearchable
                          placeholder="Select Supplier"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="evaluationDate">Evaluation Date</Label>
                        <InputGroup className="input-group-alternative">
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="ni ni-calendar-grid-58" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <ReactDatetime
                            inputProps={{
                              placeholder: "Evaluation Date",
                              className: "form-control",
                            }}
                            timeFormat={false}
                            onChange={handleDateChange}
                          />
                        </InputGroup>
                      </FormGroup>
                    </Col>

                    <Col md="6">
                      <FormGroup>
                        <Label for="QualityNote">Quality Note</Label>
                        <input
                          id="QualityNote"
                          name="QualityNote"
                          type="number"
                          value={formData.QualityNote}
                          onChange={(e) =>
                            handleNumberInputChange(e, "QualityNote")
                          }
                          onBlur={calculateScore}
                          className="form-control"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="LogisticNote">Logistic Note</Label>
                        <input
                          id="LogisticNote"
                          name="LogisticNote"
                          type="number"
                          value={formData.LogisticNote}
                          onChange={(e) =>
                            handleNumberInputChange(e, "LogisticNote")
                          }
                          onBlur={calculateScore}
                          className="form-control"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="BillingError">Billing Error</Label>
                        <input
                          id="BillingError"
                          name="BillingError"
                          type="number"
                          value={formData.BillingError}
                          onChange={(e) =>
                            handleNumberInputChange(e, "BillingError")
                          }
                          onBlur={calculateScore}
                          className="form-control"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="PaymentTerm">Payment Term</Label>
                        <input
                          id="PaymentTerm"
                          name="PaymentTerm"
                          type="number"
                          value={formData.PaymentTerm}
                          onChange={(e) =>
                            handleNumberInputChange(e, "PaymentTerm")
                          }
                          onBlur={calculateScore}
                          className="form-control"
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="Score">Score</Label>
                        <input
                          id="Score"
                          name="Score"
                          type="number"
                          value={formData.Score}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Score: e.target.value,
                            })
                          }
                          disabled
                          className="form-control"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button type="submit" className="btn btn-primary">
                    Submit
                  </Button>
                </Form>
              </CardBody>
            </Col>
          </Row>
        </Container>
      </ModalBody>
    </Modal>
  );
};

export default AddEvaluation;
