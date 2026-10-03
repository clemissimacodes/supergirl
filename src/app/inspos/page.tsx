import Link from "next/link";

const INSPOS = [
  {
    n: 1,
    name: "jia",
    href: "https://www.jia.build/#questions",
    note: "questions",
  },
  {
    n: 2,
    name: "jet",
    href: "https://jetpham.com/qa",
    note: "q+a",
  },
] as const;

export default function InsposPage() {
  return (
    <main className="timeline">
      <header className="timeline-top">
        <div className="timeline-heading">
          <h1 className="timeline-title">inspos</h1>
          <Link className="timeline-inspo" href="/">
            back
          </Link>
        </div>
        <p className="timeline-lede">pages that made me want one of these.</p>
      </header>
      <ol className="inspo-list">
        {INSPOS.map((item) => (
          <li key={item.n} className="inspo-row">
            <span className="inspo-n">{item.n}</span>
            <a href={item.href} target="_blank" rel="noreferrer">
              {item.name}
            </a>
            <span className="inspo-note">{item.note}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
