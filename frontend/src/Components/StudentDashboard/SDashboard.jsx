import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentDashboard.css";

// API base URL
const API_URL = "http://localhost:5000/api";

// Time slots for classes
const timeSlots = [
  "9:10-10:10 AM", "10:10-11:10 AM", "11:10-12:10 PM", "12:10-1:00 PM",
  "1:00-2:00 PM", "2:00-3:00 PM", "3:00-4:00 PM", "4:00-5:00 PM"
];

const StudentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [submittedAttendance, setSubmittedAttendance] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [className, setClassName] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [classId, setClassId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem("token") || 
                  localStorage.getItem("authToken") || 
                  (localStorage.getItem("userData") && 
                   JSON.parse(localStorage.getItem("userData")).token);
    return token;
  };

  // Configure axios headers
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      }
    };
  };

  // Fetch class details from the API
  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getAxiosConfig();
      const response = await axios.get(`${API_URL}/cr/class`, config);
      
      if (response.data.success) {
        const classData = response.data.data;
        setClassId(classData._id);
        setClassName(classData.name);
        setTotalStudents(classData.totalStudents);
        
        // Create student array
        const newStudents = Array.from(
          { length: classData.totalStudents }, 
          (_, index) => `Student ${index + 1}`
        );
        setStudents(newStudents);
        
        // Initialize attendance data for all time slots
        const initialAttendance = {};
        timeSlots.forEach(slot => {
          initialAttendance[slot] = new Array(newStudents.length).fill(1); // Default to Present (1)
        });
        setAttendance(initialAttendance);
        
        // After class details are loaded, fetch attendance data with the current date
        fetchSubmittedAttendance(currentDate);
      }
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError(`Failed to load class details: ${err.response?.status === 401 ? "Authentication error" : err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch submitted attendance from the API with specific date parameter
  const fetchSubmittedAttendance = async (date) => {
    try {
      setLoading(true);
      
      const config = getAxiosConfig();
      console.log(`Fetching attendance data for date: ${date}`);
      
      // Use the exact API URL format you provided
      const url = `${API_URL}/cr/attendance/${date}`;
      console.log(`API URL: ${url}`);
      
      const response = await axios.get(url, config);
      console.log("Attendance API response:", response.data);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Process the submitted attendance data
        const fetchedSubmitted = {};
        
        response.data.data.forEach(record => {
          const slot = record.timeSlot;
          const slotAttendance = new Array(totalStudents).fill(1); // Default to present
          
          // Map the attendance records
          if (Array.isArray(record.attendance)) {
            record.attendance.forEach(entry => {
              if (entry.studentNumber && entry.studentNumber <= totalStudents) {
                const studentIndex = entry.studentNumber - 1;
                slotAttendance[studentIndex] = entry.status === "Present" ? 1 : 0;
              }
            });
          }
          
          fetchedSubmitted[slot] = slotAttendance;
        });
        
        console.log("Processed attendance data:", fetchedSubmitted);
        setSubmittedAttendance(fetchedSubmitted);
      } else {
        console.log("No attendance records found for the date");
        // Clear the submitted attendance when no data is found
        setSubmittedAttendance({});
      }
    } catch (err) {
      console.error("Error fetching submitted attendance:", err);
      // More detailed error handling
      if (err.response) {
        console.error("Response error:", err.response.status, err.response.data);
      } else if (err.request) {
        console.error("Request error:", err.request);
      } else {
        console.error("Error message:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load class data on component mount
  useEffect(() => {
    fetchClassDetails();
  }, []);

  // Add effect to refetch attendance data when date changes
  useEffect(() => {
    if (totalStudents > 0) {
      fetchSubmittedAttendance(currentDate);
    }
  }, [currentDate, totalStudents]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setCurrentDate(newDate);
  };

  const handleAttendanceChange = (index) => {
    setAttendance(prev => ({
      ...prev,
      [selectedSlot]: prev[selectedSlot].map((value, i) =>
        i === index ? (value === 1 ? 0 : 1) : value // Toggle between 1 (Present) and 0 (Absent)
      )
    }));
  };

  const handleMarkAll = (status) => {
    setAttendance(prev => ({
      ...prev,
      [selectedSlot]: new Array(students.length).fill(status) // Mark all as Present (1) or Absent (0)
    }));
  };

  // Handle repeating attendance from previous time slot
  const handleRepeatPrevious = () => {
    const currentSlotIndex = timeSlots.indexOf(selectedSlot);
    
    if (currentSlotIndex <= 0) {
      alert("No previous time slot to repeat from!");
      return;
    }
    
    const previousSlot = timeSlots[currentSlotIndex - 1];
    
    if (submittedAttendance[previousSlot]) {
      // Copy from submitted attendance
      setAttendance(prev => ({
        ...prev,
        [selectedSlot]: [...submittedAttendance[previousSlot]]
      }));
      alert(`Attendance copied from ${previousSlot} to ${selectedSlot}`);
    } else if (attendance[previousSlot]) {
      // Copy from current attendance data
      setAttendance(prev => ({
        ...prev,
        [selectedSlot]: [...attendance[previousSlot]]
      }));
      alert(`Attendance copied from ${previousSlot} to ${selectedSlot}`);
    } else {
      alert(`No attendance data available for ${previousSlot}`);
    }
  };

  // Submit attendance to the API
  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for auth token
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }
      
      // Prepare the attendance data according to the backend API format
      const attendanceData = attendance[selectedSlot].map((status, index) => ({
        studentNumber: index + 1,
        status: status === 1 ? "Present" : "Absent"
      }));
      
      const payload = {
        timeSlot: selectedSlot,
        date: currentDate,
        attendance: attendanceData
      };
      
      console.log("Submitting attendance data:", payload);
      
      const config = getAxiosConfig();
      const response = await axios.post(
        `${API_URL}/cr/attendance`,
        payload,
        config
      );
      
      console.log("Submit attendance response:", response.data);
      
      if (response.data.success) {
        // Update local state to reflect submission
        setSubmittedAttendance(prev => ({
          ...prev,
          [selectedSlot]: [...attendance[selectedSlot]]
        }));
        
        setIsEditable(false);
        alert(`Attendance for ${selectedSlot} submitted successfully!`);
        
        // Refresh attendance data after submission
        fetchSubmittedAttendance(currentDate);
      } else {
        throw new Error(response.data.message || "Failed to submit attendance");
      }
    } catch (err) {
      console.error("Error submitting attendance:", err);
      let errorMessage = "Failed to submit attendance";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Check your connection.";
      } else {
        errorMessage = err.message;
      }
      
      setError(`Failed to submit attendance: ${errorMessage}`);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total present and absent students
  const totalPresent = attendance[selectedSlot]?.filter(status => status === 1).length || 0;
  const totalAbsent = attendance[selectedSlot]?.filter(status => status === 0).length || 0;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Welcome, Class Representative!</h2>
      {className && <h3 className="class-name">Class: {className}</h3>}
      {totalStudents > 0 && <p className="total-students">Total Students: {totalStudents}</p>}
      
      {/* Date selector for attendance */}
      <div className="date-selector">
        <label htmlFor="attendance-date">Select Date: </label>
        <input 
          type="date" 
          id="attendance-date"
          value={currentDate}
          onChange={handleDateChange}
          className="date-input"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      {/* Display any errors */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {students.length > 0 && (
            <div className="attendance-form">
              {/* Attendance Selection and TimeSlot Controls */}
              <div className="time-slot-controls">
                <h5>Select Time Slot:</h5>
                <select
                  className="time-slot-selector"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  disabled={loading}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              {/* Display All Submitted Attendance Summary */}
              <div className="all-slots-summary">
                <h4>Attendance Summary for {currentDate}</h4>
                <div className="slots-grid">
                  {timeSlots.map(slot => {
                    const hasSubmitted = !!submittedAttendance[slot];
                    const presentCount = hasSubmitted ? 
                      submittedAttendance[slot].filter(s => s === 1).length : 0;
                    const absentCount = hasSubmitted ? 
                      submittedAttendance[slot].filter(s => s === 0).length : 0;
                    
                    return (
                      <div 
                        key={slot} 
                        className={`slot-summary ${hasSubmitted ? 'submitted' : ''} ${slot === selectedSlot ? 'selected' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div className="slot-time">{slot}</div>
                        {hasSubmitted ? (
                          <div className="slot-counts">
                            <span className="present-count">{presentCount} Present</span>
                            <span className="absent-count">{absentCount} Absent</span>
                          </div>
                        ) : (
                          <div className="slot-status">Not Submitted</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Current Attendance Form */}
              {students.length > 0 && (!submittedAttendance[selectedSlot] || isEditable) && (
                <div className="attendance-card">
                  <h4>Taking Attendance for {selectedSlot}</h4>
                  
                  {/* Box for Mark All Buttons and Attendance Summary */}
                  <div className="mark-all-summary-box">
                    <div className="mark-all-buttons">
                      <button 
                        className="btn-present" 
                        onClick={() => handleMarkAll(1)}
                        disabled={loading}
                      >
                        Mark All Present
                      </button>
                      <button 
                        className="btn-absent" 
                        onClick={() => handleMarkAll(0)}
                        disabled={loading}
                      >
                        Mark All Absent
                      </button>
                      {/* Repeat Previous Button */}
                      <button 
                        className="btn-repeat" 
                        onClick={handleRepeatPrevious}
                        disabled={loading || timeSlots.indexOf(selectedSlot) === 0}
                        title={timeSlots.indexOf(selectedSlot) === 0 ? "This is the first time slot" : `Copy attendance from ${timeSlots[timeSlots.indexOf(selectedSlot) - 1]}`}
                      >
                        Repeat Previous
                      </button>
                    </div>
                    
                    <div className="student-buttons-container">
                      {students.map((_, index) => (
                        <button
                          key={index}
                          className={`student-toggle-button ${
                            attendance[selectedSlot]?.[index] === 1 ? "present" : "absent"
                          }`}
                          onClick={() => handleAttendanceChange(index)}
                          disabled={loading}
                        >
                          {index + 1} {/* Display only the number */}
                        </button>
                      ))}
                    </div>
                    
                    <div className="attendance-summary">
                      <p>Total Present: <span className="status-present">{totalPresent}</span></p>
                      <p>Total Absent: <span className="status-absent">{totalAbsent}</span></p>
                    </div>
                  </div>

                  <button 
                    className="btn-submit" 
                    onClick={handleSubmitAttendance}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Attendance"}
                  </button>
                </div>
              )}
              
              {/* Display Submitted Attendance for the Selected Time Slot */}
              {submittedAttendance[selectedSlot] && !isEditable && (
                <div className="submitted-attendance">
                  <h3>Submitted Attendance for {selectedSlot}</h3>
                  <div className="student-status-grid">
                    {students.map((_, index) => {
                      const status = submittedAttendance[selectedSlot]?.[index];
                      let statusClass = "";
                      if (status === 1) statusClass = "status-present";
                      else if (status === 0) statusClass = "status-absent";
                      return (
                        <div key={index} className={`student-status ${statusClass}`}>
                          <span className="student-number">{index + 1}</span>
                          <span className="student-attendance-status">
                            {status === 1 ? "Present" : "Absent"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button 
                    className="btn-update" 
                    onClick={() => setIsEditable(true)}
                    disabled={loading}
                  >
                    Update Attendance
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;