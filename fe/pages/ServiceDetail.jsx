import { Link, useParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import { site } from "../config/site";
import { projects, services } from "../data/content";
import NotFound from "./NotFound";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = services.find((item) => item.slug === slug);

  if (!service) return <NotFound />;

  const related = projects.filter((project) => project.service === service.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: {
      "@type": "Organization",
      name: site.name,
      ...(site.url ? { url: site.url } : {}),
    },
    ...(site.url ? { url: `${site.url}/services/${service.slug}` } : {}),
  };

  return (
    <article>
      <Seo title={service.title} description={service.summary} path={`/services/${service.slug}`} jsonLd={jsonLd} />
      <PageHero
        kicker={`${service.index} — What we do`}
        title={service.title}
        lede={service.summary}
        image={service.image}
        imageAlt=""
      />
      <section className="section">
        <div className="container prose-grid">
          <div>
            <p className="kicker">The work</p>
            <h2>What this covers</h2>
          </div>
          <div className="prose">
            {service.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Link className="btn btn-gold" to="/contact">
              Discuss a project
            </Link>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="kicker">Presentation</p>
              <h2>How {service.title.toLowerCase()} work will be shown</h2>
            </div>
            <ul className="related-list">
              {related.map((project) => (
                <li key={project.slug}>
                  <Link to={`/work/${project.slug}`}>
                    <span>Sample</span>
                    <strong>{project.title}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
