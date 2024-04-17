import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Container,
  Row,
  Card,
  CardHeader,
  Input,
  InputGroup,
  Button,
} from "reactstrap";

const EvaluationDetails = ({ supplierId }) => {
  
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchYear, setSearchYear] = useState("");
  const [editMode, setEditMode] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return `${months[monthIndex]} ${year}`;
  };

  const getScoreColor = (score) => {
    if (score > 85) return "green";
    else if (score >= 70 && score <= 85) return "orange";
    else return "red";
  };

  const startYear = 2024;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const totalPages = 3000 - startYear + 1;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!supplierId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Authentication token missing");
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/evaluations/supplier/${supplierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEvaluationsData(response.data);
      } catch (error) {
        console.error("Failed to fetch evaluations:", error);
      }
    };

    fetchEvaluations();
  }, [supplierId]);

  const generateColumnHeaders = () => {
    const columnHeaders = [];
    const currentYear = startYear + currentPage;

    months.forEach((month) => {
      columnHeaders.push(`${month} ${currentYear}`);
    });

    return columnHeaders;
  };

  const handleSearchChange = (e) => {
    setSearchYear(e.target.value);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        evaluationsData.map(async (evaluation) => {
          try {
            const { _id, QualityNote, LogisticNote, BillingError, PaymentTerm } = evaluation;
            const score =
              parseFloat(QualityNote || 0) * 0.4 +
              parseFloat(LogisticNote || 0) * 0.3 +
              parseFloat(BillingError || 0) * 0.15 +
              parseFloat(PaymentTerm || 0) * 0.15;

            const response = await axios.put(
              `http://localhost:8000/api/evaluations/${_id}`,
              {
                QualityNote,
                LogisticNote,
                BillingError,
                PaymentTerm,
                Score: score.toFixed(2)
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Response from server:", response.data);
          } catch (error) {
            console.error("Failed to update evaluation:", error);
          }
        })
      );

      const updatedDataResponse = await axios.get(
        `http://localhost:8000/api/evaluations/supplier/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvaluationsData(updatedDataResponse.data);
      console.log("Data updated successfully");

      setEditMode(false);
    } catch (error) {
      console.error("Failed to update data:", error);
    }
  };

  return (
    <Container fluid>
      <Row>
        <div className="col-xl-12">
          <Card className="shadow mt-3">
            <CardHeader className="d-flex justify-content-between align-items-center border-0">
              <h3 className="mb-0">Evaluations</h3>
              <div className="d-flex align-items-center">
                <InputGroup style={{ maxWidth: "300px", marginRight: "10px" }}>
                  <Input
                    type="text"
                    placeholder="Search by year..."
                    className="mr-2"
                    style={{
                      fontSize: "0.875rem",
                      height: "calc(1.5em + .75rem + 2px)",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "0.375rem",
                    }}
                    value={searchYear}
                    onChange={handleSearchChange}
                  />
                </InputGroup>
                {editMode ? (
                  <Button
                    outline
                    color="primary"
                    style={{
                      padding: "0.2rem 0.4rem",
                      fontSize: "0.8rem",
                    }}
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    outline
                    color="primary"
                    style={{
                      padding: "0.2rem 0.4rem",
                      fontSize: "0.8rem",
                    }}
                    onClick={toggleEditMode}
                  >
                    <i className="fa fa-pencil" aria-hidden="true"></i>
                  </Button>
                )}
              </div>
            </CardHeader>
            <div className="table-responsive">
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col"></th>
                    {generateColumnHeaders().map((header, index) => (
                      <th
                        key={index}
                        scope="col"
                        style={{ paddingRight: "0.1px" }}
                      >
                        {header}
                      </th>
                    ))}
                    <th scope="col">
                      <strong>Total</strong>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Quality Note</td>
                    {generateColumnHeaders().map((header, index) => {
                      const noteIndex = evaluationsData.findIndex(
                        (evaluation) =>
                          formatDate(evaluation.evaluationDate) === header &&
                          evaluation.QualityNote !== undefined
                      );
                      const note = evaluationsData[noteIndex];
                      return (
                        <td key={index}>
                          {editMode && note ? (
                            <Input
                              type="text"
                              value={note.QualityNote}
                              onChange={(e) => {
                                const updatedNote = e.target.value;
                                const updatedEvaluationsData = [...evaluationsData];
                                updatedEvaluationsData[noteIndex] = {
                                  ...note,
                                  QualityNote: updatedNote,
                                };
                                setEvaluationsData(updatedEvaluationsData);
                              }}
                              style={{ width: "155%", fontSize: "1rem" }}
                            />
                          ) : (
                            note ? note.QualityNote : "-"
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                  <tr>
                    <td>Logistic Note</td>
                    {generateColumnHeaders().map((header, index) => {
                      const noteIndex = evaluationsData.findIndex(
                        (evaluation) =>
                          formatDate(evaluation.evaluationDate) === header &&
                          evaluation.LogisticNote !== undefined
                      );
                      const note = evaluationsData[noteIndex];
                      return (
                        <td key={index}>
                          {editMode && note ? (
                            <Input
                              type="text"
                              value={note.LogisticNote}
                              onChange={(e) => {
                                const updatedNote = e.target.value;
                                const updatedEvaluationsData = [...evaluationsData];
                                updatedEvaluationsData[noteIndex] = {
                                  ...note,
                                  LogisticNote: updatedNote,
                                };
                                setEvaluationsData(updatedEvaluationsData);
                              }}
                              style={{ width: "155%", fontSize: "1rem" }}
                            />
                          ) : (
                            note ? note.LogisticNote : "-"
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                  <tr>
                    <td>Billing Error</td>
                    {generateColumnHeaders().map((header, index) => {
                      const noteIndex = evaluationsData.findIndex(
                        (evaluation) =>
                          formatDate(evaluation.evaluationDate) === header &&
                          evaluation.BillingError !== undefined
                      );
                      const note = evaluationsData[noteIndex];
                      return (
                        <td key={index}>
                          {editMode && note ? (
                            <Input
                              type="text"
                              value={note.BillingError}
                              onChange={(e) => {
                                const updatedNote = e.target.value;
                                const updatedEvaluationsData = [...evaluationsData];
                                updatedEvaluationsData[noteIndex] = {
                                  ...note,
                                  BillingError: updatedNote,
                                };
                                setEvaluationsData(updatedEvaluationsData);
                              }}
                              style={{ width: "155%", fontSize: "1rem" }}
                            />
                          ) : (
                            note ? note.BillingError : "-"
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                  <tr>
                    <td>Payment Term</td>
                    {generateColumnHeaders().map((header, index) => {
                      const noteIndex = evaluationsData.findIndex(
                        (evaluation) =>
                          formatDate(evaluation.evaluationDate) === header &&
                          evaluation.PaymentTerm !== undefined
                      );
                      const note = evaluationsData[noteIndex];
                      return (
                        <td key={index}>
                          {editMode && note ? (
                            <Input
                              type="text"
                              value={note.PaymentTerm}
                              onChange={(e) => {
                                const updatedNote = e.target.value;
                                const updatedEvaluationsData = [...evaluationsData];
                                updatedEvaluationsData[noteIndex] = {
                                  ...note,
                                  PaymentTerm: updatedNote,
                                };
                                setEvaluationsData(updatedEvaluationsData);
                              }}
                              style={{ width: "155%", fontSize: "1rem" }}
                            />
                          ) : (
                            note ? note.PaymentTerm : "-"
                          )}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                  <tr>
                    <td>Score</td>
                    {generateColumnHeaders().map((header, index) => {
                      const score = evaluationsData
                        .filter(
                          (evaluation) =>
                            formatDate(evaluation.evaluationDate) === header
                        )
                        .reduce(
                          (acc, evaluation) =>
                            acc +
                            parseFloat(evaluation.QualityNote || 0) * 0.4 +
                            parseFloat(evaluation.LogisticNote || 0) * 0.3 +
                            parseFloat(evaluation.BillingError || 0) * 0.15 +
                            parseFloat(evaluation.PaymentTerm || 0) * 0.15,
                          0
                        )
                        .toFixed(2);

                      return (
                        <td
                          key={index}
                          style={{ color: getScoreColor(score) }}
                        >
                          {score}
                        </td>
                      );
                    })}
                    <td></td>
                  </tr>
                </tbody>
              </Table>
              <div className="text-right">
                {currentPage > 0 && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handlePrevPage}
                  >
                    Previous
                  </button>
                )}
                {currentPage < totalPages - 1 && (
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleNextPage}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Row>
    </Container>
  );
};

export default EvaluationDetails;