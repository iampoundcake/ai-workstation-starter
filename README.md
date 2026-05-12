# 🍰 POUNDCAKE OS Dashboard

Local web dashboard that maps Joe's domains to clickable skill buttons. Each click spawns a headless Claude Code session and streams output back to the UI.

## Architecture

```
Browser (React/Vite at :5173)
   ↕ /api proxy
Express server (:4321)
   ↕ spawn
claude -p "<prompt>"  (runs in ~/POUNDCAKE_OS as cwd)
```

## Run

```bash
cd ~/POUNDCAKE_OS/dashboard
npm run dev
```

Or with the alias: `poundos`

Then open http://localhost:5173

## Domains & Skills

7 domain columns mirroring the OS:
- **Coaching** — prep, capture, review, leadership
- **Account** — agenda, scope, RACI, QBR
- **Strategy** — content audit, Sprinklr, research, watch
- **AI Pod** — roundtable, skill-creator, persona-creator
- **Sales** — intake, RFP, proposal, status
- **Personal Brand** — LinkedIn (ideas/draft/queue/publish), career-ops
- **Engineering** — impeccable, graphify, build

## How clicks work

- Skills with no args → click → runs immediately, output streams to right panel
- Skills with args → click → expands inline form → fill in → "Run skill →"
- Output streams via Server-Sent Events from `claude -p`
- Stop button kills the spawned process

## Sidebar

- **Scheduled Routines** — the 5 cron-based tasks
- **LinkedIn** — drafts/queued/posted counts
- **Recent Vault Activity** — latest files in raw/wiki/output/personal-brand/sprinklr

## Notes

- All `claude -p` invocations run with `cwd: ~/POUNDCAKE_OS` so the OS CLAUDE.md is loaded
- The dashboard requires `claude` to be on PATH
- Output is non-interactive — for skills that need back-and-forth (capture, intake), run them in your terminal
