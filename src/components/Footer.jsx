import { Link } from "react-router-dom";
import { nav, services } from "../data/content";
import Logo from "./Logo";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">
              <Logo />
            </Link>
            <p>
              Films, documentaries, events, digital and communications. Stories,
              experiences and communication that make an impact.
            </p>
          </div>

          <div>
            <h2>Navigate</h2>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Services</h2>
            <ul>
              {services.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`}>{service.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Enquiry</h2>
            <p>
              Email, phone and studio location will be published here when they are
              supplied.
            </p>
            <Link to="/contact" className="text-link">
              Start an enquiry
            </Link>
          </div>
        </div>

        <div className="footer-base">
          <p>© {year} SUR Productions. All rights reserved.</p>
          <nav aria-label="Legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms and Conditions</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
