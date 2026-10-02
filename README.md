# questions

Anonymous ask page — one box, no name, no account.

Inspired by [jetpham.com/qa](https://jetpham.com/qa), made ours.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Reply to unanswered questions at `/answer`. Set `ANSWER_SECRET` in production (required). In local dev it falls back to `local-dev-secret`.

```bash
ANSWER_SECRET=something-private pnpm dev
```

## Notes

- Submissions only accept `{ "question": "..." }` — no identity fields.
- Data lives in `data/qa.json` (fine for local / single-server; swap the store for a DB on serverless).
- A tiny nose appears for a moment after you ask — never as the first thing on the page.
