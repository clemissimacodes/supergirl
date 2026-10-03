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
          <a
            className="timeline-inspo"
            href="https://jetpham.com/qa"
            target="_blank"
            rel="noreferrer"
          >
            friend inspo
          </a>
        </div>
        <p className="timeline-lede">i usually respond day of.</p>
      </header>
      <QaApp initialEntries={entries} />
    </main>
  );
}
