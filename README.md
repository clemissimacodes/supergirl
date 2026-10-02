# ask

Anonymous inbox — one line, no name, no account.

Low-friction format inspired by a friend’s QA page, with its own look and voice.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Reply at `/answer`. Set `ANSWER_SECRET` in production (required). In local dev it falls back to `local-dev-secret`.

```bash
ANSWER_SECRET=something-private pnpm dev
```

## Notes

- Submissions only accept `{ "question": "..." }` — no identity fields.
- Data lives in `data/qa.json` (fine for local / single-server; swap the store for a DB on serverless).
- A tiny nose appears briefly after you send — never as the first thing on the page.
