import { QaApp } from "@/components/QaApp";
import { listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await listEntries();

  return (
    <main className="timeline">
      <header className="timeline-top">
        <div className="timeline-heading">
          <h1 className="timeline-title">Chirper</h1>
          <p className="inspo-inline">
            inspos{" "}
            <a
              href="https://www.jia.build/#questions"
              target="_blank"
              rel="noreferrer"
            >
              1
            </a>
            {" & "}
            <a href="https://jetpham.com/qa" target="_blank" rel="noreferrer">
              2
            </a>
          </p>
        </div>
        <p className="timeline-lede">the better twitter</p>
      </header>
      <QaApp initialEntries={entries} />
    </main>
  );
}
