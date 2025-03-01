import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Check if user is logged in on component mount and when location changes
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]); // Add dependency to re-check when route changes

  // Function to check login status
  const checkLoginStatus = () => {
    // Look for token using BOTH possible keys (for compatibility)
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");
    
    if (token && userDataString) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(userDataString);
        // Extract role correctly from either nested or flat user object
        const role = userData.user?.role || userData.role || "";
        setUserRole(role);
        console.log("User role detected:", role);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole("");
    }
  };

  const handleLogout = async () => {
    try {
      // Determine which token key is being used
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      // Call the logout API with the correct token
      await axios.get("http://localhost:5000/api/auth/logout", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Clear both possible token keys and userData
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      
      // Update state
      setIsLoggedIn(false);
      setUserRole("");
      
      // Redirect to login page
      navigate("/");
      
      // Optional: Show logout success message
      alert("You have been successfully logged out.");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Even if API call fails, we should still log out locally
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      navigate("/");
    }
  };

  // Listen for storage events (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Custom event listener for login success
  useEffect(() => {
    const handleLoginSuccess = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <a className="navbar-brand fw-bold text-primary" href="/">
          Attendance Visualizer
        </a>

        {/* Navbar Toggle Button (for Mobile View) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Buttons pushed to the right using ms-auto */}
          <div className="ms-auto d-flex">
            {/* CR Dashboard Button */}
            {isLoggedIn && (userRole.toLowerCase() === "cr" || userRole.toLowerCase() === "class representative") && (
              <button
                className={`btn mx-2 ${
                  location.pathname === "/cr-dashboard" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => navigate("/cr-dashboard")}
              >
                Dashboard
              </button>
            )}

            {/* Faculty Dashboard Button */}
            {isLoggedIn && (userRole.toLowerCase() === "faculty") && (
              <button
                className={`btn mx-2 ${
                  location.pathname === "/faculty/dashboard" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => navigate("/faculty/dashboard")}
              >
                Dashboard
              </button>
            )}
            
            {/* Student Button (visible to all) */}
            <button
              className={`btn mx-2 ${
                location.pathname === "/student" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => navigate("/student")}
            >
              Student
            </button>

            {/* Faculty Button (visible to all) */}
            <button
              className={`btn mx-2 ${
                location.pathname === "/faculty" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => navigate("/faculty")}
            >
              Faculty
            </button>
            
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                className="btn btn-danger mx-2"
                onClick={handleLogout}
              >
                Logout {userRole && `(${userRole})`}
              </button>
            ) : (
              <button
                className="btn btn-success mx-2"
                onClick={() => navigate("/")}
              >
                By Dept Of AIML
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;