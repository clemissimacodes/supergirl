import { QaApp } from "@/components/QaApp";
import { listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await listEntries();

  return (
    <main className="timeline">
      <header className="timeline-top">
        <h1 className="timeline-title">Chirper</h1>
        <p className="timeline-lede">anonymous chirps. i usually reply day-of.</p>
      </header>
      <QaApp initialEntries={entries} />
    </main>
  );
}
