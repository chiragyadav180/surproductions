import { Link } from "react-router-dom";
import { nav, services, social } from "../data/content";
import Logo from "./Logo";

const year = new Date().getFullYear();

const socialIcons = {
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.7" cy="7.3" r="0.9" fill="currentColor" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.2 20v-7.1h2.4l.4-2.7h-2.8V8.6c0-.8.2-1.3 1.4-1.3H17V4.9c-.2 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v1.8H9v2.7h2.4V20h2.8Z"
        fill="currentColor"
      />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.2" y="7" width="17.6" height="10.2" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10.6 9.8 15.2 12l-4.6 2.2V9.8Z" fill="currentColor" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.2 9.4H4.8V19h2.4V9.4ZM6 4.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM19.2 19v-5.4c0-2.6-1.4-3.8-3.3-3.8-1.5 0-2.2.8-2.6 1.4V9.4H11c0 1.8 0 9.6 0 9.6h2.4v-5.3c0-.3 0-.5.1-.7.2-.5.7-1 1.5-1 1 0 1.4.8 1.4 1.9V19h2.8Z"
        fill="currentColor"
      />
    </svg>
  ),
};

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
            <nav className="footer-social" aria-label="Social media">
              {social.map((item) => {
                const isExternal = Boolean(item.href);
                return (
                  <a
                    key={item.name}
                    href={item.href || "/contact"}
                    {...(isExternal
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    aria-label={item.name}
                  >
                    {socialIcons[item.name]}
                  </a>
                );
              })}
            </nav>
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
