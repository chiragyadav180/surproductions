export default function Logo({ className = "" }) {
  return (
    <img
      className={className}
      src="/brand/sur-logo.png"
      alt="SUR Productions"
      decoding="async"
    />
  );
}
