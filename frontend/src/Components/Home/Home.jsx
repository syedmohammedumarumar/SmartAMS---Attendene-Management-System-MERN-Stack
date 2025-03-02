import "./Home.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min"
import Footer from "../Footer/Footer"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <section className="home-container">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-header">

            <h1>SMART AMS</h1>
          </div>
          <p className="hero-subtitle">Eliminate the hassle of daily attendance updates with our smart system, allowing CRs to directly record attendance while faculty seamlessly verify it. Reduce confusion, save time, and enhance efficiency with a solution designed for smooth academic management.</p>
          <Link to={'/student'}  className="cta-button">Get Started</Link>
        </div>
        <div className="hero-image">
          <div className="blob"></div>
          <div className="blob-small"></div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="section how-it-works">
        <div className="section-header">
          <h2>How It Saves Time & Enhances Efficiency</h2>
          <div className="underline"></div>
        </div>
        <div className="steps">
          {[
            {
              icon: "bi-pencil-square",
              title: "Quick Attendance Logging",
              desc: "CR/LR mark their presence instantly, eliminating manual entries.",
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
              <div className="step-card">
                <div className="step-icon">
                  <i className={`bi ${step.icon}`}></i>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <span className="step-number">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objective Section */}
      <div className="section objective">
        <div className="objective-content">
          <div className="section-header">
            <h2>Our Objective</h2>
            <div className="underline"></div>
          </div>
          <p>
            Our mission is to simplify attendance management by providing a <br />
             <span className="highlight"> smart, accurate, and automated</span> solution.
            By reducing manual effort and minimizing
            errors, we empower
            <span className="highlight"> CRs and faculty</span> to focus on what truly matters—
            seamless academic administration and efficiency.
          </p>

          <div className="objective-icon">
            <i className="bi bi-bullseye"></i>
          </div>
        </div>
      </div>



      {/* <Footer /> */}
    </section>


  )
}

export default Home

