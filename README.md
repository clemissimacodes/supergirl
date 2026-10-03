# Chirper

Anonymous Twitter-style stream for questions and notes. No name, no account.

Posts as **anon**. Replies show as a thread from **clemissima**.

## Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Reply at `/answer`. Set `ANSWER_SECRET` in production (required). Local fallback: `local-dev-secret`.

## Notes

- Submit body is only `{ "question": "..." }` — no identity fields.
- Data: `data/qa.json` (swap for a DB on serverless).
