# Chirper

Anonymous Twitter-style stream. No name, no account — just chirp.

Posts as **anon**. Host replies show up as threaded tweets.

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
- Tiny nose appears after send + as the host avatar — never as a hero.
