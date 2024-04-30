import React, { useState, useEffect } from "react";
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import './Dashboard.css'
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
      

     



    return( 
        <div><center><Container className="mt--9" fluid style={{ backgroundColor: "#FFFAFA" }}>
    <Row className="mt-9">
        <Col className="d-flex justify-content-center" md={6}> {/* Adjust the column width as needed */}
            <section >
        <section id="bi-report" style={{ width: '420%', height: '100px' }}> 
            <PowerBIEmbed
                embedConfig = {{
                    type: 'report',   // Since we are reporting a BI report, set the type to report
                    id: '62936c04-adb1-42d0-bf68-215881d1e690', // Add the report Id here
                    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=62936c04-adb1-42d0-bf68-215881d1e690&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVNPVVRILUFGUklDQS1OT1JUSC1BLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7InVzYWdlTWV0cmljc1ZOZXh0Ijp0cnVlfX0%3d", // Add the embed url here
                    accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCIsImtpZCI6IkwxS2ZLRklfam5YYndXYzIyeFp4dzFzVUhIMCJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNTAzMzI0MTMtZjQ5ZC00Y2E5LTkxNDktMDQ1NmVhMWIyMzdjLyIsImlhdCI6MTcxNDQ3MzEyMywibmJmIjoxNzE0NDczMTIzLCJleHAiOjE3MTQ0Nzc4ODgsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBVlFBcS84V0FBQUFubHd5ZElKc2FYWlhVMkR2Rk1lUXdFWG9iWEZMcGJSa1UrV2ExTWU3RTBPR2haTzJKQjVPSk9YT2dvZzAzd205M2k4NC9DL204bEFXeGpEaGZzYjA1bGV0NS9NV3VDNzBHZnArWloybEFFUT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiODcxYzAxMGYtNWU2MS00ZmIxLTgzYWMtOTg2MTBhN2U5MTEwIiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJiZW5zYWxlbSIsImdpdmVuX25hbWUiOiJBeml6IiwiaXBhZGRyIjoiMTYwLjE1OS4yMTAuNjAiLCJuYW1lIjoiQXppeiBiZW5zYWxlbSIsIm9pZCI6IjE1MmRlNjY1LWZlZWEtNDQ0OS04ZGMxLWJhMjgzYjVjMDgwNSIsInB1aWQiOiIxMDAzMjAwMzczMTUzM0JCIiwicmgiOiIwLkFhOEFFeVF6VUozMHFVeVJTUVJXNmhzamZBa0FBQUFBQUFBQXdBQUFBQUFBQUFBZEFkVS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJvSExKa2hCRzduOTROcjlNNmY5ZlJuekJYdTMxNFJ4bUJ1Z0wxVUhvckxNIiwidGlkIjoiNTAzMzI0MTMtZjQ5ZC00Y2E5LTkxNDktMDQ1NmVhMWIyMzdjIiwidW5pcXVlX25hbWUiOiJBeml6YmVuc2FsZW1ASVNJTU01MTgub25taWNyb3NvZnQuY29tIiwidXBuIjoiQXppemJlbnNhbGVtQElTSU1NNTE4Lm9ubWljcm9zb2Z0LmNvbSIsInV0aSI6IjR2Vm1ibzNwWGtHWFRvU1BPNGFDQVEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbIjYyZTkwMzk0LTY5ZjUtNDIzNy05MTkwLTAxMjE3NzE0NWUxMCIsImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfcGwiOiJmciJ9.d_m6Ts7PvxOwiWo5FclVhip1RoqDiOJ0hzDG0udy6JWf8MhCw3STaDfMYdIRslSz_shX0xdlGGkKaTVg7xUUOeir69MT_PfoDwYvGNl2bwFyadqD0PL5G9KTZjnHutPvRwNrJ4tsDxcmQi-rnPxrW_Rn5UFBpGx5M5gD1l7u38SUTFXCTJ1rGBH6JAFI1ZieN-vjz7dWVsRMhMd1oyvrQB0gvkWpcUIMLgxDBwA3FysdRwawI5I8egoKC4QGO18WT7k904dFsD4GfBKA0dW4CpfQl9T9z1gXeoLBUWErySuSJZMKqN7hDCk_pnETML73F76UKFYFIfZgVwacK0EfrA', // Add the access token here
                    tokenType: models.TokenType.Aad, // Since we are using an Azure Active Directory access token, set the token type to Aad
                    settings: {
                        layoutType: models.LayoutType.FitToWidth,
                        panes: {
                            filters: {
                                expanded: false,
                                visible: false // Hide the filter pane
                            }
                        },
                        background: models.BackgroundType.Transparent,
                        navContentPaneEnabled: false
                    }
                }}

                eventHandlers = {
                    new Map([
                        ['loaded', function () {console.log('Report loaded');}],
                        ['rendered', function () {console.log('Report rendered');}],
                        ['error', function (event) {console.log(event.detail);}],
                        ['visualClicked', () => console.log('visual clicked')],
                        ['pageChanged', (event) => console.log(event)],
                    ])
                }

            

                getEmbeddedComponent = { (embeddedReport) => {
                    window.report = embeddedReport; // save report in window object
                }}
                cssClassName = { "bi-embedded" }
            />
        </section>
    </section>
    </Col>
    </Row>
    <Row style={{ marginTop: "600px" }}>
    <Col className="mb-5 mb-xl-0" xl="5" style={{ marginLeft: "250px" }}>
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
    <br/><br/>
    
    </div>
            )}



export default Dashadmin;