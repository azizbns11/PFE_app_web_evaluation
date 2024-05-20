import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import Select from "react-select";
import {
  Button,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Toast,
  ToastHeader,
  ToastBody,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState({});
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [image, setImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const mainContent = useRef(null);
  const inputRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    image: null,
    state: "",
    codeUser: "",
    groupName: "",
    street: "",
    province: "",
    zipCode: "",
    country: "",
    phone: "",
    address: "",
    fax: "",
    codeTVA: "",
    codeDUNS: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

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

        console.log("Fetched country:", data.country);

        setFormData(data);

        setSelectedCountry(data.country);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user.id) {
      fetchUserData();
    }
  }, [user.id]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (selectedOption) => {
    const selectedCountry = countries.find(
      (country) => country.value === selectedOption.value
    );
    setSelectedCountry(selectedCountry); 
    setFormData({ ...formData, country: selectedCountry.label });
  };
  
  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImageFile(selectedImage); 
    setPreviewImage(URL.createObjectURL(selectedImage));
    setShowImageUpload(true);
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formDataWithImage = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataWithImage.append(key, formData[key]);
      });
      formDataWithImage.append("image", imageFile);
      formDataWithImage.append("country", selectedCountry);

      const response = await axios.put(
        `http://localhost:8000/profile/${user.id}`,
        formDataWithImage,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "Profile updated successfully") {
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);

          switch (user.role) {
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "employee":
              navigate("/admin/dashboard");
              break;
            case "supplier":
              navigate("/supplier/dashboard");
              break;
            default:
              navigate("/dashboard");
              break;
          }
        }, 1000);
      } else {
        console.error("Error updating profile:", response.data.message);
        alert("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    document.body.classList.add("bg-default");
    return () => {
      document.body.classList.remove("bg-default");
    };
  }, []);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
  }, []);

  return (
    <>
      <div className="main-content" ref={mainContent}>
        <div className="header bg-gradient-info py-7 py-lg-8">
          <div className="separator separator-bottom separator-skew zindex-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="fill-default"
                points="2560 0 2560 100 0 100"
              />
            </svg>
          </div>
        </div>

        <Container className="mt--8 pb-5">
          <Row className="justify-content-center">
            <Col sm="10" md="8">
              <Card className="bg-secondary shadow border-0">
                <CardBody className="px-lg-5 py-lg-5">
                  <Form onSubmit={handleSubmit}>
                    <>
                      {showSuccess && (
                        <Alert color="success" className="mt-4">
                          Profile updated successfully!
                        </Alert>
                      )}
                      <div className="text-center">
                        <h6 className="heading-small text-muted mb-4">
                          Please fill the required fields
                        </h6>
                      </div>
                      <div className="pl-lg-4">
                        <Row>
                          {user.role === "admin" && (
                            <>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-firstName">
                                    First Name
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-lastName">
                                    Last Name
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-phone">
                                    Phone
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="phone"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-position">
                                    Position
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    placeholder="position"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-newPassword">
                                    New Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    required
                                  />
                                </FormGroup>
                              </Col>

                              <Col>
                                <FormGroup>
                                  <label htmlFor="input-confirmPassword">
                                    Confirm Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </>
                          )}
                          {user.role === "employee" && (
                            <>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-firstName">
                                    First Name
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-lastName">
                                    Last Name
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-phone">
                                    Phone
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="phone"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-position">
                                    Position
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-position"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    placeholder="position"
                                    required
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor="input-newPassword">
                                    New Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    required
                                  />
                                </FormGroup>
                                <FormGroup>
                                  <label htmlFor="input-confirmPassword">
                                    Confirm Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </>
                          )}
                          {user.role === "supplier" && (
                            <>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-groupName">
                                    Group Name
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-groupName"
                                    name="groupName"
                                    value={formData.groupName}
                                    onChange={handleChange}
                                    placeholder="groupName"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-codeTVA">
                                    Code TVA
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-codeTVA"
                                    name="codeTVA"
                                    value={formData.codeTVA}
                                    onChange={handleChange}
                                    placeholder="codeTVA"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-province">
                                    Province
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-province"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    placeholder="province"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-street">Street</label>
                                  <Input
                                    type="text"
                                    id="input-street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    placeholder="street"
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-codeUser">
                                    Code User
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-codeUser"
                                    name="codeUser"
                                    value={formData.codeUser}
                                    onChange={handleChange}
                                    placeholder="codeUser"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-codeDUNS">
                                    Code DUNS
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-codeDUNS"
                                    name="codeDUNS"
                                    value={formData.codeDUNS}
                                    onChange={handleChange}
                                    placeholder="codeDUNS"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-phone">
                                    Phone
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="phone"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-fax">Fax</label>
                                  <Input
                                    type="text"
                                    id="input-fax"
                                    name="fax"
                                    value={formData.fax}
                                    onChange={handleChange}
                                    placeholder="fax"
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-address">
                                    address
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="address"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-zipCode">
                                    Code ZIP
                                  </label>
                                  <Input
                                    type="text"
                                    id="input-zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    placeholder="zipCode"
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-country">Country</label>
                                  <Select
                                    options={countries}
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    placeholder="Select Country"
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-newPassword">
                                    New Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="New Password"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                              <Col sm="4">
                                <FormGroup>
                                  <label htmlFor="input-confirmPassword">
                                    Confirm Password
                                    <span style={{ color: "red" }}> *</span>
                                  </label>
                                  <Input
                                    type="password"
                                    id="input-confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required
                                  />
                                </FormGroup>
                              </Col>
                            </>
                          )}
                        </Row>
                        <Row>
                          <Col sm="4">
                            <FormGroup>
                              <div className="profile-image-container">
                                {previewImage ? (
                                  <img
                                    src={previewImage}
                                    alt="Profile"
                                    className="profile-image"
                                    style={{
                                      maxWidth: "100px",
                                      maxHeight: "100px",
                                      position: "relative",
                                    }}
                                  />
                                ) : formData.image ? (
                                  <img
                                    src={formData.image}
                                    alt="Profile"
                                    className="profile-image"
                                    style={{
                                      maxWidth: "100px",
                                      maxHeight: "100px",
                                      position: "relative",
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={require("../../assets/img/brand/user.png")}
                                    alt="Default Profile"
                                    className="profile-image"
                                    style={{
                                      maxWidth: "100px",
                                      maxHeight: "100px",
                                      position: "relative",
                                    }}
                                  />
                                )}
                                <div
                                  className="camera-icon-container"
                                  style={{
                                    display: "inline-block",
                                    verticalAlign: "bottom",
                                    marginLeft: "-17px",
                                  }}
                                >
                                  <Button
                                    onClick={() => inputRef.current.click()}
                                    className="mt-3"
                                    style={{
                                      backgroundColor: "gray",
                                      borderRadius: "60%",
                                      padding: "5px",
                                      color: "white",
                                    }}
                                  >
                                    <i
                                      className="fa fa-camera"
                                      aria-hidden="true"
                                    ></i>
                                  </Button>
                                </div>
                                <input
                                  type="file"
                                  ref={inputRef}
                                  onChange={(event) => {
                                    handleImageChange(event);
                                    setShowImageUpload(true);
                                  }}
                                  style={{ display: "none" }}
                                />
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      <Button color="primary" type="submit">
                        Save changes
                      </Button>
                    </>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
        <Toast isOpen={showToast}>
          <ToastHeader toggle={() => setShowToast(false)}>Success</ToastHeader>
          <ToastBody>Profile updated successfully!</ToastBody>
        </Toast>
      </div>
    </>
  );
}

export default EditProfile;
