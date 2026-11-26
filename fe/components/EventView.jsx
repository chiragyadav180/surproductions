import { Link } from "react-router-dom";
import {
  CONFIRMATIONS,
  EVENT_STATUSES,
  REGISTRATION_STATUSES,
  eventImage,
  formatEventPlace,
  formatEventWhen,
  labelFor,
  visiblePageBlocks,
} from "../../cms/shared/event.js";

export default function EventView({ event, related = [] }) {
  const when = formatEventWhen(event);
  const place = formatEventPlace(event);
  const blocks = visiblePageBlocks(event);
  const hero = event.heroImage || event.coverImage || "";
  const intro = (event.description || event.shortDescription || "").trim();
  const where = place.filter(Boolean).join(" · ");
  const whenLabel = when && event.dateStatus === "tentative" ? `${when} · Tentative` : when;

  return (
    <article className="event-page">
      <header className={`event-hero ${hero ? "has-image" : "is-plain"}`}>
        {hero ? null : <div className="hero-shade" aria-hidden="true" />}
        <div className="container event-hero-layout">
        {hero ? (
          <div className="event-poster">
            <img src={hero} alt={event.heroAlt || event.title} />
          </div>
        ) : null}
        <div className="event-hero-copy">
          <p className="kicker">{event.category || "Event"}</p>
          <h1>{event.title}</h1>
          {event.subtitle ? <p className="event-subtitle">{event.subtitle}</p> : null}
          {event.tagline ? <p className="event-tagline">{event.tagline}</p> : null}
          <ul className="event-hero-meta">
            <li>{labelFor(EVENT_STATUSES, event.eventStatus)}</li>
            {whenLabel ? <li>{whenLabel}</li> : null}
            {where ? <li>{where}</li> : null}
          </ul>
        </div>
        </div>
      </header>

      {intro ? (
        <section className="section event-intro">
          <div className="container">
            <div className="event-intro-copy">
              <Prose text={intro} skipTitle={event.title} />
              {event.videoUrl ? (
                <p>
                  <a className="text-link" href={event.videoUrl} target="_blank" rel="noreferrer">
                    Watch the film
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {blocks.map((block) => (
        <EventBlock key={block.key} block={block.key} event={event} />
      ))}

      {related.length ? (
        <section className="section" aria-labelledby="related-events">
          <div className="container">
            <div className="section-head section-head-row">
              <h2 id="related-events">Other events</h2>
              <Link className="text-link" to="/events">
                All events
              </Link>
            </div>
            <div className="event-card-grid">
              {related.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

function EventBlock({ block, event }) {
  if (block === "story") return <Story event={event} />;
  if (block === "highlights") return <Highlights event={event} />;
  if (block === "speakers") return <Speakers event={event} />;
  if (block === "agenda") return <Agenda event={event} />;
  if (block === "zones") return <Zones event={event} />;
  if (block === "audience") return <Audience event={event} />;
  if (block === "benefits") return <Benefits event={event} />;
  if (block === "media") return <MediaNotes event={event} />;
  if (block === "gallery") return <Gallery event={event} />;
  if (block === "cta") return <CallToAction event={event} />;
  return null;
}

function Story({ event }) {
  const sections = (event.sections || []).filter(
    (item) => item.visible !== false && (item.heading || item.body || item.image),
  );
  return (
    <div className="event-sections">
      {sections.map((section, index) => (
        <section className="section event-section" key={section.id} aria-labelledby={`section-${section.id}`}>
          <div className="container event-block">
            {section.image ? (
              <figure className="event-section-media">
                <img src={section.image} alt={section.imageAlt || ""} />
              </figure>
            ) : null}
            <div className="event-block-copy">
              <div className="event-section-kicker">
                <p className="index">{String(index + 1).padStart(2, "0")}</p>
                {section.icon ? <p className="kicker">{section.icon}</p> : null}
              </div>
              {section.heading ? <h2 id={`section-${section.id}`}>{section.heading}</h2> : <h2 id={`section-${section.id}`} className="sr-only">Section</h2>}
              {section.subtitle ? <p className="event-section-lead">{section.subtitle}</p> : null}
              <SectionCopy text={section.body} />
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Highlights({ event }) {
  const items = (event.highlights || []).filter((item) => item.title || item.description);
  return (
    <section className="section" aria-labelledby="event-highlights">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Highlights</p>
          <h2 id="event-highlights">What this event holds</h2>
        </div>
        <div className="event-card-grid">
          {items.map((item, index) => (
            <article className="event-panel" key={item.id}>
              {item.image ? (
                <div className="event-panel-media">
                  <img src={item.image} alt="" />
                </div>
              ) : (
                <p className="index">{String(index + 1).padStart(2, "0")}</p>
              )}
              {item.title ? <h3>{item.title}</h3> : null}
              {item.description ? <p>{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Speakers({ event }) {
  const people = (event.speakers || []).filter((item) => item.name);
  return (
    <section className="section" aria-labelledby="event-speakers">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Speakers and guests</p>
          <h2 id="event-speakers">Voices on the programme</h2>
        </div>
        <div className="event-people">
          {people.map((person) => (
            <article className="event-person" key={person.id}>
              <div className="event-person-photo">
                {person.photo ? (
                  <img src={person.photo} alt={person.name} />
                ) : (
                  <span aria-hidden="true">{initials(person.name)}</span>
                )}
              </div>
              <div>
                <p className="event-badge">{labelFor(CONFIRMATIONS, person.confirmation)}</p>
                <h3>{person.name}</h3>
                {person.designation ? <p className="event-role">{person.designation}</p> : null}
                {person.sessionTitle ? <p className="event-role">{person.sessionTitle}</p> : null}
                {person.category ? <p className="kicker">{person.category}</p> : null}
                {person.bio ? <p>{person.bio}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Agenda({ event }) {
  const sessions = (event.sessions || []).filter((item) => item.title);
  return (
    <section className="section" aria-labelledby="event-agenda">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Agenda</p>
          <h2 id="event-agenda">{event.scheduleStatus === "final" ? "The running order" : "The shape of the day"}</h2>
        </div>
        <ol className="event-agenda">
          {sessions.map((session) => (
            <li key={session.id}>
              <div className="event-agenda-time">
                <strong>{session.category || "Session"}</strong>
                <span>
                  {[session.startTime, session.endTime].filter(Boolean).join(" – ") || "Time to be set"}
                </span>
              </div>
              <div>
                <h3>{session.title}</h3>
                {session.speakers ? <p className="event-role">{session.speakers}</p> : null}
                {session.stage ? <p className="event-role">{session.stage}</p> : null}
                {session.description ? <p>{session.description}</p> : null}
                {session.confirmation !== "confirmed" ? (
                  <p className="event-badge">{labelFor(CONFIRMATIONS, session.confirmation)}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Zones({ event }) {
  const zones = (event.zones || []).filter((item) => item.title || item.description);
  return (
    <section className="section" aria-labelledby="event-zones">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Experience</p>
          <h2 id="event-zones">Experience zones</h2>
        </div>
        <div className="event-card-grid">
          {zones.map((zone) => (
            <article className="event-panel" key={zone.id}>
              <div className="event-panel-media">
                {zone.image ? <img src={zone.image} alt="" /> : <span className="event-panel-fallback" aria-hidden="true" />}
              </div>
              {zone.category ? <p className="kicker">{zone.category}</p> : null}
              {zone.title ? <h3>{zone.title}</h3> : null}
              {zone.description ? <p>{zone.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Audience({ event }) {
  return (
    <section className="section" aria-labelledby="event-audience">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Audience</p>
          <h2 id="event-audience">Who it is for</h2>
        </div>
        <ul className="event-chips">
          {event.audiences.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Benefits({ event }) {
  const items = (event.benefits || []).filter((item) => item.title || item.description);
  return (
    <section className="section" aria-labelledby="event-benefits">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Outcomes</p>
          <h2 id="event-benefits">Why it matters</h2>
        </div>
        <div className="event-benefit-grid">
          {items.map((item) => (
            <article key={item.id}>
              {item.title ? <h3>{item.title}</h3> : null}
              {item.description ? <p>{item.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaNotes({ event }) {
  const phases = [
    ["Before", event.media?.before],
    ["During", event.media?.during],
    ["After", event.media?.after],
  ].filter(([, copy]) => copy);
  return (
    <section className="section" aria-labelledby="event-media">
      <div className="container">
        <div className="section-head">
          <p className="kicker">Media</p>
          <h2 id="event-media">Media and communication</h2>
        </div>
        {phases.length ? (
          <div className="event-phase-grid">
            {phases.map(([label, copy]) => (
              <article key={label}>
                <p className="kicker">{label}</p>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        ) : null}
        {event.media?.coverage ? (
          <div className="event-extra">
            <h3>Coverage</h3>
            <p>{event.media.coverage}</p>
          </div>
        ) : null}
        {event.media?.press ? (
          <div className="event-extra">
            <h3>Press</h3>
            <p>{event.media.press}</p>
          </div>
        ) : null}
        {event.media?.social?.length ? (
          <ul className="event-social">
            {event.media.social.map((item) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.label || item.url}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function Gallery({ event }) {
  const images = (event.gallery || []).filter((item) => item.url);
  if (!images.length) return null;
  return (
    <section className="section" aria-labelledby="event-gallery">
      <div className="container">
        <div className="section-head">
          <h2 id="event-gallery">Gallery</h2>
        </div>
        <div className="gallery event-gallery">
          {images.map((image) => (
            <figure key={image.id}>
              <img src={image.url} alt={image.alt || image.caption || ""} />
              {image.caption || image.credit ? (
                <figcaption>
                  {image.caption}
                  {image.credit ? <span>{image.credit}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction({ event }) {
  const actions = [
    event.registrationUrl ? ["Register", event.registrationUrl] : null,
    event.ticketUrl ? ["Tickets", event.ticketUrl] : null,
    event.enquiryUrl ? ["Enquire", event.enquiryUrl] : null,
  ].filter(Boolean);
  return (
    <section className="section event-cta-band" aria-labelledby="event-cta">
      <div className="container event-cta-inner">
        <div>
          <p className="kicker">{labelFor(REGISTRATION_STATUSES, event.registrationStatus) || "Attend"}</p>
          <h2 id="event-cta">{event.ctaText || "Ask about this event"}</h2>
        </div>
        {actions.length ? (
          <div className="event-cta-actions">
            {actions.map(([label, href], index) => (
              <a
                key={label}
                className={`btn ${index === 0 ? "btn-gold" : "btn-line"} has-arrow`}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EventCard({ event }) {
  const image = eventImage(event);
  const when = formatEventWhen(event);
  const place = formatEventPlace(event);
  return (
    <article className="event-card">
      <Link to={`/events/${event.slug}`}>
        <div className="event-card-media">
          {image ? <img src={image} alt="" /> : <span className="event-panel-fallback" aria-hidden="true" />}
        </div>
        <div className="event-card-copy">
          <p className="kicker">{event.category || labelFor(EVENT_STATUSES, event.eventStatus)}</p>
          <h3>{event.title}</h3>
          <p className="event-card-meta">
            {[when, place[1] || event.city].filter(Boolean).join(" · ") || labelFor(EVENT_STATUSES, event.eventStatus)}
          </p>
          {event.shortDescription ? <p>{plainExcerpt(event.shortDescription)}</p> : null}
          <span className="text-link">Explore event</span>
        </div>
      </Link>
    </article>
  );
}

export function EventFeature({ event }) {
  const image = event.heroImage || eventImage(event);
  const when = formatEventWhen(event);
  const place = formatEventPlace(event);
  return (
    <article className="event-feature">
      <Link to={`/events/${event.slug}`}>
        <div className="event-feature-media">
          {image ? <img src={image} alt={event.heroAlt || ""} /> : <span className="event-panel-fallback" aria-hidden="true" />}
        </div>
        <div className="event-feature-copy">
          <p className="kicker">Featured</p>
          <h2>{event.title}</h2>
          {event.subtitle ? <p className="event-subtitle">{event.subtitle}</p> : null}
          <p className="event-card-meta">
            {[when, place.filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
          </p>
          {event.shortDescription ? <p>{plainExcerpt(event.shortDescription)}</p> : null}
          <span className="text-link">Explore event</span>
        </div>
      </Link>
    </article>
  );
}

function SectionCopy({ text }) {
  const groups = groupCopy(text);
  if (!groups.length) return null;
  const chunks = [];
  groups.forEach((group) => {
    if (group.heading) {
      const last = chunks[chunks.length - 1];
      if (last?.type === "points") last.items.push(group);
      else chunks.push({ type: "points", items: [group] });
      return;
    }
    chunks.push({ type: "note", group });
  });

  return (
    <div className="event-prose event-section-copy">
      {chunks.map((chunk, index) => {
        if (chunk.type === "note") {
          return (
            <div className="event-note" key={`note-${index}`}>
              {renderParts(chunk.group.parts)}
            </div>
          );
        }
        const layout = chunk.items.length > 4 ? "list" : chunk.items.length > 1 ? "columns" : "single";
        return (
          <div className={`event-points is-${layout}`} key={`points-${index}`}>
            {chunk.items.map((group, pointIndex) => {
              const label = pointLabel(group.heading, pointIndex + 1);
              const { lead, parts } = splitLead(group.parts);
              return (
                <article className="event-point" key={`${group.heading}-${pointIndex}`}>
                  <p className="event-point-index">{label.index}</p>
                  <div className="event-point-copy">
                    <h3>{label.title}</h3>
                    {lead ? <p className="event-point-label">{lead}</p> : null}
                    {renderParts(parts)}
                  </div>
                </article>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function pointLabel(heading, position) {
  const numbered = String(heading || "").match(/^\d+\.\s+(.+)$/);
  return {
    index: String(position).padStart(2, "0"),
    title: numbered ? numbered[1] : heading,
  };
}

function splitLead(parts) {
  const source = parts || [];
  const first = source[0];
  if (!first || first.type !== "p") return { lead: "", parts: source };
  const match = String(first.text || "").match(/^([A-Za-z][A-Za-z &/-]{1,32})\.\s+(\S.*)$/);
  if (!match) return { lead: "", parts: source };
  const lead = match[1].trim();
  if (lead.split(/\s+/).length > 3) return { lead: "", parts: source };
  return {
    lead,
    parts: [{ ...first, text: match[2].trim() }, ...source.slice(1)],
  };
}

function renderParts(parts) {
  return parts.map((part, index) => {
    if (part.type === "pull") return <p className="event-pull" key={index}>{part.text}</p>;
    if (part.type === "ul") {
      return (
        <ul key={index}>
          {part.items.map((item) => (
            <li key={item}>{inlineCopy(item)}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{inlineCopy(part.text)}</p>;
  });
}

function groupCopy(text) {
  const groups = [];
  let current = null;
  const open = (heading) => {
    current = { heading, parts: [] };
    groups.push(current);
  };
  parseCopy(text).forEach((block) => {
    if (block.type === "h") {
      open(block.text);
      return;
    }
    if (block.type === "ul") {
      open("");
      current.parts.push(block);
      current = null;
      return;
    }
    if (!current) open("");
    current.parts.push(block);
  });
  return groups.filter((group) => group.heading || group.parts.length);
}

function Prose({ text, skipTitle = "" }) {
  const blocks = parseCopy(text).filter(
    (block, index) => !(index === 0 && block.type === "h" && sameTitle(block.text, skipTitle)),
  );
  if (!blocks.length) return null;
  return blocks.map((block, index) => {
    if (block.type === "h") {
      const Tag = block.level === 1 ? "h2" : "h3";
      return <Tag key={index}>{block.text}</Tag>;
    }
    if (block.type === "pull") return <p className="event-pull" key={index}>{block.text}</p>;
    if (block.type === "ul") {
      return (
        <ul key={index}>
          {block.items.map((item) => (
            <li key={item}>{inlineCopy(item)}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{inlineCopy(block.text)}</p>;
  });
}

function parseCopy(text) {
  if (!text) return [];
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const value = paragraph.join(" ").trim();
    paragraph = [];
    const pull = value.match(/^\*\*([^*]+)\*\*$/);
    if (pull) {
      const line = pull[1].trim();
      if (/^\d+\./.test(line)) blocks.push({ type: "h", level: 3, text: line });
      else blocks.push({ type: "pull", text: line });
      return;
    }
    blocks.push({ type: "p", text: value });
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "ul", items: list });
    list = [];
  };

  text.replace(/\r\n/g, "\n").split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h", level: heading[1].length, text: heading[2].replace(/\*\*/g, "").trim() });
      return;
    }
    const item = trimmed.match(/^[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return blocks;
}

function inlineCopy(text) {
  const parts = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let cursor = 0;
  let match = pattern.exec(text);
  while (match) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<strong key={`${match.index}-${cursor}`}>{match[1] || match[2]}</strong>);
    cursor = match.index + match[0].length;
    match = pattern.exec(text);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

function plainExcerpt(text) {
  const plain = String(text || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .split(/\n{2,}/)[0]
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177).replace(/\s+\S*$/, "")}…`;
}

function sameTitle(left, right) {
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return Boolean(normalize(left)) && normalize(left) === normalize(right);
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}
