import { QaApp } from "./QaApp";
import { listEntries } from "@/lib/store";

export async function AskFrame() {
  const entries = await listEntries();

  return (
    <section className="frame ask-frame" id="notes" aria-label="questions">
      <div className="ask-frame-inner">
        <header className="ask-frame-top">
          <div className="timeline-heading">
            <h1 className="timeline-title">
              i welcome all questions, thoughts, & well wishes
            </h1>
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
        </header>
        <div className="ask-frame-body">
          <QaApp initialEntries={entries} />
        </div>
      </div>
    </section>
  );
}
