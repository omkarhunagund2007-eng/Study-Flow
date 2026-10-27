/** The title area at the top of every page. `actions` is an optional button area on the right. */
export default function PageHeader({ title, description, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
