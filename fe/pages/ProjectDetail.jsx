import { Link, useParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import SampleNote from "../components/SampleNote";
import Seo from "../components/Seo";
import { projects } from "../data/content";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);

  if (!project) return <NotFound />;

  const related = projects.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <article>
      <Seo
        title={project.title}
        description={`${project.summary} Sample layout for SUR Productions.`}
        path={`/work/${project.slug}`}
      />
      <PageHero
        kicker={`${project.category} · Sample`}
        title={project.title}
        lede={project.summary}
        image={project.image}
        imageAlt=""
      />
      <section className="section">
        <div className="container prose-grid">
          <div>
            <p className="kicker">Project</p>
            <h2>The story frame</h2>
            <SampleNote />
          </div>
          <div className="prose">
            <p>{project.description}</p>
            <dl className="meta-list">
              <div>
                <dt>Category</dt>
                <dd>{project.category}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Layout sample</dd>
              </div>
              <div>
                <dt>Credits</dt>
                <dd>Credits and collaborators will be listed when a verified project is added.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="gallery-title">
        <div className="container">
          <h2 id="gallery-title">Gallery</h2>
          <div className="gallery">
            {project.gallery.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`Sample still ${index + 1} for the ${project.title} layout`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head-row">
            <h2>Related samples</h2>
            <Link className="text-link" to="/work">
              All work
            </Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <Link key={item.slug} to={`/work/${item.slug}`} className="work-card">
                <div className="work-card-media">
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="work-card-copy">
                  <p>{item.category}</p>
                  <h3>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
