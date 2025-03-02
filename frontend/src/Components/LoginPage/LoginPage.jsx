import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Make sure to install axios: npm install axios
import "./LoginPage.css";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "CR", // Default role for CR
    className: "",
    totalStudents: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login API call
        const response = await axios.post("https://smartams-backend-1pdd.onrender.com/api/auth/login", {
          email: formData.email,
          password: formData.password
        });

        console.log("Full login response:", response);

        // Store auth token
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          
          // Store user data
          if (response.data.user) {
            console.log("User data from server:", response.data.user);
            
            // Make sure to store totalStudents in localStorage
            localStorage.setItem("userData", JSON.stringify(response.data.user));
            
            // If totalStudents isn't in the response, make a separate request to get class info
            if (response.data.user.role === "CR" && !response.data.user.totalStudents) {
              try {
                // Set the auth token for the request
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                const userResponse = await axios.get("http://localhost:5000/api/auth/me");
                
                if (userResponse.data.success && userResponse.data.data) {
                  console.log("Additional user data:", userResponse.data.data);
                  localStorage.setItem("userData", JSON.stringify(userResponse.data.data));
                }
              } catch (err) {
                console.error("Error fetching additional user data:", err);
              }
            }
            
            // Redirect based on user role
            if (response.data.user.role === "CR") {
              navigate("/cr-dashboard");
            } else if (response.data.user.role === "faculty") {
              navigate("/faculty-dashboard");
            } else {
              navigate("/student-dashboard");
            }
          } else {
            // If no user object in response, make a request to get user data
            try {
              // Set the auth token for the request
              axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
              const userResponse = await axios.get("https://smartams-backend-1pdd.onrender.com/api/auth/me");
              
              if (userResponse.data.success && userResponse.data.data) {
                console.log("User data from /me endpoint:", userResponse.data.data);
                localStorage.setItem("userData", JSON.stringify(userResponse.data.data));
                
                // Redirect based on user role
                if (userResponse.data.data.role === "CR") {
                  navigate("/cr-dashboard");
                } else if (userResponse.data.data.role === "faculty") {
                  navigate("/faculty-dashboard");
                } else {
                  navigate("/student-dashboard");
                }
              } else {
                // Default fallback if we can't get user data
                localStorage.setItem("userData", JSON.stringify({ 
                  email: formData.email,
                  role: "CR" // Default role
                }));
                navigate("/cr-dashboard");
              }
            } catch (err) {
              console.error("Error fetching user data:", err);
              // Default fallback
              localStorage.setItem("userData", JSON.stringify({ 
                email: formData.email,
                role: "CR" // Default role
              }));
              navigate("/cr-dashboard");
            }
          }
        } else {
          // No token in the response
          throw new Error("No authentication token received from server");
        }
      } else {
        // Registration API call for CR
        const registerData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "CR",
          className: formData.className,
          totalStudents: parseInt(formData.totalStudents)
        };
        
        const response = await axios.post("https://smartams-backend-1pdd.onrender.com/api/auth/register", registerData);
        
        // Show success message
        alert("Registration successful! Please login with your credentials.");
        setIsLogin(true); // Switch to login form
        
        // Clear registration fields but keep email
        const email = formData.email;
        setFormData({
          email,
          password: "",
          name: "",
          role: "CR",
          className: "",
          totalStudents: ""
        });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(
        err.response?.data?.message || 
        "Authentication failed. Please check your credentials."
      );
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
          {isLogin ? "CR Login" : "Register as CR"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Class Name</label>
                <input
                  type="text"
                  name="className"
                  placeholder="Enter class name (e.g., CS-101)"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Total Students</label>
                <input
                  type="number"
                  name="totalStudents"
                  placeholder="Enter total number of students"
                  value={formData.totalStudents}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${isLogin ? "btn-blue" : "btn-green"}`}
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
