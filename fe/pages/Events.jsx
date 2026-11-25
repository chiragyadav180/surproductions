import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import { EventCard, EventFeature } from "../components/EventView";
import { EVENT_STATUSES } from "../../cms/shared/event.js";
import { loadPublishedEvents } from "../data/publishedEvents";

const filters = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [state, setState] = useState("loading");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    loadPublishedEvents()
      .then((events) => {
        if (!active) return;
        setEvents(events);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const featured = events.find((event) => event.featured) || null;
  const visible = events.filter((event) => {
    if (featured && event.id === featured.id) return false;
    if (filter === "all") return true;
    return event.eventStatus === filter;
  });
  const featuredVisible = featured && (filter === "all" || featured.eventStatus === filter);

  return (
    <article>
      <Seo
        title="Events"
        description="Live events produced by SUR Productions. Award shows, festivals and large-scale experiences."
        path="/events"
      />
      <PageHero
        kicker="Events"
        title="Nights, stages and rooms with a point of view."
        lede="Each event has its own story. What is published here is ready to be seen."
      />

      <section className="section event-index">
        <div className="container">
          <div className="event-toolbar">
            <div className="event-filters" role="toolbar" aria-label="Filter events">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={filter === item.id ? "is-active" : ""}
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="event-count">
              {state === "ready" ? `${events.length} published` : "Events"}
            </p>
          </div>

          {state === "loading" ? <p className="event-status-line">Loading events</p> : null}
          {state === "error" ? (
            <div className="event-empty">
              <h2>Events are unavailable right now.</h2>
              <p>Refresh the page in a moment. Published events will appear here.</p>
            </div>
          ) : null}
          {state === "ready" && events.length === 0 ? (
            <div className="event-empty">
              <h2>No published events yet.</h2>
              <p>
                New events are added in the studio CMS. Each one can carry its own sections,
                speakers, agenda and images. This page stays empty until an event is published.
              </p>
              <Link className="text-link" to="/contact">
                Plan an event
              </Link>
            </div>
          ) : null}
          {state === "ready" && events.length > 0 && !featuredVisible && visible.length === 0 ? (
            <div className="event-empty">
              <h2>Nothing in {EVENT_STATUSES.find((item) => item.value === filter)?.label.toLowerCase()} yet.</h2>
              <p>Try another filter. Only published events are listed.</p>
            </div>
          ) : null}

          {featuredVisible ? <EventFeature event={featured} /> : null}
          {visible.length ? (
            <div className="event-card-grid">
              {visible.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}
