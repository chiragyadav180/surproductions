import PageHero from "../components/PageHero";
import Seo from "../components/Seo";

export default function Terms() {
  return (
    <article>
      <Seo
        title="Terms and Conditions"
        description="Terms for using the SUR Productions website."
        path="/terms"
      />
      <PageHero kicker="Legal" title="Terms and conditions" />
      <section className="section">
        <div className="container prose">
          <p>
            These terms cover use of the SUR Productions website. Replace them with
            counsel-approved terms before launch if your jurisdiction or contracts require
            a fuller agreement.
          </p>
          <h2>The website</h2>
          <p>
            The pages describe the studio’s services and how projects will be presented.
            Portfolio entries marked as samples are layout demonstrations. They are not
            client case studies and should not be treated as a record of completed work.
          </p>
          <h2>Enquiries</h2>
          <p>
            Sending the form does not create a contract. A project begins only when both
            sides agree in writing. Until an enquiry endpoint is connected, the form
            validates your details and does not deliver them.
          </p>
          <h2>Content</h2>
          <p>
            The SUR Productions name, logo and original page design belong to the studio.
            Please do not copy the logo or present sample projects as finished client work.
          </p>
        </div>
      </section>
    </article>
  );
}
