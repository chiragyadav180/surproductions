import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import ServiceRows from "../components/ServiceRows";
import { services } from "../data/content";

export default function Services() {
  return (
    <article>
      <Seo
        title="What We Do"
        description="SUR Productions works across films, documentaries, events, digital and communications."
        path="/services"
      />
      <PageHero
        kicker="What we do"
        title="Five disciplines. One standard."
        lede="Films, documentaries, events, digital and communications, produced with a cinematic point of view."
      />
      <section className="section">
        <div className="container">
          <ServiceRows items={services} />
        </div>
      </section>
    </article>
  );
}
