import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Alert,
} from "reactstrap";
import useAuth from "../../hooks/useAuth";
import UserHeader from "../../content/Header/UserHeader";
import axios from "axios";
import Select from "react-select";
const AdminProfile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    address: "",
    codeUser: "",
    groupName: "",
    street: "",
    province: "",
    zipCode: "",
    country: "",
    phone: "",
    fax: "",
    codeTVA: "",
    codeDUNS: "",
    image: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const inputRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user.id) {
          console.error("User ID is undefined");
          return;
        }

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/profile/fetch/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { data } = response;
        setUserData(data);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user.id) {
      fetchUserData();
    }
  }, [user.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    setPreviewImage(URL.createObjectURL(selectedImage));
    setShowImageUpload(true);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
        );
        const data = await response.json();

        setCountries(data.countries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("handleSubmit function called");
    try {
      if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
      }

      const token = localStorage.getItem("token");

      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (selectedCountry) {
        formData.set("country", selectedCountry.label);
      }

      formData.append("password", newPassword);

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put(
        `http://localhost:8000/profile/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);

      setEditMode(false);
      setShowImageUpload(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again later.");
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <>
      <UserHeader />

      <Container className="mt--7" fluid>
        <Row>
          <Col lg="3" md="4" xs="12" className="order-lg-1"></Col>
          <Col lg="9" md="8" xs="12" className="order-lg-2">
            <Row>
              <Col className="order-xl-1" xl="8">
                <Card className="bg-secondary shadow">
                  <CardHeader className="bg-white border-0">
                    <Row className="align-items-center">
                      <Col xs="8">
                        <h3 className="mb-0">My account</h3>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Form onSubmit={handleSubmit}>
                      {isLoaded && (
                        <>
                          {showSuccess && (
                            <Alert color="success" className="mt-4">
                              Profile updated successfully!
                            </Alert>
                          )}
                          <h6 className="heading-small text-muted mb-4">
                            User information
                          </h6>
                          <div className="pl-lg-4">
                            <Row>
                              {/* Fields for employee */}
                              {(user.role === "employee" ||
                                user.role === "admin") && (
                                <>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-first-name">
                                        First name
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-first-name"
                                        name="firstName"
                                        value={userData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-last-name">
                                        Last name
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-last-name"
                                        name="lastName"
                                        value={userData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-email">Email</label>
                                      <Input
                                        type="text"
                                        id="input-email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-position">
                                        Position
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-position"
                                        name="position"
                                        value={userData.position}
                                        onChange={handleChange}
                                        placeholder="Position"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-phone">Phone</label>
                                      <Input
                                        type="text"
                                        id="input-phone"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                </>
                              )}
                              {/* Fields for supplier */}
                              {user.role === "supplier" && (
                                <>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-groupName">
                                        Group Name
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-groupName"
                                        name="groupName"
                                        value={userData.groupName}
                                        onChange={handleChange}
                                        placeholder="Group Name"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-address">
                                        Address
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-address"
                                        name="address"
                                        value={userData.address}
                                        onChange={handleChange}
                                        placeholder="Address"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-codeUser">
                                        Code User
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-codeUser"
                                        name="codeUser"
                                        value={userData.codeUser}
                                        onChange={handleChange}
                                        placeholder="Code User"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-street">
                                        Street
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-street"
                                        name="street"
                                        value={userData.street}
                                        onChange={handleChange}
                                        placeholder="Street"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-province">
                                        Province
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-province"
                                        name="province"
                                        value={userData.province}
                                        onChange={handleChange}
                                        placeholder="Province"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-zipCode">
                                        Zip Code
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-zipCode"
                                        name="zipCode"
                                        value={userData.zipCode}
                                        onChange={handleChange}
                                        placeholder="Zip Code"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-country">
                                        Country
                                      </label>
                                      {editMode ? (
                                        <Select
                                          options={countries}
                                          value={selectedCountry}
                                          onChange={handleCountryChange}
                                          placeholder="Select Country"
                                        />
                                      ) : (
                                        <Input
                                          type="text"
                                          id="input-country"
                                          name="country"
                                          value={userData.country}
                                          onChange={handleChange}
                                          placeholder="Country"
                                          readOnly={!editMode}
                                        />
                                      )}
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-phone">Phone</label>
                                      <Input
                                        type="text"
                                        id="input-phone"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleChange}
                                        placeholder="Phone"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-fax">Fax</label>
                                      <Input
                                        type="text"
                                        id="input-fax"
                                        name="fax"
                                        value={userData.fax}
                                        onChange={handleChange}
                                        placeholder="Fax"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-codeTVA">
                                        Code TVA
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-codeTVA"
                                        name="codeTVA"
                                        value={userData.codeTVA}
                                        onChange={handleChange}
                                        placeholder="Code TVA"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-codeDUNS">
                                        Code DUNS
                                      </label>
                                      <Input
                                        type="text"
                                        id="input-codeDUNS"
                                        name="codeDUNS"
                                        value={userData.codeDUNS}
                                        onChange={handleChange}
                                        placeholder="Code DUNS"
                                        readOnly={!editMode}
                                      />
                                    </FormGroup>
                                  </Col>
                                </>
                              )}
                              {/* Password Field */}
                              {editMode && (
                                <>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-new-password">
                                        New Password
                                      </label>
                                      <Input
                                        type="password"
                                        id="input-new-password"
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={handleNewPasswordChange}
                                        placeholder="New Password"
                                      />
                                    </FormGroup>
                                  </Col>
                                  <Col lg="6">
                                    <FormGroup>
                                      <label htmlFor="input-confirm-password">
                                        Confirm Password
                                      </label>
                                      <Input
                                        type="password"
                                        id="input-confirm-password"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        placeholder="Confirm Password"
                                      />
                                    </FormGroup>
                                  </Col>
                                </>
                              )}
                            </Row>
                          </div>
                          <hr className="my-4" />
                          {editMode && (
                            <Button color="primary" type="submit">
                              Save changes
                            </Button>
                          )}
                        </>
                      )}
                    </Form>
                  </CardBody>
                </Card>
              </Col>
              <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
                <Card className="card-profile shadow">
                  <CardBody className="pt-0 pt-md-4 d-flex flex-column justify-content-center align-items-center">
                    <div>
                      <img
                        src={
                          previewImage || userData.image 
                        }
                        alt="Profile"
                        className="rounded-circle img-fluid"
                        style={{ width: "150px", height: "150px" }}
                      />

                      {editMode && (
                        <>
                          <Button
                            color="info"
                            onClick={() => inputRef.current.click()}
                            className="mt-3"
                          >
                            <i className="fas fa-edit" />
                          </Button>
                          <input
                            type="file"
                            ref={inputRef}
                            onChange={(event) => {
                              handleImageChange(event);
                              setShowImageUpload(true);
                            }}
                            style={{ display: "none" }}
                          />
                        </>
                      )}
                    </div>
                    <div className="text-center">
                      <h3>
                        {user.role === "employee" &&
                          `${userData.firstName} ${userData.lastName}`}
                        {user.role === "supplier" && userData.groupName}
                        {user.role === "admin" && user.username}
                      </h3>
                      <div className="h5 mt-4">
                        <i className="ni business_briefcase-24 mr-2" />
                        {userData.position}
                      </div>
                      <hr className="my-4" />
                      {!editMode && (
                        <Button color="info" onClick={handleEdit}>
                          Edit profile
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminProfile;
