import Seo from "../components/Seo";
import WorkShowcase from "../components/WorkShowcase";

export default function Work() {
  return (
    <article>
      <Seo
        title="Our Work"
        description="Films, documentaries, award shows, events, digital campaigns and brand communications from SUR Productions."
        path="/work"
      />
      <WorkShowcase variant="page" />
    </article>
  );
}
