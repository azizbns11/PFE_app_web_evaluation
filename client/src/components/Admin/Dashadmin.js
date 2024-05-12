import React, { useState, useEffect } from "react";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "./Dashboard.css";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";

const Dashadmin = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const currentYear = startYear + currentPage;

    months.forEach((month) => {
      columnHeaders.push(`${month} ${currentYear}`);
    });

    return columnHeaders;
  };

  const totalPages = endYear - startYear + 1;

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
        setEvaluations(response.data);
      } catch (error) {
        console.error("Error fetching evaluations:", error);
      }
    };

    fetchEvaluations();
  }, []);
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token missing");
        return;
      }

      const response = await fetch("http://localhost:8000/api/suppliers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch suppliers");
      }

      const data = await response.json();
      setSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <center>
        <Container
          className="mt--9"
          fluid
          style={{ backgroundColor: "#FFFAFA" }}
        >
          <Row className="mt-9">
            <Col className="d-flex justify-content-center" md={6}>
              {" "}
            
              <section>
                <section
                  id="bi-report"
                  style={{ width: "420%", height: "100px" }}
                >
                  <PowerBIEmbed
                    embedConfig={{
                      type: "report", // Since we are reporting a BI report, set the type to report
                      id: "37eea7d4-8c42-4ef6-93ff-7d3502885c29", // Add the report Id here
                      embedUrl:
                        "https://app.powerbi.com/reportEmbed?reportId=37eea7d4-8c42-4ef6-93ff-7d3502885c29&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtVVMtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7InVzYWdlTWV0cmljc1ZOZXh0Ijp0cnVlfX0%3d", // Add the embed url here
                      accessToken:
                        "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCIsImtpZCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvODRjMzFjYTAtYWMzYi00ZWFlLWFkMTEtNTE5ZDgwMjMzZTZmLyIsImlhdCI6MTcxNDU1OTk1NCwibmJmIjoxNzE0NTU5OTU0LCJleHAiOjE3MTQ1NjQ4ODYsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVlFBcS84V0FBQUFwQVpWYkhabk4ralp3MVl3VlF3dHhSOGVZZmRZZEs0TldxbDlGQTI1aTFsbXdiVytvQjhudTQxZEp2dUJoNDFRVGJlWW9ERWhDUW9jdUhYb2Q0ayt3bDVQUzIyd3h0Qm9sRlh6dU1aSjFFQT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiODcxYzAxMGYtNWU2MS00ZmIxLTgzYWMtOTg2MTBhN2U5MTEwIiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJUYWJiYXNzaSIsImdpdmVuX25hbWUiOiJBaGxlbSIsImlwYWRkciI6IjE2NS41MC4xMzYuMTQ1IiwibmFtZSI6IkFobGVtIFRhYmJhc3NpIiwib2lkIjoiODAxOGZmNGEtZjg2My00NmVjLTg5MTctYTM0MWM2ZGE4YjhmIiwicHVpZCI6IjEwMDMyMDAyOTgwMzg0QUQiLCJyaCI6IjAuQVFRQW9CekRoRHVzcms2dEVWR2RnQ00tYndrQUFBQUFBQUFBd0FBQUFBQUFBQUFFQUxnLiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IkxlOWU0SHJXTkx5WW1OWWRYS0J1V3gwa0VkZDIxendMTmRlLS02TUJGQTgiLCJ0aWQiOiI4NGMzMWNhMC1hYzNiLTRlYWUtYWQxMS01MTlkODAyMzNlNmYiLCJ1bmlxdWVfbmFtZSI6IkFobGVtLlRhYmJhc3NpQHN0dWRlbnRhbWJhc3NhZG9ycy5jb20iLCJ1cG4iOiJBaGxlbS5UYWJiYXNzaUBzdHVkZW50YW1iYXNzYWRvcnMuY29tIiwidXRpIjoiQ01VeElyQUVXa2V1dloxXzRsWXNBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il19.k9tla70MWO52mG-eAqiZevkM6OINIxju7MuLzchU64BJgBg3Ad5HO7UwA-5rYrKPrULyWTrkRHOeMKAoM_RUTjFOk8pBdvALo1MIiTad-VFwaAR6H0cqUUMhzteXz2BPjGXDFYbmksfREMLGLB1PtHSJ6vCy4EhqPn7tt8Vy3YFBbMW2QvMdLotmODoGGX6QFRCjNGJavuzvo6_l2AlLd_ns3-6g7MwrToYk3Q8zhzpfQqcwLmQooAr55cXGuMKAWLpbWX9AGgkam_ZtnACPTGsNYjo6caLZ347XT86mnd2GelCskoUAeR3KXVhqg82k3rLHYNB_BkauUiWYP_xPIg",
                      tokenType: models.TokenType.Aad, // Since we are using an Azure Active Directory access token, set the token type to Aad
                      settings: {
                        layoutType: models.LayoutType.FitToWidth,
                        panes: {
                          filters: {
                            expanded: false,
                            visible: false, // Hide the filter pane
                          },
                        },
                        background: models.BackgroundType.Transparent,
                        navContentPaneEnabled: false,
                      },
                    }}
                    eventHandlers={
                      new Map([
                        [
                          "loaded",
                          function () {
                            console.log("Report loaded");
                          },
                        ],
                        [
                          "rendered",
                          function () {
                            console.log("Report rendered");
                          },
                        ],
                        [
                          "error",
                          function (event) {
                            console.log(event.detail);
                          },
                        ],
                        ["visualClicked", () => console.log("visual clicked")],
                        ["pageChanged", (event) => console.log(event)],
                      ])
                    }
                    getEmbeddedComponent={(embeddedReport) => {
                      window.report = embeddedReport; // save report in window object
                    }}
                    cssClassName={"bi-embedded"}
                  />
                </section>
              </section>
            </Col>
          </Row>
          <Row style={{ marginTop: "600px" }}>
            <Col
              className="mb-5 mb-xl-0"
              xl="5"
              style={{ marginLeft: "250px" }}
            >
              {/*evaluation*/}
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h2 className="mb-0">Evaluations</h2>
                    </div>
                    <div className="col text-right">
                      <Link to="/admin/evaluations">
                        <Button color="primary" size="sm">
                          See all
                        </Button>
                      </Link>
                    </div>
                  </Row>
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
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier, index) => (
                        <tr key={index}>
                          <td>{supplier.groupName}</td>
                          {generateColumnHeaders().map((date, index) => {
                            const monthIndex = index + 1; // Month index starts from 1
                            const year = startYear + currentPage;
                            const monthHasEvaluation = evaluations.some(
                              (evaluation) => {
                                const evaluationDate = new Date(
                                  evaluation.evaluationDate
                                );
                                const evaluationMonth =
                                  evaluationDate.getMonth() + 1;
                                const evaluationYear =
                                  evaluationDate.getFullYear();
                                return (
                                  evaluationMonth === monthIndex &&
                                  evaluationYear === year &&
                                  evaluation.supplierId === supplier._id
                                );
                              }
                            );
                            return (
                              <td key={index}>
                                {monthHasEvaluation ? (
                                  <i className="fas fa-check text-success"></i>
                                ) : (
                                  <i className="fas fa-times text-danger"></i>
                                )}
                              </td>
                            );
                          })}
                          <td></td>
                        </tr>
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
            </Col>

            <Col className="mb-5 mb-xl-0" xl="5">
              {/*supp*/}
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h2 className="mb-0">Suppliers</h2>
                    </div>
                    <div className="col text-right">
                      <Link to="/admin/suppliers">
                        <Button color="primary" size="sm">
                          See all
                        </Button>
                      </Link>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody className="p-0">
                  <div style={{ overflowY: "auto", maxHeight: "400px" }}>
                    <Table
                      className="align-items-center table-flush mb-0"
                      responsive
                    >
                      <thead className="thead-light">
                        <tr>
                          <th scope="col">Logo</th>
                          <th scope="col">Group Name</th>
                          <th scope="col">Address</th>
                          <th scope="col">Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : (
                          suppliers.map((supplier, index) => (
                            <tr key={index}>
                              <td>
                                <img
                                  src={`http://localhost:8000/${supplier.image}`}
                                  alt={`${supplier.groupName} `}
                                  style={{ width: "50px", height: "50px" }}
                                />
                              </td>
                              <td>{supplier.groupName}</td>
                              <td>{supplier.address}</td>
                              <td>{supplier.country}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </center>
      <br />
      <br />
    </div>
  );
};

export default Dashadmin;
