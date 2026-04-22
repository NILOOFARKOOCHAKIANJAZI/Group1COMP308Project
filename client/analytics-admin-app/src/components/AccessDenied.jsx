export default function AccessDenied({ title, description }) {
  return (
    <section className="access-card">
      <p className="eyebrow">Access control</p>
      <h1>{title}</h1>
      <p className="hero-text">{description}</p>

      <div className="hero-pill-row">
        <span className="hero-pill">Authentication Required</span>
        <span className="hero-pill">Role-Based Access</span>
        <span className="hero-pill">GraphQL Gateway</span>
      </div>
    </section>
  )
}