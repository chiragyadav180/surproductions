import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <article className="not-found">
      <Seo title="Page not found" description="This page is not part of the SUR Productions website." path="/404" />
      <div className="container">
        <p className="kicker">404</p>
        <h1>Page not found</h1>
        <p className="lede">That address is not part of this site.</p>
        <div className="hero-actions">
          <Link className="btn btn-gold" to="/">
            Back home
          </Link>
          <Link className="btn btn-line" to="/work">
            View work
          </Link>
        </div>
      </div>
    </article>
  );
}
