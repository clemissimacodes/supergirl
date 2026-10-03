# Chirper

the better twitter — ask anything anonymously.

Posts as **anon**. Click a chirp to read **clemissima**’s reply. Opens (views) tick up when someone peeks.

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
- Inspos in the header: **1** jia, **2** jet.
