import { Link } from "react-router-dom";

export default function ServiceRows({ items }) {
  return (
    <div className="service-list">
      {items.map((service) => (
        <Link key={service.slug} to={`/services/${service.slug}`} className="service-row">
          <div className="service-row-media">
            <img src={service.image} alt="" loading="lazy" decoding="async" />
          </div>
          <div className="service-row-copy">
            <p className="index">{service.index}</p>
            <h3>{service.title}</h3>
            <p>{service.summary}</p>
            <span className="text-link">View service</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
