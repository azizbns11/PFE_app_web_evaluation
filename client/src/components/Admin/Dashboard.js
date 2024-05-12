import React, { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { chartOptions, parseOptions } from "../../variables/charts";
import axios from "axios";
import { differenceInDays } from "date-fns";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Progress,
  Button,
} from "reactstrap";
import { Link } from "react-router-dom";

const AdminDashboard = (props) => {
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [evaluations, setEvaluations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [protocolStatusData, setProtocolStatusData] = useState({
    valid: 0,
    invalid: 0,
    validating: 0,
  });
  useEffect(() => {
    const fetchTopSuppliers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/top", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTopSuppliers(response.data); // Assuming response.data contains an array of objects with SupplierName and avgScore properties
      } catch (error) {
        console.error("Error fetching top suppliers:", error);
      }
    };

    fetchTopSuppliers();
  }, []);

  useEffect(() => {
    const fetchTotalSuppliers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8000/api/total-suppliers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setTotalSuppliers(data.totalSuppliers);
      } catch (error) {
        console.error("Error fetching total suppliers:", error);
      }
    };

    fetchTotalSuppliers();
  }, []);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8000/api/total-employees",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setTotalEmployees(data.totalEmployees);
      } catch (error) {
        console.error("Error fetching total Employees:", error);
      }
    };

    fetchTotalEmployees();
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
  useEffect(() => {
    fetchProtocolStatusData();
  }, []);
  const fetchProtocolStatusData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/api/protocols/status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Protocol Status Data Response:", response.data);

      const statusCounts = response.data.reduce((counts, status) => {
        counts[status] = (counts[status] || 0) + 1;
        return counts;
      }, {});

      setProtocolStatusData({
        validating: statusCounts["is being validated"] || 0,
        valid: statusCounts["validated"] || 0,
        invalid: statusCounts["invalid"] || 0,
      });
    } catch (error) {
      console.error("Error fetching protocol status data:", error);
    }
  };

  if (window.Chart) {
    parseOptions(window.Chart, chartOptions());
  }

  const chartExample1 = {
    labels: ["Total Suppliers", "Remaining"],
    datasets: [
      {
        data: [totalSuppliers, 100 - totalSuppliers],
        backgroundColor: ["#FF6384", "#48D1CC"],
        hoverBackgroundColor: ["#FF6384", "#B0E0E6"],
        hoverBorderWidth: 10,
      },
    ],
  };

  const chartExample3 = {
    labels: ["Total Employees", "Remaining"],
    datasets: [
      {
        data: [totalEmployees, 100 - totalEmployees],
        backgroundColor: ["#FF6384", "#48D1CC"],
        hoverBackgroundColor: ["#FF6384", "#B0E0E6"],
        hoverBorderWidth: 10,
      },
    ],
  };

  const chartExample2 = {
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              callback: function (value) {
                if (!(value % 10)) {
                  return value;
                }
              },
            },
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (item, data) {
            var label = data.datasets[item.datasetIndex].label || "";
            var yLabel = item.yLabel;
            var content = "";
            if (data.datasets.length > 1) {
              content += label;
            }
            content += yLabel;
            return content;
          },
        },
      },
    },
    data: {
      labels: topSuppliers.map((supplier) => supplier.SupplierName),
      datasets: [
        {
          label: "Average Score",
          data: topSuppliers.map((supplier) => supplier.avgScore),
          maxBarThickness: 10,
        },
      ],
    },
  };
  
  
  const chartExample4 = {
    labels: ["Valid", "Invalid", "Being Validated"],
    datasets: [
      {
        label: "Protocols",
        data: [
          protocolStatusData.valid,
          protocolStatusData.invalid,
          protocolStatusData.validating,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
        hoverBackgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
        ],
        hoverBorderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
            gridLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        ],
      },

      animation: {
        animateScale: true,
        animateRotate: true,
      },
    },
  };

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
        DaysUntilExpiration: calculateDaysUntilExpiration(
          certificate.ExpireDate
        ),
      }));
      setCertificates(formattedCertificates);
      setFilteredCertificates(formattedCertificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
  };

  const calculateDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    return differenceInDays(expiration, today);
  };
  const getCertificateProgressColor = (daysUntilExpiration) => {
    if (daysUntilExpiration <= 30) {
      return "danger"; // Expire date < 30 days
    } else if (daysUntilExpiration >= 90) {
      return "success"; // Expire date > 90 days
    } else {
      return "warning"; // 30 < Expire date < 90 days
    }
  };
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

  const handleExportButtonClick = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Set response type to blob for file download
      });

      // Create a Blob object from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary <a> element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data.xlsx"); // Set the download attribute with desired file name
      document.body.appendChild(link);

      // Trigger the click event on the link
      link.click();

      // Cleanup: remove the temporary link and revoke the temporary URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <>
      <Container className="mt--9" fluid style={{ backgroundColor: "#FFFAFA" }}>
        <Row className="mt-9 ">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="4">
          <div style={{ marginBottom: '20px',marginTop:'20px'}}>
      <Button color="primary" size="xl" onClick={handleExportButtonClick}>
        Export Data
      </Button>
    </div>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-0">
                      Overview
                    </h6>
                  </div>
                </Row>
              </CardHeader>
              <CardBody style={{ padding: "0.5rem" }}>
                <Row>
                  <Col xl="6" className="mb-0">
                    <div
                      className="text-center"
                      style={{ margin: "-0.8rem 0" }}
                    >
                      <h5 className="mb-0">Total Suppliers</h5>
                      <div className="chart">
                        <Doughnut
                          data={chartExample1}
                          options={{
                            ...chartOptions,
                            cutoutPercentage: 60,
                          }}
                        />
                      </div>
                    </div>
                  </Col>

                  <Col xl="6" className="mb-0">
                    <div
                      className="text-center"
                      style={{ margin: "-0.8rem 0" }}
                    >
                      <h5 className="mb-0">Total Employees</h5>
                      <div className="chart">
                        <Doughnut
                          data={chartExample3}
                          options={{
                            ...chartOptions,
                            cutoutPercentage: 60,
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xl="6">
            
            <Card className="shadow">
              
              <CardHeader className="bg-transparent">
              <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0">Protocols</h2>
                  </div>
                  <div className="col text-right">
                    <Link to="/Protocol">
                      <Button color="primary" size="sm">
                        See all
                      </Button>
                    </Link>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar data={chartExample4}  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="7">
            {/*certif*/}
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h2 className="mb-0">Certificates</h2>
                  </div>
                  <div className="col text-right">
                    <Link to="/admin/certificates">
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
                      <th scope="col">Supplier</th>
                      <th scope="col">Certificate Name</th>
                      <th scope="col">Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((certificate) => (
                      <tr key={certificate._id}>
                        <td>{certificate.SupplierName}</td>
                        <td>{certificate.CertificateName}</td>
                        <td>
                          <Progress
                            value={
                              certificate.DaysUntilExpiration <= 0
                                ? 100
                                : certificate.DaysUntilExpiration > 90
                                ? 30
                                : certificate.DaysUntilExpiration <= 60
                                ? 50
                                : 70
                            }
                            color={getCertificateProgressColor(
                              certificate.DaysUntilExpiration
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          </Col>

          <Col xl="3">
            {/*top supp*/}
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Performance
                    </h6>
                    <h2 className="mb-0">Top Suppliers</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="5">
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
                                src={supplier.image}
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

          <Col xl="5">
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
          <Col></Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;
