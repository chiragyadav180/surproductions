import { collaborators } from "../data/content";

const marks = {
  Northframe: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <rect x="4" y="8" width="28" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 12h28M14 8v20M22 8v20" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  "Lumen Stage": (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 6v6M10 10l4 4M26 10l-4 4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="22" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15 29h6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Goldline: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M11 18h14M18 11v14" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Arclight: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M8 24c4-10 16-10 20 0" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="14" r="4" fill="currentColor" />
    </svg>
  ),
  "Velvet Reel": (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18" r="3" fill="currentColor" />
      <path d="M18 8v4M18 24v4M8 18h4M24 18h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  Kinegraph: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <rect x="7" y="10" width="22" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 16l8 4-8 4v-8Z" fill="currentColor" />
    </svg>
  ),
  Marque: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M7 26 18 8l11 18H7Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M18 14v6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Feverlight: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 6c6 6 8 10 8 14a8 8 0 1 1-16 0c0-4 2-8 8-14Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  "Studio Atlas": (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 18h20M18 7c3 4 4.5 7 4.5 11S21 25 18 29c-3-4-4.5-7-4.5-11S15 11 18 7Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  Daybreak: (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M6 24h24" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M18 10v8M10 14l3 3M26 14l-3 3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="20" r="3.2" fill="currentColor" />
    </svg>
  ),
};

function Track({ items, ariaHidden = false }) {
  return (
    <ul className="collab-track" aria-hidden={ariaHidden || undefined}>
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          <span className="collab-mark">
            {marks[item.name]}
            {item.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function CollaboratorMarquee() {
  const loop = [...collaborators, ...collaborators];

  return (
    <section className="collab-marquee" aria-label="In collaboration with">
      <div className="container">
        <p className="kicker collab-kicker">
          In <span>collaboration</span> with
        </p>
      </div>
      <div className="collab-row">
        <Track items={loop} />
        <Track items={loop} ariaHidden />
      </div>
      <div className="collab-row is-reverse">
        <Track items={loop} ariaHidden />
        <Track items={loop} ariaHidden />
      </div>
    </section>
  );
}
