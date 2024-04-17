import React from "react";
import { Table ,Button} from "reactstrap";

const formatDate = (dateString) => {
  const options = { year: "2-digit", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};
const openPDFPage = (filename) => {
  window.open(`http://localhost:8000/file/${filename}`, "_blank");
};


const CertificateDetails = ({ certificateData }) => {
  return (
    <div>
      <h5>Certificate Details</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Certificate Name</th>
            <th>Certificate Number</th>
            <th>Expire Date</th>
            <th>Recertificate Date</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {certificateData.map((certificate, index) => (
            <tr key={index}>
              <td>{certificate.CertificateName}</td>
              <td>{certificate.CertificateNumber}</td>
              <td>{formatDate(certificate.ExpireDate)}</td>
              <td>{formatDate(certificate.RecertificateDate)}</td>
              <td>
                      <Button
                        outline
                        color="primary"
                        onClick={() => openPDFPage(certificate.CertificateFile)}
                        className="download-button"
                        style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                      >
                        <i className="fa fa-download" aria-hidden="true"></i>
                      </Button>
                    </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CertificateDetails;
