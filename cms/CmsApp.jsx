import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, setCsrf } from "./api.js";
import { labelFor, PUBLICATION_STATUSES, EVENT_STATUSES, formatEventWhen } from "./shared/event.js";
import EventEditor from "./EventEditor";
import "./cms.css";

const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
}

export default function CmsApp() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    api("/api/admin/me")
      .then((data) => {
        if (!active) return;
        if (!data.email) throw new Error("Sign in required.");
        setCsrf(data.csrf);
        setUser({ email: data.email });
      })
      .catch((err) => {
        if (!active) return;
        setUser(null);
        setOffline(err.status === 503);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return (
    <AuthContext.Provider value={value}>
      <CmsRoutes ready={ready} offline={offline} />
    </AuthContext.Provider>
  );
}

function CmsRoutes({ ready, offline }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const rest = pathname.slice("/cms/admin".length).replace(/^\//, "");

  if (!ready) return <p className="page-loading">Loading</p>;
  if (offline) return <StudioOffline />;
  if (rest === "login") return <Login />;
  if (!user) return <Navigate to="/cms/admin/login" replace />;

  let page = <Overview />;
  if (rest === "events") page = <EventList />;
  else if (rest === "events/new") page = <EventEditor />;
  else if (rest.startsWith("events/")) page = <EventEditor id={decodeURIComponent(rest.slice("events/".length))} />;

  return (
    <Shell active={rest.startsWith("events") ? "events" : "overview"}>
      {page}
    </Shell>
  );
}

function StudioOffline() {
  return (
    <main className="cms-login">
      <div className="cms-login-card">
        <p className="kicker">SUR Productions</p>
        <h1>Studio CMS</h1>
        <p>The studio server did not respond. Refresh the page and try signing in again.</p>
        <Link to="/">Back to the website</Link>
      </div>
    </main>
  );
}

function Login() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/cms/admin" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setCsrf(data.csrf);
      setUser({ email: data.email });
      navigate("/cms/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="cms-login">
      <form className="cms-login-card" onSubmit={onSubmit}>
        <p className="kicker">SUR Productions</p>
        <h1>Studio CMS</h1>
        <p>Sign in to publish events. Search settings stay outside this CMS.</p>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="cms-error">{error}</p> : null}
        <button className="btn btn-gold" type="submit" disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </button>
        <Link to="/">Back to the website</Link>
      </form>
    </main>
  );
}

function Shell({ active, children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function logout() {
    try {
      await api("/api/admin/logout", { method: "POST" });
    } catch {
      /* The session is cleared locally either way. */
    }
    setCsrf("");
    setUser(null);
    navigate("/cms/admin/login", { replace: true });
  }

  return (
    <div className="cms-shell">
      <aside className="cms-side">
        <Link to="/" className="cms-brand">
          SUR
          <span>Productions</span>
        </Link>
        <nav aria-label="CMS">
          <Link className={active === "overview" ? "is-active" : ""} to="/cms/admin">
            Overview
          </Link>
          <Link className={active === "events" ? "is-active" : ""} to="/cms/admin/events">
            Events
          </Link>
        </nav>
        <div className="cms-side-foot">
          <p>{user?.email}</p>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <div className="cms-main">
        <div className="cms-main-inner">{children}</div>
      </div>
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/admin/overview")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="cms-error">{error}</p>;
  if (!data) return <p>Loading the studio.</p>;
  if (!data.stats) return <p className="cms-error">The studio could not be loaded.</p>;

  const recent = Array.isArray(data.recent) ? data.recent : [];
  const cards = [
    ["Events", data.stats.total ?? 0],
    ["Published", data.stats.published ?? 0],
    ["Drafts", data.stats.draft ?? 0],
    ["Archived", data.stats.archived ?? 0],
    ["Upcoming", data.stats.upcoming ?? 0],
  ];

  return (
    <>
      <header className="cms-page-head">
        <div>
          <p className="kicker">Overview</p>
          <h1>Content studio</h1>
          <p>Create as many events as you need. Each event keeps its own sections and page.</p>
        </div>
        <Link className="btn btn-gold" to="/cms/admin/events/new">
          Create event
        </Link>
      </header>
      <div className="cms-stats">
        {cards.map(([label, value]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
      <section className="cms-panel">
        <h2>Recently updated</h2>
        {recent.length === 0 ? <p>No events yet.</p> : null}
        <ul className="cms-recent">
          {recent.map((event) => (
            <li key={event.id}>
              <Link to={`/cms/admin/events/${event.id}`}>{event.title}</Link>
              <span>{labelFor(PUBLICATION_STATUSES, event.publicationStatus)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function EventList() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function load() {
    api("/api/admin/events")
      .then((data) => setEvents(Array.isArray(data.events) ? data.events : []))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function duplicate(id) {
    const data = await api(`/api/admin/events/${id}/duplicate`, { method: "POST" });
    navigate(`/cms/admin/events/${data.event.id}`);
  }

  async function remove(event) {
    if (!window.confirm(`Delete “${event.title}”? This cannot be undone.`)) return;
    await api(`/api/admin/events/${event.id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <header className="cms-page-head">
        <div>
          <p className="kicker">Events</p>
          <h1>All events</h1>
          <p>One design, many events. Nothing here is locked to a single show.</p>
        </div>
        <Link className="btn btn-gold" to="/cms/admin/events/new">
          Create event
        </Link>
      </header>
      {error ? <p className="cms-error">{error}</p> : null}
      {!events ? <p>Loading events.</p> : null}
      {events && events.length === 0 ? (
        <div className="cms-panel">
          <h2>Start with a blank event</h2>
          <p>Add a title, then only the sections that event needs. Publish when it is ready.</p>
        </div>
      ) : null}
      {events && events.length > 0 ? (
        <div className="cms-table-wrap">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>When</th>
                <th>Status</th>
                <th>Visibility</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <Link to={`/cms/admin/events/${event.id}`}>{event.title}</Link>
                    <small>{event.category || "Uncategorised"}</small>
                  </td>
                  <td>{formatEventWhen(event) || "Date not set"}</td>
                  <td>{labelFor(EVENT_STATUSES, event.eventStatus)}</td>
                  <td>{labelFor(PUBLICATION_STATUSES, event.publicationStatus)}</td>
                  <td className="cms-row-actions">
                    <Link to={`/cms/admin/events/${event.id}`}>Edit</Link>
                    <button type="button" onClick={() => duplicate(event.id)}>
                      Duplicate
                    </button>
                    <button type="button" onClick={() => remove(event)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
