import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Col,
  InputGroup,
  Input,
  Table,
  Container,
  Row,
  Button,
  Modal, 
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import EditEmployee from "./EditEmployee";
import useAuth from "../../hooks/useAuth"; 
const Employees = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
      setFilteredEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchEmployees();
      setDeleteConfirmationOpen(false);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchQuery(searchTerm);
    const filtered = employees.filter((employee) =>
      `${employee.firstName.toLowerCase()} ${employee.lastName.toLowerCase()}`.includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  };

  const toggleEditModal = () => setEditModalOpen(!editModalOpen);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true); 
  };

  const updateEmployeeInList = (updatedEmployee) => {
    console.log("Updating employee in list:", updatedEmployee);
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee._id === updatedEmployee._id ? updatedEmployee : employee
      )
    );
    setFilteredEmployees((prevFilteredEmployees) =>
      prevFilteredEmployees.map((employee) =>
        employee._id === updatedEmployee._id ? updatedEmployee : employee
      )
    );
  };
  

  const toggleDeleteConfirmation = () => setDeleteConfirmationOpen(!deleteConfirmationOpen);

  const handleDeleteConfirmation = (employee) => {
    setEmployeeToDelete(employee);
    toggleDeleteConfirmation(); 
  };

  return (
    <div style={{ backgroundColor: "#FFFAFA", minHeight: "86vh" }}>
  <Container fluid>
      <Row>
        <Col xl="12">
          <Card className="shadow mt-7" style={{ marginLeft: "250px" }}>
            <CardHeader className="d-flex justify-content-between align-items-center border-0"style={{ boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.5)"}}>
              <h3 className="mb-0">Employees List</h3>
              <InputGroup style={{ maxWidth: "300px" }}>
                <Input
                  type="text"
                  placeholder="Search..."
                  className="mr-2"
                  style={{
                    fontSize: "0.875rem",
                    height: "calc(1.5em + .75rem + 2px)",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.375rem",
                  }}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </CardHeader>
            <div style={{ overflowY: "auto", maxHeight: "400px", boxShadow:"0px 5px 4px rgba(0, 0, 0, 0.3)" }}>
            <Table className="align-items-center table-flush" responsive>
              <thead className="thead-light">
              <tr>
  <th scope="col" style={{ fontWeight: "bold" }}>Image</th>
  <th scope="col" style={{ fontWeight: "bold" }}>First Name</th>
  <th scope="col" style={{ fontWeight: "bold" }}>Last Name</th>
  <th scope="col" style={{ fontWeight: "bold" }}>Position</th>
  <th scope="col" style={{ fontWeight: "bold" }}>Email</th>
  {(user.role !== "employee") && (
    <th scope="col" style={{ fontWeight: "bold" }}>Actions</th>
  )}
</tr>

              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <img
                          src={employee.image}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </td>
                      <td>{employee.firstName}</td>
                      <td>{employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>{employee.email}</td>
                      {(user.role !== "employee") && (
                            <td>
                              <Button
                                onClick={() => handleEdit(employee)}
                                outline
                                color="primary"
                                style={{
                                  padding: "0.2rem 0.4rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <i className="fa fa-pencil" aria-hidden="true"></i>
                              </Button>{" "}
                              <Button
                                onClick={() => handleDeleteConfirmation(employee)}
                                outline
                                color="primary"
                                style={{
                                  padding: "0.2rem 0.4rem",
                                  fontSize: "0.8rem",
                                }}
                              >
                                <i className="fa fa-trash" aria-hidden="true"></i>
                              </Button>
                            </td>
                          )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
           </div> 
          </Card>
        </Col>
      </Row>
      <EditEmployee
        isOpen={editModalOpen}
        toggle={toggleEditModal}
        employee={selectedEmployee}
        employeeId={selectedEmployee ? selectedEmployee._id : null}
        updateEmployeeInList={updateEmployeeInList}
      />

      
      <Modal isOpen={deleteConfirmationOpen} toggle={toggleDeleteConfirmation}>
        <ModalHeader toggle={toggleDeleteConfirmation}>Delete Confirmation</ModalHeader>
        <ModalBody>
          Are you sure you want to delete the employee {employeeToDelete && employeeToDelete.firstName}{" "}
          {employeeToDelete && employeeToDelete.lastName}?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => handleDelete(employeeToDelete._id)}>
            Yes
          </Button>{" "}
          <Button color="secondary" onClick={toggleDeleteConfirmation}>
            No
          </Button>
        </ModalFooter>
      </Modal>
      </Container>
</div>
  );
};

export default Employees;
