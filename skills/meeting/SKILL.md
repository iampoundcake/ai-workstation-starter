---
name: meeting
description: "General meeting capture — pulls a transcript (Fireflies or pasted), extracts notes and action items, files them, and optionally drafts a follow-up. Trigger on phrases like 'meeting capture', 'capture meeting', 'file meeting notes', 'process this meeting', or `/meeting`."
argument-hint: "[capture|recap] [transcript-url-or-path] [optional context]"
user-invocable: true
---

# /meeting — General Meeting Capture

Processes a meeting transcript: pulls the signal, files structured notes, surfaces action items, and optionally drafts a follow-up email.

## Mode Routing

| Input | Mode |
|---|---|
| `capture [url-or-path]` | **capture** — full processing: notes file + action items + optional follow-up draft |
| `recap [url-or-path]` | **recap** — output a clean summary only, no file write |
| (just a URL or path, no mode word) | Default to **capture** |
| (empty) | Ask for a transcript URL or file path |

## Mode: capture

**Purpose:** Run after a meeting. Get the transcript, build a structured note, file it, surface what the user owes.

**Steps:**

1. **Get the transcript.**
   - **Fireflies URL or ID** → use the Fireflies MCP if available (`fireflies_get_summary`, `fireflies_get_transcript`).
   - **Local file path** → read the file directly.
   - **Pasted transcript text** → use as-is.

2. **Decide where to file.** Default destination: `~/ai-workstation/raw/meetings/YYYY-MM-DD_<title-slug>.md`.

   If the meeting clearly belongs elsewhere (e.g., a project directory the user is actively working in, a client folder defined in their CLAUDE.md), propose that path instead.

   **Always show the proposed path and confirm before writing.**

   ```
   Filing to: <path>
   Why: <one-line reason>
   Override? (paste a different path or "ok")
   ```

3. **Ensure the destination directory exists.** Run `mkdir -p` on the parent before writing.

4. **Write the note file.**

```markdown
---
filed: YYYY-MM-DD HH:MM
meeting: <title>
date: <meeting date>
duration: <minutes>
source: <fireflies-id | file path | pasted>
attendees:
  - <name or email>
---

# <Meeting Title>

## Summary
<short summary, kept verbatim if pulled from a source>

## Key Topics
- <distilled bullets — 3 to 7 max>

## Decisions
- <what was actually decided>

## Action Items

### Mine
- [ ] <action> — <by when, if mentioned>

### Others
- **<Person>**: <action>

## Open Threads
- <anything that needs follow-up but wasn't assigned>

## Notes
<Anything else worth keeping. Don't pad. If nothing, omit.>
```

5. **Surface commitments.**

```markdown
Filed → <path>

You committed to:
- [ ] <action 1>
- [ ] <action 2>

Want a follow-up email drafted? (yes/no)
```

6. **If yes:** draft a recap email covering decisions, what the user owes, and what others owe. Save to `~/ai-workstation/output/comms/<recipient-or-team>-<topic>-<date>.md`. Offer to push to Gmail drafts if the Gmail MCP is available.

## Mode: recap

**Purpose:** Quick read-out, no file. Use when the user just wants to remember what happened.

**Steps:**

1. Pull summary and action items from the transcript.
2. Output a tight read-out:

```markdown
## <Meeting Title> — <Date> (<duration>)

**Attendees:** <comma-separated>

**Summary:** <one paragraph>

**Decisions:** <bullets>

**My actions:** <bullets>

**Others' actions:** <person: action bullets>
```

3. Don't write anything to disk. Don't draft any follow-up.

## Style

- Notes are for the user. Direct, distilled, no marketing voice.
- Don't reword the transcript's summary unless it's noisy.
- Always separate the user's action items from others'.
