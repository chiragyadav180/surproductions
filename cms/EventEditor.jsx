import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./api.js";
import {
  CONFIRMATIONS,
  DATE_STATUSES,
  EVENT_STATUSES,
  PAGE_BLOCKS,
  PUBLICATION_STATUSES,
  REGISTRATION_STATUSES,
  SCHEDULE_STATUSES,
  SECTION_PLACEMENTS,
  VENUE_STATUSES,
  blankAudience,
  blankBenefit,
  blankEvent,
  blankGalleryItem,
  blankHighlight,
  blankSection,
  blankSession,
  blankSocial,
  blankSpeaker,
  blankZone,
  moveItem,
} from "./shared/event.js";

export default function EventEditor({ id }) {
  const isNew = !id;
  const navigate = useNavigate();
  const [event, setEvent] = useState(() => blankEvent());
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, setState] = useState(isNew ? "ready" : "loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    api(`/api/admin/events/${id}`)
      .then((data) => {
        if (!active) return;
        setEvent({ ...blankEvent(), ...data.event, media: { ...blankEvent().media, ...data.event.media } });
        setSlugTouched(true);
        setState("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [id, isNew]);

  function patch(partial) {
    setEvent((current) => ({ ...current, ...partial }));
    setMessage("");
  }

  function patchMedia(partial) {
    setEvent((current) => ({ ...current, media: { ...current.media, ...partial } }));
  }

  async function save(eventForm) {
    eventForm.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = event;
      const data = isNew
        ? await api("/api/admin/events", { method: "POST", body: JSON.stringify(payload) })
        : await api(`/api/admin/events/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      setEvent(data.event);
      setMessage(data.event.publicationStatus === "published" ? "Published." : "Saved as draft.");
      if (isNew) navigate(`/cms/admin/events/${data.event.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    const data = await api(`/api/admin/events/${id}/duplicate`, { method: "POST" });
    navigate(`/cms/admin/events/${data.event.id}`);
  }

  async function remove() {
    if (!window.confirm(`Delete “${event.title || "this event"}”? This cannot be undone.`)) return;
    await api(`/api/admin/events/${id}`, { method: "DELETE" });
    navigate("/cms/admin/events");
  }

  if (state === "loading") return <p>Loading event.</p>;
  if (state === "error") return <p className="cms-error">{error}</p>;

  return (
    <form className="cms-editor" onSubmit={save}>
      <header className="cms-page-head">
        <div>
          <p className="kicker">Event editor</p>
          <h1>{event.title || "New event"}</h1>
          <p>Use this for any event. Add only the sections that belong to it.</p>
        </div>
        <div className="cms-head-actions">
          {!isNew ? (
            <a className="btn btn-line" href={`/events/preview/${id}`} target="_blank" rel="noreferrer">
              Preview
            </a>
          ) : null}
          <button className="btn btn-gold" type="submit" disabled={busy}>
            {busy ? "Saving" : "Save"}
          </button>
        </div>
      </header>
      {error ? <p className="cms-error">{error}</p> : null}
      {message ? <p className="cms-ok">{message}</p> : null}

      <section className="cms-panel">
        <h2>Basic information</h2>
        <div className="cms-grid">
          <Field label="Title" value={event.title} onChange={(title) => patch({ title, slug: slugTouched ? event.slug : undefined })} required />
          <Field label="Subtitle" value={event.subtitle} onChange={(subtitle) => patch({ subtitle })} />
          <Field
            label="Page address"
            value={event.slug}
            onChange={(slug) => {
              setSlugTouched(true);
              patch({ slug });
            }}
            hint="Letters, numbers and hyphens. Leave it to follow the title on a new event."
          />
          <Field label="Category" value={event.category} onChange={(category) => patch({ category })} hint="Festival, award show, screening, corporate — your words." />
          <Select label="Event status" value={event.eventStatus} options={EVENT_STATUSES} onChange={(eventStatus) => patch({ eventStatus })} />
          <Select label="Publication" value={event.publicationStatus} options={PUBLICATION_STATUSES} onChange={(publicationStatus) => patch({ publicationStatus })} />
        </div>
        <Area label="Short description" value={event.shortDescription} onChange={(shortDescription) => patch({ shortDescription })} />
        <Area label="Full description" value={event.description} onChange={(description) => patch({ description })} rows={6} />
        <Field label="Tagline" value={event.tagline} onChange={(tagline) => patch({ tagline })} />
        <Area
          label="Organising credit"
          value={event.presentedBy}
          onChange={(presentedBy) => patch({ presentedBy })}
          rows={3}
          hint="Use the approved sentence. Do not add a government role that has not been confirmed in writing."
        />
        <Area
          label="Closing note"
          value={event.disclaimer}
          onChange={(disclaimer) => patch({ disclaimer })}
          rows={3}
          hint="Shown at the end of the page. Keep unconfirmed details marked as proposed."
        />
        <div className="cms-grid">
          <Field label="SEO title" value={event.seoTitle} onChange={(seoTitle) => patch({ seoTitle })} hint="Leave blank to use the automatic title." />
          <Field label="SEO keywords" value={event.seoKeywords} onChange={(seoKeywords) => patch({ seoKeywords })} />
        </div>
        <Area label="SEO description" value={event.seoDescription} onChange={(seoDescription) => patch({ seoDescription })} rows={3} hint="Leave blank to build one from the short description." />
        <div className="cms-checks">
          <label>
            <input type="checkbox" checked={event.featured} onChange={(e) => patch({ featured: e.target.checked })} />
            Featured on the events page
          </label>
          <label>
            <input type="checkbox" checked={event.homepage} onChange={(e) => patch({ homepage: e.target.checked })} />
            Show on the homepage
          </label>
        </div>
      </section>

      <section className="cms-panel">
        <h2>Date and location</h2>
        <p className="cms-note">Keep the date and venue labelled as proposed until they are formally locked. Do not publish a made-up day.</p>
        <div className="cms-grid">
          <Select label="Date status" value={event.dateStatus} options={DATE_STATUSES} onChange={(dateStatus) => patch({ dateStatus })} />
          <Field label="Tentative date text" value={event.tentativeDateText} onChange={(tentativeDateText) => patch({ tentativeDateText })} hint="Example: 20 December 2026, proposed" />
          <Field label="Start date" type="date" value={event.startDate} onChange={(startDate) => patch({ startDate })} />
          <Field label="End date" type="date" value={event.endDate} onChange={(endDate) => patch({ endDate })} />
          <Field label="Start time" type="time" value={event.startTime} onChange={(startTime) => patch({ startTime })} />
          <Field label="End time" type="time" value={event.endTime} onChange={(endTime) => patch({ endTime })} />
          <Field label="Timezone" value={event.timezone} onChange={(timezone) => patch({ timezone })} />
          <Field label="Venue" value={event.venue} onChange={(venue) => patch({ venue })} />
          <Select label="Venue status" value={event.venueStatus || "unset"} options={VENUE_STATUSES} onChange={(venueStatus) => patch({ venueStatus })} />
          <Field label="Format" value={event.formatLabel} onChange={(formatLabel) => patch({ formatLabel })} hint="Example: One-day conclave and experience festival" />
          <Field label="Expected gathering" value={event.attendanceText} onChange={(attendanceText) => patch({ attendanceText })} hint="Keep this expected, not a promise." />
          <Field label="City" value={event.city} onChange={(city) => patch({ city })} />
          <Field label="State" value={event.state} onChange={(state) => patch({ state })} />
          <Field label="Country" value={event.country} onChange={(country) => patch({ country })} />
          <Field label="Map link" value={event.mapsUrl} onChange={(mapsUrl) => patch({ mapsUrl })} />
        </div>
        <Area label="Address" value={event.address} onChange={(address) => patch({ address })} rows={3} />
      </section>

      <section className="cms-panel">
        <h2>Images</h2>
        <div className="cms-grid">
          <ImageField label="Hero image" value={event.heroImage} onChange={(heroImage) => patch({ heroImage })} />
          <Field label="Hero alt text" value={event.heroAlt} onChange={(heroAlt) => patch({ heroAlt })} />
          <ImageField label="Cover image" value={event.coverImage} onChange={(coverImage) => patch({ coverImage })} />
          <ImageField label="Thumbnail" value={event.thumbnail} onChange={(thumbnail) => patch({ thumbnail })} />
          <Field label="Video link" value={event.videoUrl} onChange={(videoUrl) => patch({ videoUrl })} />
        </div>
        <Repeatable
          title="Gallery"
          items={event.gallery}
          onChange={(gallery) => patch({ gallery })}
          blank={blankGalleryItem}
          render={(item, update) => (
            <>
              <ImageField label="Image" value={item.url} onChange={(url) => update({ url })} />
              <Field label="Alt text" value={item.alt} onChange={(alt) => update({ alt })} />
              <Field label="Caption" value={item.caption} onChange={(caption) => update({ caption })} />
              <Field label="Credit" value={item.credit} onChange={(credit) => update({ credit })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Sections</h2>
        <p className="cms-note">These are the main story blocks. Add, hide or reorder them per event. An empty section stays off the public page.</p>
        <Repeatable
          title="Content sections"
          items={event.sections}
          onChange={(sections) => patch({ sections })}
          blank={blankSection}
          render={(item, update) => (
            <>
              <Field label="Heading" value={item.heading} onChange={(heading) => update({ heading })} />
              <Field label="Subtitle" value={item.subtitle} onChange={(subtitle) => update({ subtitle })} />
              <Field label="Label" value={item.icon} onChange={(icon) => update({ icon })} hint="Short kicker, optional." />
              <Select label="Placement" value={item.placement || "opening"} options={SECTION_PLACEMENTS} onChange={(placement) => update({ placement })} />
              <Area label="Description" value={item.body} onChange={(body) => update({ body })} rows={5} />
              <ImageField label="Image" value={item.image} onChange={(image) => update({ image })} />
              <Field label="Image alt text" value={item.imageAlt} onChange={(imageAlt) => update({ imageAlt })} />
              <label className="cms-check">
                <input type="checkbox" checked={item.visible !== false} onChange={(e) => update({ visible: e.target.checked })} />
                Show this section
              </label>
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Highlights</h2>
        <Repeatable
          title="Highlight"
          items={event.highlights}
          onChange={(highlights) => patch({ highlights })}
          blank={blankHighlight}
          render={(item, update) => (
            <>
              <Field label="Title" value={item.title} onChange={(title) => update({ title })} />
              <Area label="Description" value={item.description} onChange={(description) => update({ description })} />
              <ImageField label="Image" value={item.image} onChange={(image) => update({ image })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Speakers and guests</h2>
        <p className="cms-note">Proposed guests stay marked as proposed. They are not shown as confirmed. A business session can be one card while the names are still under consideration.</p>
        <div className="cms-grid">
          <Field label="Section heading" value={event.speakersTitle} onChange={(speakersTitle) => patch({ speakersTitle })} hint="Leave blank for the standard heading." />
          <Field label="Confirmation note" value={event.speakersNote} onChange={(speakersNote) => patch({ speakersNote })} hint="Shown when a speaker is still proposed." />
        </div>
        <Repeatable
          title="Person"
          items={event.speakers}
          onChange={(speakers) => patch({ speakers })}
          blank={blankSpeaker}
          render={(item, update) => (
            <>
              <Field label="Name" value={item.name} onChange={(name) => update({ name })} />
              <Field label="Designation" value={item.designation} onChange={(designation) => update({ designation })} />
              <Field label="Session title" value={item.sessionTitle} onChange={(sessionTitle) => update({ sessionTitle })} />
              <Field label="Category" value={item.category} onChange={(category) => update({ category })} />
              <Select label="Confirmation" value={item.confirmation} options={CONFIRMATIONS} onChange={(confirmation) => update({ confirmation })} />
              <ImageField label="Photograph" value={item.photo} onChange={(photo) => update({ photo })} />
              <Area label="Biography" value={item.bio} onChange={(bio) => update({ bio })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Agenda</h2>
        <div className="cms-grid">
          <Select label="Schedule status" value={event.scheduleStatus} options={SCHEDULE_STATUSES} onChange={(scheduleStatus) => patch({ scheduleStatus })} />
          <Field label="Schedule note" value={event.scheduleNote} onChange={(scheduleNote) => patch({ scheduleNote })} />
        </div>
        <Repeatable
          title="Session"
          items={event.sessions}
          onChange={(sessions) => patch({ sessions })}
          blank={blankSession}
          render={(item, update) => (
            <>
              <Field label="Title" value={item.title} onChange={(title) => update({ title })} />
              <Field label="Category" value={item.category} onChange={(category) => update({ category })} />
              <Field label="Start" value={item.startTime} onChange={(startTime) => update({ startTime })} hint="Free text, such as 12:00 PM" />
              <Field label="End" value={item.endTime} onChange={(endTime) => update({ endTime })} />
              <Field label="Stage or room" value={item.stage} onChange={(stage) => update({ stage })} />
              <Field label="Related speakers" value={item.speakers} onChange={(speakers) => update({ speakers })} />
              <Select label="Confirmation" value={item.confirmation} options={CONFIRMATIONS} onChange={(confirmation) => update({ confirmation })} />
              <Area label="Description" value={item.description} onChange={(description) => update({ description })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Experience zones</h2>
        <Field label="Section heading" value={event.zonesTitle} onChange={(zonesTitle) => patch({ zonesTitle })} hint="Leave blank to title this block Experiences." />
        <Area label="Introduction" value={event.zonesIntro} onChange={(zonesIntro) => patch({ zonesIntro })} rows={3} />
        <Repeatable
          title="Zone"
          items={event.zones}
          onChange={(zones) => patch({ zones })}
          blank={blankZone}
          render={(item, update) => (
            <>
              <Field label="Title" value={item.title} onChange={(title) => update({ title })} />
              <Field label="Category" value={item.category} onChange={(category) => update({ category })} />
              <Area label="Description" value={item.description} onChange={(description) => update({ description })} />
              <ImageField label="Image" value={item.image} onChange={(image) => update({ image })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Audience</h2>
        <Repeatable
          title="Audience"
          items={event.audiences}
          onChange={(audiences) => patch({ audiences })}
          blank={blankAudience}
          render={(item, update) => <Field label="Label" value={item.label} onChange={(label) => update({ label })} />}
        />
      </section>

      <section className="cms-panel">
        <h2>Benefits and outcomes</h2>
        <Repeatable
          title="Benefit"
          items={event.benefits}
          onChange={(benefits) => patch({ benefits })}
          blank={blankBenefit}
          render={(item, update) => (
            <>
              <Field label="Title" value={item.title} onChange={(title) => update({ title })} />
              <Area label="Description" value={item.description} onChange={(description) => update({ description })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Media and communications</h2>
        <Area label="Before the event" value={event.media.before} onChange={(before) => patchMedia({ before })} />
        <Area label="During the event" value={event.media.during} onChange={(during) => patchMedia({ during })} />
        <Area label="After the event" value={event.media.after} onChange={(after) => patchMedia({ after })} />
        <Area label="Media coverage" value={event.media.coverage} onChange={(coverage) => patchMedia({ coverage })} />
        <Area label="Press" value={event.media.press} onChange={(press) => patchMedia({ press })} />
        <Repeatable
          title="Social link"
          items={event.media.social}
          onChange={(social) => patchMedia({ social })}
          blank={blankSocial}
          render={(item, update) => (
            <>
              <Field label="Label" value={item.label} onChange={(label) => update({ label })} />
              <Field label="URL" value={item.url} onChange={(url) => update({ url })} />
            </>
          )}
        />
      </section>

      <section className="cms-panel">
        <h2>Registration and enquiry</h2>
        <p className="cms-note">Leave the links empty until audience registration, sponsorship, exhibition and media channels are actually active. Until then the public page offers Stay updated and does not publish a contact route.</p>
        <div className="cms-grid">
          <Select label="Registration status" value={event.registrationStatus} options={REGISTRATION_STATUSES} onChange={(registrationStatus) => patch({ registrationStatus })} />
          <Field label="Button text" value={event.ctaText} onChange={(ctaText) => patch({ ctaText })} />
          <Field label="Registration URL" value={event.registrationUrl} onChange={(registrationUrl) => patch({ registrationUrl })} />
          <Field label="Ticket URL" value={event.ticketUrl} onChange={(ticketUrl) => patch({ ticketUrl })} />
          <Field label="Enquiry URL" value={event.enquiryUrl} onChange={(enquiryUrl) => patch({ enquiryUrl })} />
        </div>
        <label className="cms-check">
          <input type="checkbox" checked={event.ctaVisible} onChange={(e) => patch({ ctaVisible: e.target.checked })} />
          Show the call to action
        </label>
      </section>

      <section className="cms-panel">
        <h2>Page order</h2>
        <p className="cms-note">Hide a block or move it. Blocks with no content never appear on the public page.</p>
        <ol className="cms-order">
          {event.pageBlocks.map((block, index) => (
            <li key={block.key}>
              <label>
                <input
                  type="checkbox"
                  checked={block.visible !== false}
                  onChange={(e) => {
                    const pageBlocks = event.pageBlocks.map((item) =>
                      item.key === block.key ? { ...item, visible: e.target.checked } : item,
                    );
                    patch({ pageBlocks });
                  }}
                />
                {PAGE_BLOCKS.find((item) => item.key === block.key)?.label || block.key}
              </label>
              <span>
                <button type="button" onClick={() => patch({ pageBlocks: moveItem(event.pageBlocks, index, -1) })} disabled={index === 0}>
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => patch({ pageBlocks: moveItem(event.pageBlocks, index, 1) })}
                  disabled={index === event.pageBlocks.length - 1}
                >
                  Down
                </button>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="cms-savebar">
        <div className="cms-head-actions">
          {!isNew ? (
            <>
              <button type="button" onClick={duplicate}>
                Duplicate
              </button>
              <button type="button" className="is-danger" onClick={remove}>
                Delete
              </button>
            </>
          ) : (
            <Link to="/cms/admin/events">Cancel</Link>
          )}
        </div>
        <button className="btn btn-gold" type="submit" disabled={busy}>
          {busy ? "Saving" : "Save event"}
        </button>
      </div>
    </form>
  );
}

function Repeatable({ title, items, onChange, blank, render }) {
  return (
    <div className="cms-repeat">
      {(items || []).map((item, index) => (
        <article key={item.id} className="cms-repeat-item">
          <header>
            <strong>
              {title} {index + 1}
            </strong>
            <span>
              <button type="button" onClick={() => onChange(moveItem(items, index, -1))} disabled={index === 0}>
                Up
              </button>
              <button type="button" onClick={() => onChange(moveItem(items, index, 1))} disabled={index === items.length - 1}>
                Down
              </button>
              <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}>
                Remove
              </button>
            </span>
          </header>
          <div className="cms-grid">
            {render(item, (partial) => onChange(items.map((entry) => (entry.id === item.id ? { ...entry, ...partial } : entry))))}
          </div>
        </article>
      ))}
      <button type="button" className="cms-add" onClick={() => onChange([...(items || []), blank()])}>
        Add {title.toLowerCase()}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", hint, required }) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      <input type={type} value={value || ""} required={required} onChange={(event) => onChange(event.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Area({ label, value, onChange, rows = 4, hint }) {
  return (
    <label className="cms-field cms-field-wide">
      <span>{label}</span>
      <textarea rows={rows} value={value || ""} onChange={(event) => onChange(event.target.value)} />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="cms-field">
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageField({ label, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await api("/api/admin/media", { method: "POST", body });
      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="cms-field">
      <span>{label}</span>
      {value ? <img className="cms-thumb" src={value} alt="" /> : null}
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="https:// or /uploads/…" />
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} />
      {busy ? <small>Uploading…</small> : null}
      {error ? <small className="cms-error">{error}</small> : null}
    </label>
  );
}
