export default function AccessDenied({ title, description }) {
  return (
    <section className="aa-access">
      <span className="aa-eyebrow">Access control</span>
      <h1 className="aa-access__title">{title}</h1>
      <p className="aa-access__text">{description}</p>

      <div className="aa-access__pills">
        <span className="aa-access__pill">Authentication required</span>
        <span className="aa-access__pill">Role-based access</span>
        <span className="aa-access__pill">GraphQL gateway</span>
      </div>
    </section>
  )
}
