import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyDashboard.css"; // We'll create this CSS file

// API base URL
const API_URL = "https://smartams-backend-1pdd.onrender.com/api";

// Time slots for classes (same as in student dashboard)
const timeSlots = [
  "9:10-10:10 AM", "10:10-11:10 AM", "11:10-12:10 PM", "12:10-1:00 PM",
  "1:00-2:00 PM", "2:00-3:00 PM", "3:00-4:00 PM", "4:00-5:00 PM"
];

const FacultyDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    percentPresent: 0
  });

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

  // Fetch faculty classes from the API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = getAxiosConfig();
      const response = await axios.get(`${API_URL}/faculty/classes`, config);
      
      if (response.data.success) {
        setClasses(response.data.data);
        
        // Select the first class by default if there are classes
        if (response.data.data.length > 0) {
          setSelectedClass(response.data.data[0]);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch classes");
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(`Failed to load classes: ${err.response?.status === 401 ? "Authentication error" : err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data for a specific class, time slot, and date
  const fetchAttendance = async () => {
    if (!selectedClass || !selectedClass._id) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const config = getAxiosConfig();
      const url = `${API_URL}/faculty/attendance?timeSlot=${encodeURIComponent(selectedSlot)}&classId=${selectedClass._id}&date=${currentDate}`;
      
      console.log(`Fetching attendance data from: ${url}`);
      const response = await axios.get(url, config);
      
      if (response.data.success) {
        const data = response.data.data;
        setAttendanceData(data);
        
        // Calculate statistics
        if (data && data.attendance && Array.isArray(data.attendance)) {
          const presentCount = data.attendance.filter(record => record.status === "Present").length;
          const absentCount = data.attendance.filter(record => record.status === "Absent").length;
          const total = presentCount + absentCount;
          
          setStats({
            totalPresent: presentCount,
            totalAbsent: absentCount,
            percentPresent: total > 0 ? Math.round((presentCount / total) * 100) : 0
          });
        } else {
          setStats({
            totalPresent: 0,
            totalAbsent: 0,
            percentPresent: 0
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch attendance data");
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      
      if (err.response && err.response.status === 404) {
        // If attendance record not found, just set it to null without showing error
        setAttendanceData(null);
        setStats({
          totalPresent: 0,
          totalAbsent: 0,
          percentPresent: 0
        });
      } else {
        setError(`Failed to load attendance: ${err.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize dashboard by loading classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch attendance when selected class, time slot, or date changes
  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, selectedSlot, currentDate]);

  // Handle class selection change
  const handleClassChange = (e) => {
    const classId = e.target.value;
    const classObj = classes.find(c => c._id === classId);
    setSelectedClass(classObj);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setCurrentDate(e.target.value);
  };

  // Generate downloadable attendance report
  const handleDownloadReport = () => {
    if (!attendanceData || !attendanceData.attendance) {
      alert("No attendance data available to download");
      return;
    }
    
    // Create CSV content
    let csvContent = "Student Number,Status\n";
    attendanceData.attendance.forEach(record => {
      csvContent += `${record.studentNumber},${record.status}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `attendance_${selectedClass.name}_${currentDate}_${selectedSlot.replace(/\s/g, "_")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="faculty-dashboard-container">
      <h2 className="dashboard-title">Faculty Dashboard</h2>
      
      {/* Class and Date Selector Section */}
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="class-selector">Select Class:</label>
          <select
            id="class-selector"
            className="class-selector"
            value={selectedClass ? selectedClass._id : ""}
            onChange={handleClassChange}
            disabled={loading || classes.length === 0}
          >
            {classes.length === 0 ? (
              <option value="">No classes available</option>
            ) : (
              classes.map(classObj => (
                <option key={classObj._id} value={classObj._id}>
                  {classObj.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="date-selector">Select Date:</label>
          <input
            type="date"
            id="date-selector"
            className="date-selector"
            value={currentDate}
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Error Message Display */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Time Slot Selector */}
      {!loading && selectedClass && (
        <div className="time-slots-section">
          <h3>Select Time Slot</h3>
          <div className="time-slots-grid">
            {timeSlots.map(slot => (
              <button
                key={slot}
                className={`time-slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && <div className="loading-spinner">Loading...</div>}
      
      {/* Attendance Display Section */}
      {!loading && selectedClass && (
        <div className="attendance-section">
          <div className="attendance-header">
            <h3>{selectedClass.name} - Attendance for {selectedSlot}</h3>
            <h4 className="attendance-date">{currentDate}</h4>
          </div>
          
          {/* Attendance Stats */}
          <div className="attendance-stats">
            <div className="stat-card">
              <h4>Present</h4>
              <div className="stat-value present">{stats.totalPresent}</div>
            </div>
            <div className="stat-card">
              <h4>Absent</h4>
              <div className="stat-value absent">{stats.totalAbsent}</div>
            </div>
            <div className="stat-card">
              <h4>Attendance %</h4>
              <div className="stat-value percent">{stats.percentPresent}%</div>
            </div>
          </div>
          
          {/* Attendance Data Table */}
          {attendanceData && attendanceData.attendance && attendanceData.attendance.length > 0 ? (
            <>
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Student Number</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.attendance.map(record => (
                      <tr key={record.studentNumber} className={record.status === "Present" ? "present-row" : "absent-row"}>
                        <td>{record.studentNumber}</td>
                        <td className={record.status === "Present" ? "status-present" : "status-absent"}>
                          {record.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Download Report Button */}
              <button 
                className="download-btn"
                onClick={handleDownloadReport}
              >
                Download Attendance Report
              </button>
            </>
          ) : (
            <div className="no-data-message">
              No attendance data available for this class, time slot, and date.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
