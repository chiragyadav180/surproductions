import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Seo from "../components/Seo";
import { principles } from "../data/content";

export default function About() {
  return (
    <article className="about-page">
      <Seo
        title="About Us"
        description="SUR Productions is a film, media, events, digital and communications company. The work is built around stories, craft and a considered finish."
        path="/about"
      />
      <PageHero
        className="about-hero"
        kicker="About us"
        title="We believe in the power of stories."
        lede="A production house for films, documentaries, events, digital work and communications."
        image="/images/about-set.jpg"
        imageAlt=""
      />

      <section className="section about-who">
        <div className="container about-who-grid">
          <Reveal className="about-who-title">
            <p className="kicker">The studio</p>
            <h2>Who we are</h2>
            <p className="about-who-lead">
              Cinema craft, live experience and brand communication under one roof.
            </p>
          </Reveal>
          <Reveal className="about-who-copy" delay={80}>
            <p>
              SUR Productions is a film, media, events, digital and communications
              company. The identity is cinematic: pictures with weight, gold used with
              restraint, and stories built to be remembered.
            </p>
            <p>
              What the studio stands for is already clear. Tell the story properly.
              Produce it with discipline. Leave the audience with something that holds —
              on a screen, on a stage, or inside a campaign.
            </p>
            <p>
              The vision is simple. Create work with the craft of cinema and the clarity
              of communication, whether the piece is a film, a documentary, a live event,
              a digital series or a brand story.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section about-philosophy">
        <div className="container about-philosophy-grid">
          <Reveal className="about-philosophy-media">
            <img
              src="/images/portrait-light.jpg"
              alt="A spotlight falling on a cinema camera in a dark studio"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
          <Reveal className="about-philosophy-copy" delay={80}>
            <p className="kicker">Philosophy</p>
            <h2>How a project is approached</h2>
            <p>
              The same questions lead every production. What should the audience feel?
              What must they understand? What will still hold up when the lights come up?
            </p>
            <p>
              From the first conversation to the final picture, the work stays close to
              that purpose. Collaboration is welcome. So is a clear point of view.
            </p>
            <Link className="text-link" to="/contact">
              Start a conversation
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section about-practice">
        <div className="container">
          <div className="section-head">
            <p className="kicker">Practice</p>
            <h2>Four commitments</h2>
          </div>
          <div className="about-principle-grid">
            {principles.map((item, index) => (
              <article key={item.title} className="about-principle">
                <span className="about-principle-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
