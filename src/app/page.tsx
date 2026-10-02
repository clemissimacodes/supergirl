import { QaApp } from "@/components/QaApp";
import { listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await listEntries();

  return (
    <main className="shell">
      <header className="top">
        <h1 className="title">ask.</h1>
        <p className="lede">
          leave a question or a note. no name, no account — i usually write back
          the same day.
        </p>
      </header>
      <QaApp initialEntries={entries} />
      <footer className="foot">
        format inspired by a friend&apos;s{" "}
        <a href="https://jetpham.com/qa" target="_blank" rel="noreferrer">
          qa page
        </a>
        .
      </footer>
    </main>
  );
}
