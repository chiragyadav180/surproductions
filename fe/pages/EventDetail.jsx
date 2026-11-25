import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seo from "../components/Seo";
import EventView from "../components/EventView";
import NotFound from "./NotFound";

export default function EventDetail() {
  const { slug } = useParams();
  const [payload, setPayload] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    fetch(`/api/events/${slug}`)
      .then((response) => {
        if (response.status === 404) throw new Error("missing");
        if (!response.ok) throw new Error("unavailable");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setPayload(data);
        setState("ready");
      })
      .catch((error) => {
        if (!active) return;
        setState(error.message === "missing" ? "missing" : "error");
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
