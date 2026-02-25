# Reopen and run BushFund (no Postgres needed)

Do this from a **new terminal** in the project folder.

## 1. Go to the project

```bash
cd /Users/zainradwan/Documents/Experimenting/BushFund
```

## 2. Install deps (only needed once)

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 3. Start the app (one command – backend + frontend)

```bash
npm run start
```

This uses **in-memory storage** (no Docker, no Postgres, no psql). You should see:

- `[backend] BushFund API listening on http://localhost:4000`
- `[frontend] ➜  Local:   http://localhost:3000/`

## 4. Open in the browser

Open: **http://localhost:3000**

Then:

1. Click **“Load sample portfolio”**
2. Click **“Create portfolio & view results”**
3. Click **“Run hedge analysis”**

---

**To stop:** In the terminal where `npm run start` is running, press **Ctrl+C** once or twice.

**If you see “address already in use” or things don’t load:** Something is still using port 3000 or 4000 (often an old BushFund run). Free the ports and start again:

```bash
# Kill whatever is on 4000 and 3000 (Mac/Linux)
lsof -ti :4000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
# Then start again
cd /Users/zainradwan/Documents/Experimenting/BushFund
npm run start
```

Or close the terminal tab/window where BushFund was running before, then open a new terminal and run `npm run start` again.
