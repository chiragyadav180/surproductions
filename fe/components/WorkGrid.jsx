import { Link } from "react-router-dom";

export default function WorkGrid({ items }) {
  return (
    <div className="work-grid">
      {items.map((project) => (
        <Link key={project.slug} to={`/work/${project.slug}`} className="work-card">
          <div className="work-card-media">
            <img src={project.image} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="work-card-copy">
            <p>{project.category}</p>
            <h3>{project.title}</h3>
            <span className="text-link">View project</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
