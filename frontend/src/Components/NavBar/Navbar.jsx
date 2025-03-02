import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";
import logoGif from '../../assets/quick-idea.gif';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to check login status
  const checkLoginStatus = () => {
    // Check for both token storage methods
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const userDataString = localStorage.getItem("userData");

    if (token && userDataString) {
      setIsLoggedIn(true);
      try {
        // Parse userData which could be in different formats
        const userData = JSON.parse(userDataString);
        
        // Handle different data structures that might exist in localStorage
        let role = "";
        if (userData.user && userData.user.role) {
          role = userData.user.role;
        } else if (userData.role) {
          role = userData.role;
        }
        
        // Store the role regardless of case
        setUserRole(role);
        console.log("User role detected:", role); // Debug logging
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole("");
    }
  };

  // Check login status on component mount and when location changes
  useEffect(() => {
    checkLoginStatus();
  }, [location.pathname]);

  // Listen for both loginSuccess events
  useEffect(() => {
    const handleLoginSuccess = () => {
      checkLoginStatus();
    };

    window.addEventListener("loginSuccess", handleLoginSuccess);
    // Handle the case if a different event is dispatched from faculty login
    window.addEventListener("facultyLoginSuccess", handleLoginSuccess);

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      window.removeEventListener("facultyLoginSuccess", handleLoginSuccess);
    };
  }, []);

  // Close menu when changing routes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      // Try both possible token keys
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      
      await axios.get("https://smartams-backend-1pdd.onrender.com/api/auth/logout", {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.clear();
      setIsLoggedIn(false);
      setUserRole("");
      navigate("/");
      alert("You have been successfully logged out.");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      navigate("/");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Helper function to check if user is a faculty (case-insensitive)
  const isFaculty = () => {
    return userRole && userRole.toLowerCase() === "faculty";
  };

  // Helper function to check if user is a CR (case-insensitive)
  const isCR = () => {
    return userRole && (userRole.toLowerCase() === "cr" || userRole.toLowerCase() === "class representative");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <a className="brand-logo" href="/">
          Smart AMS <img src={logoGif} alt="gif" />
        </a>

        {/* Navigation Buttons */}
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to={'/'} className="nav-btn home-button no-underline">Home</Link>

          {/* CR Dashboard Button */}
          {isLoggedIn && isCR() && (
            <button
              className={`nav-btn ${location.pathname === "/cr-dashboard" ? "active" : ""}`}
              onClick={() => navigate("/cr-dashboard")}
            >
              CR Dashboard
            </button>
          )}

          {/* Faculty Dashboard Button */}
          {isLoggedIn && isFaculty() && (
            <button
              className={`nav-btn ${location.pathname.includes("/faculty/dashboard") ? "active" : ""}`}
              onClick={() => navigate("/faculty/dashboard")}
            >
              Faculty Dashboard
            </button>
          )}

          {/* Student Button */}
          <button
            className={`nav-btn ${location.pathname === "/student" ? "active" : ""}`}
            onClick={() => navigate("/student")}
          >
            Student
          </button>

          {/* Faculty Button */}
          <button
            className={`nav-btn ${location.pathname === "/faculty" ? "active" : ""}`}
            onClick={() => navigate("/faculty")}
          >
            Faculty
          </button>

          {/* Logout or Department Button */}
          {isLoggedIn ? (
            <button className="nav-btn logout" onClick={handleLogout}>
              Logout {userRole && `(${userRole})`}
            </button>
          ) : (
            <button className="nav-btn department" onClick={() => navigate("/")}>
              Dept Of AIML
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
