import React from "react";
import { Table, Button } from "reactstrap";

const openPDFPage = (filename) => {
    window.open(`http://localhost:8000/file/${filename}`, "_blank");
  };

const ProtocolDetails = ({ protocols, loading }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h5>Protocol Details</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Protocol Title</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {protocols.map((protocol, index) => (
            <tr key={index}>
              <td>{protocol.protocolTitle}</td>
              <td>
                <Button
                  outline
                  color="primary"
                  onClick={() => openPDFPage(protocol.ProtocolFile)}
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

export default ProtocolDetails;
