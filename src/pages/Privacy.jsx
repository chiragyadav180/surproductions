import Seo from "../components/Seo";
import PageHero from "../components/PageHero";

export default function Privacy() {
  return (
    <article>
      <Seo
        title="Privacy Policy"
        description="How SUR Productions handles information submitted through this website."
        path="/privacy"
      />
      <PageHero kicker="Legal" title="Privacy policy" />
      <section className="section">
        <div className="container prose">
          <p>
            This page describes how information submitted through the SUR Productions
            website is handled. It should be reviewed with counsel before the site goes
            live, and updated if a business address, inbox or analytics tool is added.
          </p>
          <h2>What you may submit</h2>
          <p>
            The enquiry form asks for your name, email, phone number, organisation, the
            service you are interested in, and project details. Phone number and
            organisation are optional.
          </p>
          <h2>How it is used</h2>
          <p>
            Those details are used only to reply to an enquiry about a possible project.
            The form does not send anything until an enquiry endpoint is configured. This
            site does not ask you to create an account.
          </p>
          <h2>What is not on this site yet</h2>
          <p>
            No analytics, advertising pixels or third-party chat tools are installed. If
            that changes, this policy should name them. No business email, phone or
            location is published because none has been supplied.
          </p>
          <h2>Retention</h2>
          <p>
            Once live delivery is connected, enquiries should be kept only as long as
            needed to respond and to keep a record of the conversation. Set that period
            with the endpoint or inbox you connect.
          </p>
        </div>
      </section>
    </article>
  );
}
