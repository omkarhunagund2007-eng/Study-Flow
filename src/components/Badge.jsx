/** A small coloured label. The colour is only decoration: the words carry the meaning. */
export default function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
