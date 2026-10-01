export const PageHead = ({ title, sub, children }) => (
  <div className="pagehead"><div><h1>{title}</h1>{sub && <p className="muted">{sub}</p>}</div><div className="row">{children}</div></div>
);
export const Empty = ({ title, children }) => <div className="empty"><h3>{title}</h3><p>{children}</p></div>;
export const SkeletonGrid = ({ n = 6 }) => (
  <div className="grid">{Array.from({ length: n }, (_, i) => <div key={i} className="acard skel"><div className="cover" /><div className="abody"><i /><i /><i className="short" /></div></div>)}</div>
);
