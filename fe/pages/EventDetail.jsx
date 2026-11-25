import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seo from "../components/Seo";
import EventView from "../components/EventView";
import NotFound from "./NotFound";
import { loadPublishedEvent } from "../data/publishedEvents";

export default function EventDetail() {
  const { slug } = useParams();
  const [payload, setPayload] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    loadPublishedEvent(slug)
      .then((data) => {
        if (!active) return;
        if (data.missing) {
          setState("missing");
          return;
        }
        setPayload(data);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (state === "missing") return <NotFound />;

  if (state === "loading") {
    return (
      <article>
        <p className="page-loading" role="status">Loading</p>
      </article>
    );
  }

  if (state === "error" || !payload?.event) {
    return (
      <article className="section">
        <div className="container event-empty">
          <h1>This event could not be loaded.</h1>
          <p>Check the connection and try the page again.</p>
        </div>
      </article>
    );
  }

  const { event, related } = payload;
  return (
    <>
      <Seo
        title={event.title}
        description={event.shortDescription || event.subtitle || event.tagline || event.title}
        path={`/events/${event.slug}`}
      />
      <EventView event={event} related={related || []} />
    </>
  );
}
