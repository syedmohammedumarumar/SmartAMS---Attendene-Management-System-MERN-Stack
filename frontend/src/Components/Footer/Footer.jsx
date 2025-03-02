import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Branding Section */}
        <div className="footer-brand">
          <h2>Attendance Visualizer</h2>
          <p>Enhancing efficiency with a seamless digital attendance system.</p>
        </div>

        {/* Navigation Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Features</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:support@attendancevisualizer.com">support@attendancevisualizer.com</a></p>
          <p>Phone: <a href="tel:+919876543210">+91 98765 43210</a></p>
          <div className="social-icons">
            <a href="#"><i className="bi bi-facebook"></i></a>
            <a href="#"><i className="bi bi-twitter"></i></a>
            <a href="#"><i className="bi bi-instagram"></i></a>
            <a href="#"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Smart AMS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
