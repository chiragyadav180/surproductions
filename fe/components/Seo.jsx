import { useEffect } from "react";
import { absoluteUrl, site } from "../config/site";

export default function Seo({
  title,
  description = site.description,
  path = "/",
  image = "/images/hero-stage.jpg",
  keywords = "",
  jsonLd,
}) {
  const fullTitle = title ? `${title} · ${site.name}` : site.name;
  const canonical = absoluteUrl(path);
  const socialImage = /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  useEffect(() => {
    let tag = document.head.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [description]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {socialImage ? <meta property="og:image" content={socialImage} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {socialImage ? <meta name="twitter:image" content={socialImage} /> : null}
      {blocks.map((block) => (
        <script
          key={block["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
