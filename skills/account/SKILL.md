---
name: account
description: "Account management skill — meeting agendas, scope tracking, RACIs, QBR prep. Use when the user mentions a client name with an operational task, says 'agenda', 'scope', 'SOW', 'RACI', 'QBR', 'quarterly review', or 'account'."
argument-hint: "[agenda|scope|raci|qbr] [client] [program|meeting-keywords]"
user-invocable: true
---

# /account — Account Management

Manages the operational layer of client accounts: pre-meeting agendas, scope tracking, RACI matrices, and QBR prep.

## Configuring the clients root

This skill expects a clients directory configured in the user's CLAUDE.md. Default: `~/ai-workstation/clients/`.

If a different root is configured (e.g. `~/Work/clients/`), use that instead. Resolve the path from CLAUDE.md before doing anything else.

## Client Directory Convention

```
<clients-root>/[client]/
├── programs/
│   └── [program-name]/
│       ├── docs/
│       │   ├── sow/                ← SOW files
│       │   ├── deliverables/
│       │   └── from-client/
│       ├── meetings/
│       └── raci.md                 ← RACI for this program (created by this skill)
├── [client]-action-items.md        ← optional
├── [client]-contacts.md            ← optional
├── [client]-open-threads.md        ← optional
└── qbrs/                           ← QBR prep docs (created by this skill)
```

If the user's structure differs, adapt — but propose the convention above when scaffolding new clients.

## Mode Routing

| Input | Mode |
|---|---|
| `agenda [client] [meeting keywords]` | **agenda** — pre-meeting agenda from last transcript |
| `scope [client] [program]` | **scope** — scope tracker, SOW reference, creep log |
| `raci [client] [program]` | **raci** — RACI matrix per program |
| `qbr [client] [program]` | **qbr** — quarterly business review prep |
| `[client]` only | Show mode menu |
| (empty) | Show mode menu |

Client and program names are matched fuzzily against directory names under the clients root.

---

## Mode: agenda

Generate a structured meeting agenda before a client meeting by pulling open items from the last session.

**Steps:**

1. **Find the last meeting.** If Fireflies MCP is available, search by client name + provided keywords, scoped to the last 30 days. Otherwise, look in `<clients-root>/[client]/programs/[program]/meetings/` for the most recent file.

2. **Extract open action items.** Group by person. Flag overdue.

3. **Read open threads.** Check `[client]-open-threads.md` and `[client]-action-items.md` if they exist.

4. **Check calendar.** If Calendar MCP is available, look at the next 2 weeks for related meetings or deadlines.

5. **Draft agenda:**

```markdown
## [Meeting Name] Agenda — [Date]

### Open Action Items (from [last meeting date])

**[Person 1]**
- [ ] [Action] — [overdue / due this week / pending]

### Open Threads
- [Relevant thread]

### Suggested Discussion Topics
- [Synthesized from open items + context]

### Upcoming Milestones
- [From calendar or known deadlines]
```

6. Ask: "Anything else to add before the meeting?" Output to screen by default; only save if asked.

---

## Mode: scope

Track in-scope vs out-of-scope for a program, reference SOWs, and log scope creep.

**Steps:**

1. **Locate SOW.** Read SOW file(s) from `<clients-root>/[client]/programs/[program]/docs/sow/`. Use the `docx` skill for `.docx`. Summarize contracted scope.

2. **Check for existing scope log.** `programs/[program]/scope-log.md`. Create if missing.

3. **Interactive mode.**
   - "What's in scope?" → summarize SOW deliverables
   - "Log scope creep" → user describes the ask; classify (in-scope / gray area / out-of-scope) and append
   - "Show creep log" → display the running log

4. **Format:**

```markdown
# Scope Log — [Program Name]

**SOW Reference:** `docs/sow/[filename]`
**Contracted Period:** [dates]

## In-Scope Deliverables
- [From SOW]

## Scope Creep Log

| Date | Ask | Requested By | Classification | Resolution |
|---|---|---|---|---|
| YYYY-MM-DD | [Description] | [Who] | Out of scope | [Pending / absorbed / new SOW / pushed back] |
```

---

## Mode: raci

Create or update a RACI matrix for a program.

**Steps:**

1. Check for existing `programs/[program]/raci.md`. If it exists, ask what needs updating.
2. If new: pull SOW (deliverables = rows), client contacts, recent meeting notes. Draft.
3. **Format:**

```markdown
# RACI — [Program Name]

**Last Updated:** YYYY-MM-DD

| Activity | R (Responsible) | A (Accountable) | C (Consulted) | I (Informed) |
|---|---|---|---|---|
| [Deliverable 1] | [Name] | [Name] | [Names] | [Names] |
```

Use first names. Mark unclear roles `[?]` and ask.

4. Save to `<clients-root>/[client]/programs/[program]/raci.md`.

---

## Mode: qbr

Prepare a quarterly business review for a program.

**Steps:**

1. **Read program context.** SOW, RACI, scope log if they exist.
2. **Pull meeting history.** Last quarter (90 days). Extract milestones, deliverables, blockers, outstanding items.
3. **Read open threads** from any `[client]-*.md` wiki files.
4. **Read deliverables** under `programs/[program]/docs/deliverables/`.
5. **Ask for narrative context:**
   - "Main goals this quarter?"
   - "What went well? What were the blockers?"
   - "What should the QBR narrative be?"

6. **Compile:**

```markdown
# QBR — [Program Name] — [Quarter/Year]

## Program Overview
- **SOW Period:** [dates]
- **Team:** [from RACI or SOW]
- **Objective:** [from SOW + user input]

## Accomplishments
- [Milestone]: [impact or status]

## Challenges & Resolutions
- [Blocker]: [how resolved]

## Metrics / Evidence
- [Program-specific]

## Open Items
- [Unresolved heading into next quarter]

## Recommendations
- [Strategic next steps]
```

7. **Save** to `<clients-root>/[client]/qbrs/[program]-[quarter]-[year].md`. `mkdir -p` first.

8. **Offer deck.** Ask if the user wants to turn this into a deck (e.g., via `pptx` or a deck-building skill they have installed).
