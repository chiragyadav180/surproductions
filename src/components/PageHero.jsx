export default function PageHero({ kicker, title, lede, image, imageAlt = "", className = "" }) {
  return (
    <header className={`page-hero ${image ? "has-image" : ""} ${className}`.trim()}>
      {image ? <img src={image} alt={imageAlt} /> : null}
      {image ? <div className="hero-shade" aria-hidden="true" /> : null}
      <div className="container page-hero-content">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
    </header>
  );
}
