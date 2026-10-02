# questions

Anonymous ask page — one box, no name, no account.

Inspired by [jetpham.com/qa](https://jetpham.com/qa), made ours.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Reply to unanswered questions at `/answer` with `ANSWER_SECRET` (defaults to `local-dev-secret` in development).

```bash
ANSWER_SECRET=something-private pnpm dev
```

## Notes

- Submissions only accept `{ "question": "..." }` — no identity fields.
- Data lives in `data/qa.json` (fine for local / single-server; swap the store for a DB on serverless).
- A tiny nose appears for a moment after you ask — never as the first thing on the page.
