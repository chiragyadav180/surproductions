import { Link } from "react-router-dom";
import ContactForm from "../components/ContactForm";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import CollaboratorMarquee from "../components/CollaboratorMarquee";
import WorkShowcase from "../components/WorkShowcase";
import { site } from "../config/site";
import { principles } from "../data/content";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  description: site.description,
  knowsAbout: ["Film production", "Documentary", "Event production", "Digital media", "Communications"],
    ...(site.url ? { url: site.url, logo: `${site.url}/brand/sur-logo.png` } : {}),
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  description: site.description,
  ...(site.url ? { url: site.url } : {}),
};

export default function Home() {
  return (
    <article>
      <Seo
        description={site.description}
        path="/"
        jsonLd={[organization, website]}
      />

      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-media"
          src="/images/hero-set.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-filmstrip" aria-hidden="true">
          <svg viewBox="0 0 180 420" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="strip-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f0c56a" />
                <stop offset="1" stopColor="#9a6a22" />
              </linearGradient>
            </defs>
            <rect x="18" y="8" width="144" height="404" rx="10" fill="none" stroke="url(#strip-gold)" strokeWidth="6" />
            <g fill="#080808" stroke="url(#strip-gold)" strokeWidth="2">
              <rect x="4" y="28" width="18" height="14" rx="3" />
              <rect x="4" y="62" width="18" height="14" rx="3" />
              <rect x="4" y="96" width="18" height="14" rx="3" />
              <rect x="4" y="130" width="18" height="14" rx="3" />
              <rect x="4" y="164" width="18" height="14" rx="3" />
              <rect x="4" y="198" width="18" height="14" rx="3" />
              <rect x="4" y="232" width="18" height="14" rx="3" />
              <rect x="4" y="266" width="18" height="14" rx="3" />
              <rect x="4" y="300" width="18" height="14" rx="3" />
              <rect x="4" y="334" width="18" height="14" rx="3" />
              <rect x="4" y="368" width="18" height="14" rx="3" />
              <rect x="158" y="28" width="18" height="14" rx="3" />
              <rect x="158" y="62" width="18" height="14" rx="3" />
              <rect x="158" y="96" width="18" height="14" rx="3" />
              <rect x="158" y="130" width="18" height="14" rx="3" />
              <rect x="158" y="164" width="18" height="14" rx="3" />
              <rect x="158" y="198" width="18" height="14" rx="3" />
              <rect x="158" y="232" width="18" height="14" rx="3" />
              <rect x="158" y="266" width="18" height="14" rx="3" />
              <rect x="158" y="300" width="18" height="14" rx="3" />
              <rect x="158" y="334" width="18" height="14" rx="3" />
              <rect x="158" y="368" width="18" height="14" rx="3" />
            </g>
          </svg>
        </div>
        <div className="container hero-content">
          <p className="kicker">Film. Media and communication</p>
          <h1 id="hero-title">
            <span>
              <span>We</span> <span>create.</span>
            </span>
            <span>
              <span>We</span> <span>produce.</span>
            </span>
            <span>
              <span>We</span> <span>inspire.</span>
            </span>
          </h1>
          <p className="lede">
            A cinematic studio for films, documentaries, live events, digital campaigns
            and brand communications — stories made to move people.
          </p>
          <div className="hero-actions">
            <a className="btn btn-gold has-arrow" href="#work">
              Explore our work
            </a>
            <Link className="btn btn-line has-arrow" to="/contact">
              Let&apos;s collaborate
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="introduction">
        <div className="container about-grid">
          <Reveal className="about-media">
            <img
              src="/images/about-set.jpg"
              alt="Cinema camera on a dimly lit film set"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
          <Reveal delay={80}>
            <p className="kicker">About us</p>
            <h2>Stories told through film, stage and screen.</h2>
            <p>
              SUR Productions is a film, media and communications studio. We make
              commercial and brand films, documentaries, live events, digital campaigns
              and brand communication — one standard of picture and storytelling across
              every brief.
            </p>
            <p>
              The work is for organisations that need a story told with craft: on a
              cinema screen, on a stage, or in a campaign. Picture, pace and message
              are shaped together, so the finished piece feels considered.
            </p>
            <Link className="text-link" to="/about">
              Read our approach
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-tight" aria-label="Production principles">
        <div className="container principle-grid">
          {principles.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <article className="principle">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CollaboratorMarquee />

      <WorkShowcase showCta />

      <section className="section section-contact" id="enquire">
        <div className="container contact-layout">
          <div>
            <p className="kicker">Contact</p>
            <h2>Let&apos;s create something extraordinary.</h2>
            <p className="lede">Have a story to tell or a project to bring to life? Let&apos;s talk.</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </article>
  );
}
