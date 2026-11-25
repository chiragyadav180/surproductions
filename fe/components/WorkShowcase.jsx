import { useState } from "react";
import { Link } from "react-router-dom";
import { projectCategories, workHighlights } from "../data/content";

const filterIcons = {
  All: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" fill="currentColor" />
    </svg>
  ),
  Films: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="6" width="14" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 6v12M15 6v12M5 10h14M5 14h14" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Documentaries: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 9.2 16 12l-6 2.8V9.2Z" fill="currentColor" />
    </svg>
  ),
  "Award Shows": (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 5h8v3a4 4 0 0 1-8 0V5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M9 16h6M10 16v3h4v-3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 6h3v2a3 3 0 0 1-3 3M8 6H5v2a3 3 0 0 0 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  Events: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 10h16M8 4v4M16 4v4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  "Digital Campaigns": (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  "Brand Communications": (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 10v4h3l5 3V7L8 10H5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M16.5 9.5a3 3 0 0 1 0 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
};

export default function WorkShowcase({ variant = "section", showCta = false }) {
  const [category, setCategory] = useState("All");
  const visible =
    category === "All"
      ? workHighlights
      : workHighlights.filter((item) => item.filters.includes(category));

  return (
    <section className={`work-showcase work-showcase-${variant}`} id="work" aria-labelledby="work-title">
      <div className="work-showcase-glow" aria-hidden="true" />
      <div className="container">
        <div className="work-showcase-head">
          <p className="kicker work-kicker">Our work</p>
          <h2 id="work-title">Pictures with a point of view.</h2>
          <p className="lede">
            Films, documentaries, award shows, events, digital campaigns and more.
          </p>
        </div>

        <div className="work-filters" role="toolbar" aria-label="Filter work">
          {projectCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "is-active" : undefined}
              aria-pressed={item === category}
              onClick={() => setCategory(item)}
            >
              {filterIcons[item]}
              <span>{item === "Digital Campaigns" ? "Digital Campaigns" : item}</span>
            </button>
          ))}
        </div>

        <div
          className={`work-bento ${visible.length === 1 ? "is-single" : ""} ${visible.length === 2 ? "is-pair" : ""}`}
        >
          {visible.map((item) => (
            <Link
              key={item.slug}
              to={`/work/${item.slug}`}
              className={`work-tile is-${item.size}`}
            >
              <img src={item.image} alt="" loading="lazy" decoding="async" />
              <span className="work-tile-shade" aria-hidden="true" />
              <span className="work-tile-badge">{item.category}</span>
              <span className="work-tile-copy">
                <strong>{item.title}</strong>
                <em>{item.line}</em>
              </span>
              <span className="work-tile-go" aria-hidden="true">
                ↗
              </span>
            </Link>
          ))}
        </div>

        {showCta ? (
          <div className="work-showcase-cta">
            <Link className="btn btn-line has-arrow" to="/work">
              Explore our work
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
