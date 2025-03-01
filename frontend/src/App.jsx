import React from "react";
import NavBar from "./Components/NavBar/Navbar";
import HomePage from "./pages/HomePage"; // Import the HomePage component
import StudentPage from "./pages/StudentPage";
import FacultyPage from "./pages/FacultyPage";
import StudentDashboard from "./pages/StudentDashboard";
import { Route, Routes } from "react-router-dom";
import FacultyDashboard from "./Components/FacultyDashboard/FacultyDashboard";

function App() {
  return (
    <div className="w-screen min-h-screen overflow-x-hidden">
      <NavBar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Home Page Route */}
          <Route path="/student" element={<StudentPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/cr-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
