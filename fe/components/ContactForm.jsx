import { useId, useState } from "react";
import { site } from "../config/site";
import { services } from "../data/content";

const initial = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  service: "",
  message: "",
  website: "",
};

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.phone.trim()) {
    const digits = values.phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      errors.phone = "Enter a valid phone number, or leave this blank.";
    }
  }
  if (!values.service) errors.service = "Choose a service.";
  if (values.message.trim().length < 20) {
    errors.message = "Share a few more details about the project (at least 20 characters).";
  }
  return errors;
}

export default function ContactForm() {
  const baseId = useId();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [note, setNote] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setNote("");
    if (Object.keys(nextErrors).length) {
      setStatus("invalid");
      setNote("Please correct the highlighted fields.");
      return;
    }

    if (values.website.trim()) {
      setStatus("success");
      setNote("Thank you. Your enquiry has been received.");
      setValues(initial);
      return;
    }

    if (!site.contactEndpoint) {
      setStatus("not_configured");
      setNote(
        "Your details are valid, but live delivery is not connected yet. Add VITE_CONTACT_ENDPOINT — an HTTPS address that accepts a JSON POST with name, email, phone, organisation, service and message — then restart the site.",
      );
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(site.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          organisation: values.organisation.trim(),
          service: values.service,
          message: values.message.trim(),
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
      setNote("Thank you. Your enquiry has been sent.");
      setValues(initial);
    } catch {
      setStatus("error");
      setNote("The enquiry could not be sent. Please try again in a moment.");
    }
  }

  function fieldId(name) {
    return `${baseId}-${name}`;
  }

  function errorId(name) {
    return `${baseId}-${name}-error`;
  }

  return (
    <form className="enquiry-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <Field
          id={fieldId("name")}
          label="Name"
          name="name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          errorId={errorId("name")}
          onChange={update}
          required
          maxLength={80}
        />
        <Field
          id={fieldId("email")}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          errorId={errorId("email")}
          onChange={update}
          required
          maxLength={120}
        />
        <Field
          id={fieldId("phone")}
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          error={errors.phone}
          errorId={errorId("phone")}
          onChange={update}
          maxLength={24}
        />
        <Field
          id={fieldId("organisation")}
          label="Company or organisation"
          name="organisation"
          autoComplete="organization"
          value={values.organisation}
          error={errors.organisation}
          errorId={errorId("organisation")}
          onChange={update}
          maxLength={120}
        />
        <div className="field is-wide">
          <label htmlFor={fieldId("service")}>Service interested in</label>
          <select
            id={fieldId("service")}
            name="service"
            value={values.service}
            onChange={update}
            aria-invalid={errors.service ? "true" : "false"}
            aria-describedby={errors.service ? errorId("service") : undefined}
            required
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="General enquiry">General enquiry</option>
          </select>
          {errors.service ? (
            <p id={errorId("service")} className="field-error" role="alert">
              {errors.service}
            </p>
          ) : null}
        </div>
        <div className="field is-wide">
          <label htmlFor={fieldId("message")}>Project details</label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={6}
            maxLength={2000}
            value={values.message}
            onChange={update}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby={errors.message ? errorId("message") : undefined}
            required
          />
          {errors.message ? (
            <p id={errorId("message")} className="field-error" role="alert">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={fieldId("website")}>Company website</label>
        <input
          id={fieldId("website")}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update}
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-gold" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit enquiry"}
        </button>
        <p className="form-help">
          Live delivery connects when an enquiry endpoint is added. Nothing is sent
          until then.
        </p>
      </div>

      {note ? (
        <p
          className={`form-status ${status === "error" || status === "invalid" ? "is-error" : ""}`}
          role="status"
          aria-live="polite"
        >
          {note}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  value,
  error,
  errorId,
  onChange,
  autoComplete,
  required,
  maxLength,
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required ? <span className="sr-only"> required</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        required={required}
      />
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
