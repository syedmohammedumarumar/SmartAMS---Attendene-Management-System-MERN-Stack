import React from "react";
import "./Home.css"; // Import external CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Home = () => {
  return (
    <section className="home-container">
      <div className="content">
        <div className="flex">
          <div className="square-icon-box">
            <i className="bi bi-person-check"></i>
          </div>
          <h1 className="title">Attendance Visualizer</h1>
        </div>

        <p className="subtitle">
          Save time and improve accuracy with a seamless digital attendance
          system.
        </p>
      </div>

      {/* Step-by-Step Explanation Section */}
      <div className="how-it-works">
        <h2>How It Saves Time & Enhances Efficiency</h2>
        <div className="steps">
          {[
            {
              icon: "bi-pencil-square",
              title: "Quick Attendance Logging",
              desc: "Students mark their presence instantly, eliminating manual entries.",
            },
            {
              icon: "bi-share",
              title: "Instant Data Sharing",
              desc: "Attendance records are automatically shared with faculty.",
            },
            {
              icon: "bi-check-circle",
              title: "Easy Verification",
              desc: "Faculty verifies attendance with a single click.",
            },
          ].map((step, index) => (
            <div key={index} className="step">
              <div className="card">
                <div className="card-front">
                  <div className="card-icon">
                    <i className={`bi ${step.icon}`}></i>
                  </div>
                  <h3>{step.title}</h3>
                </div>
                <div className="card-back">
                  <p>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objective Section */}
      <div className="objective">
        <h2>🎯 Our Objective</h2>
        <p>
          Our goal is to create a{" "}
          <strong>smart, accurate, and effortless</strong> way to manage
          attendance. By automating the process, we minimize human errors and
          boost efficiency in academic institutions.
        </p>
      </div>

      {/* Key Features Section */}
      <div className="features">
        <h2>🚀 Key Features</h2>
        <div className="feature-list">
          {[
            {
              icon: "bi-speedometer2",
              title: "Fast & Efficient",
              desc: "Mark attendance in just seconds.",
            },
            {
              icon: "bi-shield-lock",
              title: "Highly Secure",
              desc: "Encrypted storage keeps data safe.",
            },
            {
              icon: "bi-pie-chart",
              title: "Visual Insights",
              desc: "Detailed analytics for better decisions.",
            },
            {
              icon: "bi-clock",
              title: "Time Efficiency",
              desc: "Eliminates manual tracking, saving hours.",
            },
            {
              icon: "bi-people",
              title: "Multi-User Support",
              desc: "Works for students & faculty seamlessly.",
            },
            {
              icon: "bi-cloud-upload",
              title: "Cloud Storage",
              desc: "Access attendance data anytime, anywhere.",
            },
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <i className={`bi ${feature.icon}`}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
