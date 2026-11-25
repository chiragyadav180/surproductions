import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EventCard } from "./EventView";

export default function FeaturedEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/api/events")
      .then((response) => (response.ok ? response.json() : { events: [] }))
      .then((data) => {
        if (!active) return;
        const chosen = (data.events || []).filter((event) => event.homepage).slice(0, 3);
        setEvents(chosen);
      })
      .catch(() => {
        if (active) setEvents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!events.length) return null;

  return (
    <section className="section" aria-labelledby="home-events">
      <div className="container">
        <div className="section-head section-head-row">
          <div>
            <p className="kicker">Events</p>
            <h2 id="home-events">On the calendar</h2>
          </div>
          <Link className="text-link" to="/events">
            All events
          </Link>
        </div>
        <div className="event-card-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
