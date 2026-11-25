import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { nav } from "../data/content";
import Logo from "./Logo";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const toggleRef = useRef(null);
  const firstLinkRef = useRef(null);
  const menuId = useId();
  const { pathname } = useLocation();
  const [menuPath, setMenuPath] = useState(pathname);

  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || !("ResizeObserver" in window)) return undefined;
    const apply = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    firstLinkRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={headerRef} className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-bar">
        <Link to="/" className="logo">
          <Logo />
          <span className="logo-tag" aria-hidden="true">
            <span>Films</span>
            <i />
            <span>Documentaries</span>
            <i />
            <span>Events</span>
            <i />
            <span>Digital</span>
            <i />
            <span>Communications</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}>
              {item.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-line has-arrow">
            Let&apos;s collaborate
          </Link>
        </nav>

        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="menu-icon" aria-hidden="true" />
        </button>
      </div>

      <div
        id={menuId}
        className={`mobile-nav ${open ? "is-open" : ""}`}
        inert={open ? undefined : true}
        aria-hidden={open ? undefined : true}
      >
        <nav aria-label="Mobile">
          {nav.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              ref={index === 0 ? firstLinkRef : undefined}
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-gold has-arrow" onClick={() => setOpen(false)}>
            Let&apos;s collaborate
          </Link>
        </nav>
      </div>
    </header>
  );
}
