import { QaApp } from "@/components/QaApp";
import { listEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const entries = await listEntries();

  return (
    <main className="shell">
      <header className="top">
        <h1 className="title">questions</h1>
        <a
          className="inspo"
          href="https://jetpham.com/qa"
          target="_blank"
          rel="noreferrer"
        >
          friend inspo
        </a>
      </header>
      <p className="lede">i usually respond day of.</p>
      <QaApp initialEntries={entries} />
    </main>
  );
}
