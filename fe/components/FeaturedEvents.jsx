import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  eventImage,
  formatEventPlace,
  formatEventWhen,
} from "../../cms/shared/event.js";
import { loadPublishedEvents } from "../data/publishedEvents";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    loadPublishedEvents()
      .then((events) => {
        if (!active) return;
        setEvents(events.filter((event) => event.homepage).slice(0, 3));
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!events.length) return null;

  const layout = events.length === 1 ? "is-single" : events.length === 2 ? "is-pair" : "is-trio";

  return (
    <section className="section home-events" aria-labelledby="home-events">
      <div className="container">
        <div className="section-head section-head-row home-events-head">
          <div>
            <p className="kicker">Events</p>
            <h2 id="home-events">On the calendar</h2>
          </div>
          <Link className="text-link" to="/events">
            All events
          </Link>
        </div>
        <div className={`home-events-list ${layout}`}>
          {events.map((event) => (
            <HomeEvent key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeEvent({ event }) {
  const image = event.heroImage || eventImage(event);
  const when = formatEventWhen(event);
  const place = formatEventPlace(event).filter(Boolean).join(", ");
  const meta = [when, place].filter(Boolean).join(" · ");

  return (
    <article className="home-event">
      <Link to={`/events/${event.slug}`}>
        <div className="home-event-media">
          {image ? (
            <img src={image} alt={event.heroAlt || ""} />
          ) : (
            <span className="event-panel-fallback" aria-hidden="true" />
          )}
        </div>
        <div className="home-event-copy">
          {event.category ? <p className="kicker">{event.category}</p> : null}
          <h3>{event.title}</h3>
          {event.subtitle ? <p className="home-event-subtitle">{event.subtitle}</p> : null}
          {meta ? <p className="home-event-meta">{meta}</p> : null}
          {event.shortDescription ? <p>{excerpt(event.shortDescription)}</p> : null}
          <span className="text-link">Explore event</span>
        </div>
      </Link>
    </article>
  );
}

function excerpt(text) {
  const plain = String(text || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}
