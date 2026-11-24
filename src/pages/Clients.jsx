import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import { clientSlotCount, clients } from "../data/content";

export default function Clients() {
  const slots = clients.length
    ? clients
    : Array.from({ length: clientSlotCount }, (_, index) => ({
        id: `slot-${index + 1}`,
        label: "Logo",
        note: `Placeholder ${String(index + 1).padStart(2, "0")}`,
      }));

  return (
    <article>
      <Seo
        title="Our Clients"
        description="A reserved client wall for SUR Productions. Logos will be added when they are supplied."
        path="/clients"
      />
      <PageHero
        kicker="Our clients"
        title="The wall is ready."
        lede="Client marks will sit here in a consistent size. None are shown until the real logos are supplied."
      />
      <section className="section">
        <div className="container">
          <p className="sample-note">
            {clients.length
              ? "Client marks supplied for this page."
              : "These frames are empty on purpose. Add a logo file and a name to the client list when both are confirmed. No organisations have been invented."}
          </p>
          <ul className="logo-grid">
            {slots.map((slot) => (
              <li key={slot.id || slot.name} className="logo-slot">
                {slot.src ? (
                  <img src={slot.src} alt={slot.name} />
                ) : (
                  <>
                    <span>{slot.label}</span>
                    <small>{slot.note}</small>
                  </>
                )}
              </li>
            ))}
          </ul>
          <p className="section-cta">
            <Link className="btn btn-line" to="/contact">
              Become a collaborator
            </Link>
          </p>
        </div>
      </section>
    </article>
  );
}
