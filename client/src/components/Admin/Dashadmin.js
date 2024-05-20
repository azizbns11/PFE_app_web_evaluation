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
        <div><center>
<Container className="mt--9"  fluid style={{ backgroundColor: "#FFFAFA" }}>
    <Row className="mt-9">
        <Col  md={12} >
        <section style={{ width: '80%', height: '100px'}} > 
        <iframe title="pfedashboard" width="110%" height="630px" src="https://app.powerbi.com/reportEmbed?reportId=37eea7d4-8c42-4ef6-93ff-7d3502885c29&autoAuth=true&ctid=84c31ca0-ac3b-4eae-ad11-519d80233e6f&navContentPaneEnabled=false&filterPaneEnabled=false&$filter=Query2/Name eq 'Type2'" 
        frameborder="0" allowFullScreen="true" style={{ marginLeft: "30px" , border:"none"}}>
                </iframe>
        </section>
    </Col>
    </Row></Container>
    <br/>
    <Container className="mt--9" fluid style={{ backgroundColor: "#FFFAFA" }}>
    <br/><br/><br/><br/>
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