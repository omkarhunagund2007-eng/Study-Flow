/**
 * A simple column chart made from plain HTML/CSS (no chart library).
 * `data` is [{ key, label, value, description }].
 * The visible chart is hidden from screen readers; a hidden table with the same
 * numbers is provided for them instead.
 */
export default function BarChart({ data, title, valueUnit = 'min' }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <figure className="bar-chart">
      <div className="bar-chart__plot" aria-hidden="true">
        {data.map((item) => {
          const height = item.value === 0 ? 0 : Math.max(4, (item.value / max) * 100);
          return (
            <div key={item.key} className={`bar-chart__col${item.highlight ? ' bar-chart__col--highlight' : ''}`}>
              <span className={`bar-chart__value${item.value === 0 ? ' muted' : ''}`}>{item.value}</span>
              <div className="bar-chart__track">
                <div className="bar-chart__bar" style={{ height: `${height}%` }} />
              </div>
              <span className="bar-chart__label">{item.label}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="bar-chart__caption muted" aria-hidden="true">
        Numbers show {valueUnit === 'min' ? 'minutes studied' : valueUnit} per day.
      </figcaption>
      <table className="visually-hidden">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Minutes studied</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.key}>
              <th scope="row">{item.description}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
