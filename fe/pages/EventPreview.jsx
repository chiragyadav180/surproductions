import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EventView from "../components/EventView";
import { api } from "../../cms/api.js";

export default function EventPreview() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    api(`/api/admin/events/${id}`)
      .then((data) => {
        if (!active) return;
        setEvent(data.event);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state === "loading") return <p className="page-loading">Loading preview</p>;
  if (state === "error" || !event) {
    return (
      <article className="section">
        <div className="container event-empty">
          <h1>Preview is not available.</h1>
          <p>Sign in to the CMS and open the event again.</p>
          <Link className="text-link" to="/cms/admin/login">
            CMS sign in
          </Link>
        </div>
      </article>
    );
  }

  return (
    <>
      <p className="event-preview-bar">
        Preview · {event.publicationStatus} · this page is not public until the event is published.
        <Link to={`/cms/admin/events/${event.id}`}>Back to editor</Link>
      </p>
      <EventView event={event} />
    </>
  );
}
