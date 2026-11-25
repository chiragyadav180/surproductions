import ContactForm from "../components/ContactForm";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";

export default function Contact() {
  return (
    <article>
      <Seo
        title="Contact"
        description="Start a project with SUR Productions. Share your name, email and the story you want to produce."
        path="/contact"
      />
      <PageHero
        kicker="Contact"
        title="Let's create something extraordinary."
        lede="Have a story to tell or a project to bring to life? Let's talk."
      />
      <section className="section">
        <div className="container contact-layout">
          <div className="contact-aside">
            <h2>Business details</h2>
            <p>
              Email, phone, WhatsApp and studio location will be added here when they are
              provided. They are left blank so this page never shows a guessed address or
              number.
            </p>
            <h2>What happens next</h2>
            <p>
              Use the form to prepare an enquiry. When an enquiry endpoint is connected,
              submissions are delivered as JSON. Until then, the form checks your details
              and tells you clearly that nothing has been sent.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </article>
  );
}
