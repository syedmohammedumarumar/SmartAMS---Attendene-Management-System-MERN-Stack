import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FacultyLogin.css";

// API base URL
const API_URL = "https://smartams-backend-1pdd.onrender.com/api";

const FacultyLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const navigate = useNavigate();
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login faculty
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password
        });
        
        if (response.data.success) {
          // Store the token and user data
          const userData = {
            token: response.data.token,
            user: response.data.user
          };
          
          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.setItem("token", response.data.token);
          
          // Show success message
          setSuccessMessage("Login successful! Redirecting to dashboard...");
          
          // Dispatch login success event
          window.dispatchEvent(new Event('loginSuccess'));
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/faculty/dashboard");
          }, 1000);
        } else {
          throw new Error(response.data.message || "Login failed");
        }
      } else {
        // Register faculty
        const response = await axios.post(`${API_URL}/auth/register`, {
          name,
          email,
          password,
          role: "Faculty"
        });
        
        if (response.data.success) {
          setSuccessMessage("Registration successful! You can now login.");
          // Reset form
          setName("");
          setEmail("");
          setPassword("");
          // Switch to login view
          setIsLogin(true);
        } else {
          throw new Error(response.data.message || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Authentication failed");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        {/* Toggle Buttons */}
        <div className="toggle-buttons">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        
        <h2 className={`form-title ${isLogin ? "text-blue" : "text-green"}`}>
          {isLogin ? `Faculty Login` : `Faculty Registration`}
        </h2>
        
        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className={`submit-btn ${isLogin ? "btn-blue" : "btn-green"}`}
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FacultyLogin;
