import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { format, getMonth, getYear, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { chartOptions, parseOptions } from "../../variables/charts";
import useAuth from "../../hooks/useAuth";
import {
  Container,
  Row,
  Col,
  Card,
  Progress,
  Button,
  Table,
  CardHeader,
  CardTitle,
  CardBody,
  Nav,
} from "reactstrap";
import { Bar } from "react-chartjs-2";
const SupplierDashboard = () => {
  const { user } = useAuth();
  const [supplierId, setSupplierId] = useState("");
  const [evaluationData, setEvaluationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [qualityNote, setQualityNote] = useState("");
  const [logisticNote, setLogisticNote] = useState("");
  const [BillingErrorNote, setBillingErrorNote] = useState("");
  const [paymentTermNote, setPaymentTermNote] = useState("");
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const DISPLAY = true;
  const BORDER = true;
  const CHART_AREA = true;
  const TICKS = true;
  const [protocolStatusData, setProtocolStatusData] = useState({
    valid: 0,
    invalid: 0,
    validating: 0,
  });

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

        const evaluationScores = response.data.reduce((acc, evaluation) => {
          const month = getMonth(new Date(evaluation.evaluationDate));
          const year = getYear(new Date(evaluation.evaluationDate));
          const key = `${year}-${month}`;
          if (!acc[key]) {
            acc[key] = {
              month: format(new Date(evaluation.evaluationDate), "MMM"),
              quality: [],
              logistic: [],
              billing: [],
              paymentTerm: [],
              score: [],
              notes: [],
            };
          }
          acc[key].quality.push(evaluation.QualityNote);
          acc[key].logistic.push(evaluation.LogisticNote);
          acc[key].billing.push(evaluation.BillingError);
          acc[key].paymentTerm.push(evaluation.PaymentTerm);
          acc[key].score.push(evaluation.Score);
          acc[key].notes.push({
            QualityNote: evaluation.QualityNote,
            LogisticNote: evaluation.LogisticNote,
            BillingErrorNote: evaluation.BillingErrorNote,
            PaymentTermNote: evaluation.PaymentTermNote,
          });
          return acc;
        }, {});
        console.log("evaluationData.labels:", evaluationData.labels); 
        console.log("Current month:", format(new Date(), "MMM")); 

        const allMonthsLabels = Array.from({ length: 12 }, (_, index) =>
          format(new Date(0, index), "MMM")
        );
        const chartData = {
          labels: allMonthsLabels,
          datasets: [
            {
              label: "Quality",
              data: allMonthsLabels.map((month) => {
                const key = Object.keys(evaluationScores).find(
                  (key) => evaluationScores[key].month === month
                );
                return key
                  ? evaluationScores[key].quality.reduce((a, b) => a + b, 0) /
                      evaluationScores[key].quality.length
                  : 0;
              }),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Logistic",
              data: allMonthsLabels.map((month) => {
                const key = Object.keys(evaluationScores).find(
                  (key) => evaluationScores[key].month === month
                );
                return key
                  ? evaluationScores[key].logistic.reduce((a, b) => a + b, 0) /
                      evaluationScores[key].logistic.length
                  : 0;
              }),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Billing Error",
              data: allMonthsLabels.map((month) => {
                const key = Object.keys(evaluationScores).find(
                  (key) => evaluationScores[key].month === month
                );
                return key
                  ? evaluationScores[key].billing.reduce((a, b) => a + b, 0) /
                      evaluationScores[key].billing.length
                  : 0;
              }),
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Payment Term",
              data: allMonthsLabels.map((month) => {
                const key = Object.keys(evaluationScores).find(
                  (key) => evaluationScores[key].month === month
                );
                return key
                  ? evaluationScores[key].paymentTerm.reduce(
                      (a, b) => a + b,
                      0
                    ) / evaluationScores[key].paymentTerm.length
                  : 0;
              }),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Total Score",
              data: allMonthsLabels.map((month) => {
                const key = Object.keys(evaluationScores).find(
                  (key) => evaluationScores[key].month === month
                );
                return key
                  ? evaluationScores[key].score.reduce((a, b) => a + b, 0) /
                      evaluationScores[key].score.length
                  : 0;
              }),
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "transparent",
            },
          ],
        };

        setEvaluationData(chartData);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const currentMonthEvaluations = response.data.filter((evaluation) => {
          const evaluationDate = new Date(evaluation.evaluationDate);
          return (
            evaluationDate.getMonth() === currentMonth &&
            evaluationDate.getFullYear() === currentYear
          );
        });

        // Set notes for the current month
        const qualityNote =
          currentMonthEvaluations.length > 0
            ? currentMonthEvaluations[0].QualityNote
            : "";
        const logisticNote =
          currentMonthEvaluations.length > 0
            ? currentMonthEvaluations[0].LogisticNote
            : "";
        const billingErrorNote =
          currentMonthEvaluations.length > 0
            ? currentMonthEvaluations[0].BillingError
            : "";
        const paymentTermNote =
          currentMonthEvaluations.length > 0
            ? currentMonthEvaluations[0].PaymentTerm
            : "";

      
        setQualityNote(qualityNote);
        setLogisticNote(logisticNote);
        setBillingErrorNote(billingErrorNote);
        setPaymentTermNote(paymentTermNote);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

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

  const calculateDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    return differenceInDays(expiration, today);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
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
  useEffect(() => {
   
    if (user && user.id) {
      fetchProtocolStatusData(user.id);
    }
  }, [user]);

  const fetchProtocolStatusData = async (userId) => {
    try {
      if (!userId) {
        console.error("User ID is null or undefined");
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/api/protocols/supplier/${userId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

   
      const statusCounts = response.data.reduce((counts, protocol) => {
        counts[protocol.status] = (counts[protocol.status] || 0) + 1;
        return counts;
      }, {});

    
      setProtocolStatusData({
        valid: statusCounts["validated"] || 0,
        invalid: statusCounts["invalid"] || 0,
        validating: statusCounts["is being validated"] || 0,
      });
    } catch (error) {
      console.error("Error fetching protocol status data:", error);
    }
  };

  if (window.Chart) {
    parseOptions(window.Chart, chartOptions());
  }
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
              color: "rgba(255, 255, 0, 0.1)",
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
  

  return (
    <>
      <br />
      <br />
      <Container
        className="mt--8"
        fluid
        style={{ minHeight: "100vh", backgroundColor: "#FFFAFA" }}
      >
        <div className="header-body">
          <Row className="mt-9">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {evaluationData.labels.includes(format(new Date(), "MMM")) ? (
                  <>
                    <Col lg="6" xl="2" className="ml-auto">
                      <Card
                        className="card-stats mb-4 mb-xl-0"
                        style={{ backgroundColor: "#0d73e1", boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)" }}
                      >
                        <CardBody>
                          <Row>
                            <div className="col">
                              <CardTitle
                                tag="h5"
                                className="text-uppercase text-white mb-0"
                              >
                                Quality Note
                              </CardTitle>
                              <span className="h2 font-weight-bold text-dark mb-0">
                                {qualityNote}
                              </span>
                            </div>
                            <Col className="col-auto">
                              <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                <i
                                  className="fa-solid fa-medal"
                                  aria-hidden="true"
                                ></i>
                              </div>
                            </Col>
                          </Row>
                          <p className="mt-3 mb-0 text-white text-sm">
                            <span className="text-success mr-2">
                              <i className="fa fa-arrow-up" />
                            </span>{" "}
                            <span className="text-nowrap">this month</span>
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col lg="6" xl="2" className="ml-6">
                      <Card
                        className="card-stats mb-4 mb-xl-0"
                        style={{ backgroundColor: "#0d73e1", boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)" }}
                      >
                        <CardBody>
                          <Row>
                            <div className="col">
                              <CardTitle
                                tag="h5"
                                className="text-uppercase text-white mb-0"
                              >
                                Payment Term Note
                              </CardTitle>
                              <span className="h2 font-weight-bold text-dark mb-0">
                                {paymentTermNote}
                              </span>
                            </div>
                            <Col className="col-auto">
                              <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                <i class="fa-solid fa-credit-card"></i>
                              </div>
                            </Col>
                          </Row>
                          <p className="mt-3 mb-0 text-white text-sm">
                            <span className="text-success mr-2">
                              <i className="fa fa-arrow-up" />
                            </span>{" "}
                            <span className="text-nowrap">this month</span>
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col lg="6" xl="2" className="ml-6">
                      <Card
                        className="card-stats mb-4 mb-xl-0"
                        style={{ backgroundColor: "#0d73e1" , boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}
                      >
                        <CardBody>
                          <Row>
                            <div className="col">
                              <CardTitle
                                tag="h5"
                                className="text-uppercase text-white mb-0"
                              >
                                Logistic Note
                              </CardTitle>
                              <span className="h2 font-weight-bold text-dark mb-0">
                                {logisticNote}
                              </span>
                            </div>
                            <Col className="col-auto">
                              <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                <i class="fa-sharp fa-solid fa-truck"></i>
                              </div>
                            </Col>
                          </Row>
                          <p className="mt-3 mb-0 text-white text-sm">
                            <span className="text-success mr-2">
                              <i className="fa fa-arrow-up" />
                            </span>{" "}
                            <span className="text-nowrap">this month</span>
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col lg="6" xl="2" className="ml-6">
                      <Card
                        className="card-stats mb-4 mb-xl-0"
                        style={{ backgroundColor: "#0d73e1" , boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}
                      >
                        <CardBody>
                          <Row>
                            <div className="col">
                              <CardTitle
                                tag="h5"
                                className="text-uppercase text-white mb-0"
                              >
                                Billing Error Note
                              </CardTitle>
                              <span className="h2 font-weight-bold text-dark mb-0">
                                {BillingErrorNote}
                              </span>
                            </div>
                            <Col className="col-auto">
                              <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                                <i class="fa-sharp fa-solid fa-file-invoice-dollar"></i>
                              </div>
                            </Col>
                          </Row>
                          <p className="mt-3 mb-0 text-white text-sm">
                            <span className="text-success mr-2">
                              <i className="fa fa-arrow-up" />
                            </span>{" "}
                            <span className="text-nowrap">this month</span>
                          </p>
                        </CardBody>
                      </Card>
                    </Col>
                  </>
                ) : (
                  <Col>
                    <p className="mt-3 mb-0 text-white text-sm">
                      Evaluation pending
                    </p>
                  </Col>
                )}
              </>
            )}
          </Row>
        </div>

        <Row className="mt-7">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="7">
            <Card className="shadow" >
              <CardBody style={{ boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <div style={{ height: "400px" }}>
                    <Line
                      data={evaluationData}
                      options={{
                        responsive: true,
                        plugins: {
                          title: {
                            display: true,
                            text: "Evaluations",
                          },
                        },
                        scales: {
                          x: {
                            border: {
                              display: BORDER,
                            },
                            grid: {
                              display: true,
                              color: "black", 
                            },
                            scaleLabel: {
                              display: true,
                              labelString: "Month",
                            },
                          },
                          y: {
                            grid: {
                              display: DISPLAY,
                              drawOnChartArea: CHART_AREA,
                              drawTicks: TICKS,
                            },
                            ticks: {
                              beginAtZero: true,
                            },
                          },
                        },
                        plugins: {
                          beforeUpdate: function (chart) {
                            const labels = chart.config.data.labels;
                            if (labels.length > 0) {
                              const currentYear = new Date().getFullYear();
                              const lastMonthYear = parseInt(
                                labels[labels.length - 1].split("-")[0]
                              );
                              if (lastMonthYear !== currentYear) {
                                chart.config.data.labels = [];
                                chart.config.data.datasets.forEach(
                                  (dataset) => {
                                    dataset.data = [];
                                  }
                                );
                                chart.update();
                              }
                            }
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="3">
            <Card className="shadow">
              <CardHeader
                className="bg-transparent"
                style={{ boxShadow: "0px 5px 4px rgba(0, 0, 0, 0.5)" }}
              >
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
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: "400px",
                  boxShadow: "0px 5px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Table className="align-items-center table-flush" responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Certificate Name</th>
                      <th scope="col">Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCertificates.map((certificate) => (
                      <tr key={certificate._id}>
                        <td>{certificate.CertificateName}</td>
                        <td>
                          <Progress
                            value={
                              certificate.DaysUntilExpiration <= 0 // Expired or less than 0 days
                                ? 100
                                : certificate.DaysUntilExpiration > 90 // More than 90 days
                                ? 30 
                                : certificate.DaysUntilExpiration <= 60 // Less than or equal to 60 days
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
        </Row>
        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="7">
            <Card className="shadow">
              <CardHeader className="bg-transparent" >
                <h6 className="text-uppercase text-muted ls-1 mb-1">
                  Protocols
                </h6>
              </CardHeader>
              <CardBody style={{ boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}>
                <div className="chart">
                  <Bar data={chartExample4} options={chartOptions} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SupplierDashboard;
