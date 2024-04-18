import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { format, getMonth, getYear, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
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

const SupplierDashboard = () => {
  const [evaluationData, setEvaluationData] = useState({});
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [qualityNote, setQualityNote] = useState("");
  const [logisticNote, setLogisticNote] = useState("");
  const [BillingErrorNote, setBillingErrorNote] = useState("");
  const [paymentTermNote, setPaymentTermNote] = useState("");
  const [filteredCertificates, setFilteredCertificates] = useState([]);
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

        const chartData = {
          labels: Object.values(evaluationScores).map(
            (evaluation) => evaluation.month
          ),
          datasets: [
            {
              label: "Quality",
              data: Object.values(evaluationScores).map(
                (evaluation) =>
                  evaluation.quality.reduce((a, b) => a + b, 0) /
                  evaluation.quality.length
              ),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Logistic",
              data: Object.values(evaluationScores).map(
                (evaluation) =>
                  evaluation.logistic.reduce((a, b) => a + b, 0) /
                  evaluation.logistic.length
              ),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Billing Error",
              data: Object.values(evaluationScores).map(
                (evaluation) =>
                  evaluation.billing.reduce((a, b) => a + b, 0) /
                  evaluation.billing.length
              ),
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Payment Term",
              data: Object.values(evaluationScores).map(
                (evaluation) =>
                  evaluation.paymentTerm.reduce((a, b) => a + b, 0) /
                  evaluation.paymentTerm.length
              ),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "transparent",
            },
            {
              label: "Total Score",
              data: Object.values(evaluationScores).map(
                (evaluation) =>
                  evaluation.score.reduce((a, b) => a + b, 0) /
                  evaluation.score.length
              ),
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

        // Set state for notes
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

  return (
    <>
         <Container className="mt--8" fluid style={{ minHeight: "100vh",backgroundColor: "#FFFAFA" }}>
        <div className="header-body">
          <Row className="mt-8">
            <Col lg="6" xl="2" className="ml-auto">
              <Card className="card-stats mb-4 mb-xl-0"style={{ backgroundColor: "rgba(54, 162, 235, 0.6)" }}>
                <CardBody>
                  <Row>
                    <div className="col">
                    <CardTitle tag="h5" className="text-uppercase text-dark mb-0">
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
            <Card className="card-stats mb-4 mb-xl-0"style={{ backgroundColor: "rgba(54, 162, 235, 0.6)" }}>
                <CardBody>
                  <Row>
                    <div className="col">
                    <CardTitle tag="h5" className="text-uppercase text-dark mb-0">
                        Payment Term Note
                      </CardTitle>
                      <span className="h2 font-weight-bold text-dark mb-0">
                        {paymentTermNote}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i
                          class="fa-solid fa-credit-card"
                          
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
            <Card className="card-stats mb-4 mb-xl-0"style={{ backgroundColor: "rgba(54, 162, 235, 0.6)" }}>
                <CardBody>
                  <Row>
                    <div className="col">
                    <CardTitle tag="h5" className="text-uppercase text-dark mb-0">
                        Logistic Note
                      </CardTitle>
                      <span className="h2 font-weight-bold text-dark mb-0">
                        {logisticNote}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i
                          class="fa-sharp fa-solid fa-truck"
                        
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
            <Card className="card-stats mb-4 mb-xl-0"style={{ backgroundColor: "rgba(54, 162, 235, 0.6)" }}>
                <CardBody>
                  <Row>
                    <div className="col">
                    <CardTitle tag="h5" className="text-uppercase text-dark mb-0">
                        Billing Error Note
                      </CardTitle>
                      <span className="h2 font-weight-bold text-dark mb-0">
                        {BillingErrorNote}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i
                          class="fa-sharp fa-solid fa-file-invoice-dollar"
                         
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
          </Row>
        </div>

        <Row className="mt-7">
          <Col className="mb-5 mb-xl-0 offset-xl-2" xl="7">
            <Card className="shadow">
              <div>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <Line
                    data={evaluationData}
                    options={{
                      scales: {
                        xAxes: [
                          {
                            scaleLabel: {
                              display: true,
                              labelString: "Month",
                            },
                          },
                        ],
                        yAxes: [
                          {
                            ticks: {
                              beginAtZero: true,
                            },
                          },
                        ],
                      },
                      plugins: {
                        // Custom plugin to clear chart data at the beginning of each year
                        beforeUpdate: function (chart) {
                          const labels = chart.config.data.labels;
                          if (labels.length > 0) {
                            const currentYear = new Date().getFullYear();
                            const lastMonthYear = parseInt(
                              labels[labels.length - 1].split("-")[0]
                            );
                            if (lastMonthYear !== currentYear) {
                              chart.config.data.labels = [];
                              chart.config.data.datasets.forEach((dataset) => {
                                dataset.data = [];
                              });
                              chart.update();
                            }
                          }
                        },
                      },
                    }}
                  />
                )}
              </div>
            </Card>
          </Col>
          <Col xl="3">
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
                              ? 100 // Red color
                              : certificate.DaysUntilExpiration > 90 // More than 90 days
                              ? 30 // Green color (30%)
                              : certificate.DaysUntilExpiration <= 60 // Less than or equal to 60 days
                              ? 50 // Orange color (50%)
                              : 70 // Red color (70%)
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
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SupplierDashboard;
