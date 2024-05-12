import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  Container,
  Row,
} from "reactstrap";
import AddEvaluation from "./AddEvaluation";
import axios from "axios";

const Evaluations = () => {
  const [searchYear, setSearchYear] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
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
        setUserRole(response.data.role);
        if (response.data._id) {
          setUserId(response.data._id);
        }
      } catch (error) {
        console.error("Error fetching user information:", error.message);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/evaluations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

       
        let filteredEvaluations = response.data;
        if (searchYear !== "") {
          const searchedYear = parseInt(searchYear);
          filteredEvaluations = filteredEvaluations.filter((evaluation) => {
            const evaluationDate = new Date(evaluation.evaluationDate);
            return evaluationDate.getFullYear() === searchedYear;
          });
        } else {
          const currentYear = new Date().getFullYear();
          filteredEvaluations = filteredEvaluations.filter((evaluation) => {
            const evaluationDate = new Date(evaluation.evaluationDate);
            return evaluationDate.getFullYear() === currentYear;
          });
        }

       
        console.log("Filtered Evaluations:", filteredEvaluations);

      
        if (userRole === "supplier" && userId) {
          filteredEvaluations = filteredEvaluations.filter(
            (evaluation) => evaluation.supplierId === userId
          );
        }

        setEvaluations(filteredEvaluations);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [searchYear, userRole, userId]);

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
        setSuppliers(
          response.data.map((supplier) => ({
            value: supplier._id,
            label: supplier.groupName,
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const startYear = 2024;
  const endYear = 3000;

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

  const generateColumnHeaders = () => {
    const columnHeaders = [];
    const currentYear =
      searchYear !== "" ? parseInt(searchYear) : startYear + currentPage;

    months.forEach((month) => {
      columnHeaders.push(`${month} ${currentYear}`);
    });

    return columnHeaders;
  };

  const totalPages = 3000 - 2024 + 1;

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
  const getPerformanceLevel = (score) => {
    if (score < 70) {
      return "low";
    } else if (score >= 70 && score < 85) {
      return "medium";
    } else {
      return "high";
    }
  };

  const handleSearchChange = (e) => {
    setSearchYear(e.target.value);
  };

  const calculateTotalScore = (supplier) => {
    let totalScore = 0;
    let totalMonths = 0;

   
    const filteredSupplierEvaluations = evaluations.filter((evaluation) => {
      return evaluation.SupplierName === supplier;
    });

  
    filteredSupplierEvaluations.forEach((evaluation) => {
      totalScore += evaluation.Score || 0; 
      totalMonths++; 
    });


    const averageScore = totalMonths > 0 ? totalScore / totalMonths : 0;

  
    return averageScore.toFixed(2); 
  };

  const evaluationScores = {};
  evaluations.forEach((evaluation) => {
    const d = new Date(evaluation.evaluationDate);
    d.setUTCDate(1);
    const formattedDate = `${d.toLocaleString("default", {
      month: "short",
    })} ${d.getFullYear()}`;
    const key = `${evaluation.SupplierName}-${formattedDate}`;
    evaluationScores[key] = {
      score: evaluation.Score,
      performance: getPerformanceLevel(evaluation.Score),
    };
  });

  const updateEvaluationsList = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8000/api/evaluations",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvaluations(response.data);
    } catch (error) {
      console.error("Error updating evaluations list:", error.message);
    }
  };

  const Legend = () => (
    <div>
      <span className="badge bg-danger mr-2 text-white">Low</span>
      <span className="badge bg-warning mr-2 text-white">Medium</span>
      <span className="badge bg-success text-white">High</span>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#FFFAFA", minHeight: "86vh" }}>
    <Container fluid>
      <Row>
        <div className="col-xl-12">
          <Card className="shadow mt-5" style={{ marginLeft: "250px" }}>
            <CardHeader className="d-flex justify-content-between align-items-center border-0" >
              <h3 className="mb-0">Evaluations</h3>
            
              <InputGroup style={{ maxWidth: "300px" }}>
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
                  onChange={(e) => setSearchYear(e.target.value)}
                />
                {userRole !== "supplier" && (
                  <InputGroupAddon addonType="append">
                    <InputGroupText
                      style={{ cursor: "pointer", padding: "0.375rem" }}
                      onClick={() => setAddModalOpen(true)}
                    >
                      <i
                        className="fa fa-plus"
                        aria-hidden="true"
                        style={{ fontSize: "0.8rem" }}
                      ></i>{" "}
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
                  {suppliers.map((supplier, index) => (
                    <React.Fragment key={index}>
                      {(userRole === "supplier" && supplier.value === userId) ||
                      userRole !== "supplier" ? (
                        <tr>
                          <td>
                            {userRole === "supplier" &&
                            supplier.value === userId
                              ? supplier.label
                              : supplier.label}
                          </td>
                          {generateColumnHeaders().map((date, index) => {
                            const evaluationKey = `${supplier.label}-${date}`;
                            const evaluationData =
                              evaluationScores[evaluationKey];
                            let performanceClass = "";

                            if (evaluationData) {
                              const { score } = evaluationData;
                              if (score < 70) {
                                performanceClass = "bg-danger";
                              } else if (score >= 70 && score < 85) {
                                performanceClass = "bg-warning";
                              } else if (score >= 85 && score <= 100) {
                                performanceClass = "bg-success";
                              }
                            }

                            return (
                              <td
                                key={index}
                                className={`${performanceClass} text-white`}
                              >
                                {evaluationData?.score || "-"}
                              </td>
                            );
                          })}
                          <td>
                            <span
                              className={`${
                                calculateTotalScore(supplier.label) > 85
                                  ? "bg-success"
                                  : calculateTotalScore(supplier.label) < 70
                                  ? "bg-danger"
                                  : "bg-warning"
                              } text-white`}
                            >
                              {calculateTotalScore(supplier.label)}
                            </span>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
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
          </Card>
        </div>
      </Row>
      {userRole !== "supplier" && (
        <AddEvaluation
          isOpen={addModalOpen}
          toggle={() => setAddModalOpen(!addModalOpen)}
          updateEvaluationsList={updateEvaluationsList}
        />
      )}

      <div className="mt-4 text-right">
        <Legend />
      </div>
    </Container>
    </div>
  );
};

export default Evaluations;
