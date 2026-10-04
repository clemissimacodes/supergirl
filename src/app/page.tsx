import Image from "next/image";

export default async function HomePage() {
  return (
    <>
      <section className="frame index" aria-label="home">
        <Image
          className="index-portrait"
          src="/clemi-still.png"
          alt="A drawing of Clementine in a clementine hood with rabbit ears"
          width={480}
          height={676}
          priority
        />
        <p className="index-bio">
          I am a being of high happiness. Frank and Elaine hatched me into the
          world some time ago and I now frolic across the great greens of San
          Francisco. I maintain my cardiovascular homeostasis from my eternal
          pursuit of poetry, play, and friendship with the world.
        </p>
        <nav className="toc" aria-label="Contents">
          <h2>Contents</h2>
          <ol>
            <li>
              <a href="https://clemissima.com/teeny-tiny-things">Teeny Tiny Things</a>
            </li>
            <li>
              <a
                href="https://www.lookmodelagency.com/divisions/new-faces/portfolios/clementine/portfolio"
                target="_blank"
                rel="noreferrer"
              >
                Modeling
              </a>
            </li>
            <li>
              <a href="https://clemissima.com/poetry">Poetry</a>
            </li>
            <li>
              <a href="https://clemissima.com/photography">Photography</a>
            </li>
            <li>
              <a href="https://clemissima.com/dandelion">Blow on a Fat Dandelion</a>
            </li>
            <li>
              <a href="https://clemissima.com/secrets">Secrets</a>
            </li>
          </ol>
        </nav>
        <nav className="elsewhere" aria-label="Elsewhere">
          <a
            href="https://www.instagram.com/clemissima/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="17.15" cy="6.85" r="1.05" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://x.com/clemissima"
            target="_blank"
            rel="noreferrer"
            aria-label="Twitter"
          >
            <svg viewBox="0 0 24 24" width="17" height="18" aria-hidden>
              <path
                d="M4.2 4.2 10.9 12.3 4.4 19.8h3.2l5.2-6.1 5.3 6.1h3.1l-7-8.1 6.3-7.5h-3.2l-4.9 5.7L7.4 4.2H4.2z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://open.spotify.com/user/au0r1e82mxbofd2on3lvztrkr?si=d00695766b5e4ed1"
            target="_blank"
            rel="noreferrer"
            aria-label="Spotify"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M7.2 9.2c3.7-1 7.4-.6 10.2.9M7.9 12.2c3-.8 6.2-.5 8.7.8M8.5 15.1c2.5-.6 5-.3 7 .6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
              />
            </svg>
          </a>
        </nav>
      </section>
    </>
  );
}
