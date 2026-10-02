# ask

Anonymous ask stream — Twitter-style timeline, no name or account.

Type a note, it posts as **anon**. Replies show as a thread from the host.

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
- Tiny nose appears after send + as the host avatar badge — never as a hero.
