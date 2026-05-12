---
name: aiworkstation
description: "Set up or maintain the user's AI Workstation vault. Two modes: `init` runs a guided interview and generates personalized skills + a CLAUDE.md; `index` (experimental) reads the vault's raw/ inbox, classifies each file, and routes it to the right destination. Trigger on `/aiworkstation`, 'set up my workstation', 'onboard me', 'index my raw folder', or 'route my inbox'."
argument-hint: "[init|index] [optional flags]"
user-invocable: true
---

# /aiworkstation — Vault Onboarding & Indexing

The control surface for the AI Workstation starter. Two modes:

| Mode | Purpose |
|---|---|
| `init` | Guided interview → personalized skills (via `/skill-creator`) → user's `CLAUDE.md` |
| `index` | (Experimental) Reads `raw/`, classifies each file, suggests destinations, asks when ambiguous, moves on approval. |

If the user just types `/aiworkstation` with no mode, ask which one. Default to `init` if they're a first-time user (no `CLAUDE.md` in the vault yet).

---

## Mode: init

Runs an interview to learn who the user is and what they do, then generates a personalized vault.

### Step 0: Confirm vault location

Read `~/Developer/ai-workstation-starter/config.json` (or wherever the dashboard repo lives) to find the configured `vaultPath`. If the user is running this from a different setup, ask: "Where should your vault live? Default is `~/ai-workstation`."

If the vault already has a `CLAUDE.md`, ask whether to **start over** (back up existing → fresh interview) or **add to it** (interview only the missing pieces).

### Step 1: Identity

Ask in plain language. Don't dump the whole questionnaire at once — one question at a time, conversational.

1. "What should I call you?" → name
2. "In one or two sentences, what do you do?" → role + working bio
3. "What's the one tool you'd be lost without?" → reveals the user's daily workflow gravity

### Step 2: Domains

> "Now let's map out the buckets your work falls into. Most people have 3-7. Examples: client work, internal projects, research, coding, content, personal admin. What are yours?"

For each domain the user names:
- Probe for what they actually do in that domain (1-3 example tasks)
- Ask where it lives on disk today (so the vault structure can mirror reality, not invent it)
- Note recurring rituals (weekly meetings, review cycles, deliverable cadences)

Keep the list visible. Let the user add, rename, drop as they think.

### Step 3: Tool stack

> "What tools and platforms do you live in?"

Specifically ask about:
- Calendar / email (Gmail, Outlook, Apple)
- Meeting capture (Fireflies, Otter, none)
- Notes / docs (Notion, Obsidian, Drive, none)
- CRM / project mgmt (HubSpot, Salesforce, Asana, Linear, etc.)
- Code (GitHub, GitLab)
- Anything else that gets daily use

For each, note whether they have an MCP installed (check `~/.claude/settings.json` or ask). This shapes which skills make sense to generate.

### Step 4: Pain points

> "Where does your day leak the most time? What feels stupid that a computer should be doing?"

Capture in the user's own words. These become the **trigger phrases** for the skills you'll generate.

### Step 5: Map functions → skills

Now synthesize. From the interview, build a table:

| Domain | Recurring function | Proposed skill | Rough trigger phrases |
|---|---|---|---|
| (e.g. Client work) | (e.g. weekly status agendas) | `/account agenda` (already shipped) | "agenda for X" |
| (e.g. Research) | (e.g. summarize a YouTube talk) | New: `/watch` | "summarize this video" |
| ... | ... | ... | ... |

Show the table. Ask: "Which of these new skills should we build? Pick any number, or all."

### Step 6: Generate skills via /skill-creator

For each approved new skill, hand off to `/skill-creator`:

> Use `/skill-creator` to scaffold a new skill named `[name]`. Purpose: `[purpose]`. Triggers: `[phrases]`. Inputs: `[inputs]`. Outputs: `[outputs]`. Place it in `~/.claude/skills/[name]/SKILL.md`.

If `/skill-creator` is not installed, tell the user:

> "I'll need the `skill-creator` plugin from Anthropic's official marketplace to scaffold these. Install it with: `/plugin install skill-creator@claude-plugins-official`. Or I can write rough first drafts manually if you'd rather not install it — they'll be less polished."

If they decline the plugin, write skill drafts directly using the structure of the shipped skills (`raw`, `meeting`, `account`, `roundtable`) as templates.

### Step 7: Write the user's CLAUDE.md

Use `templates/vault/CLAUDE.md` from the starter repo as the scaffold. Substitute:

| Token | From |
|---|---|
| `{{VAULT_NAME}}` | A name the user picks (e.g. "Joe's Workstation") |
| `{{USER_NAME}}` | Step 1 |
| `{{USER_BIO}}` | Step 1 |
| `{{VAULT_PATH}}` | `config.vaultPath` |
| `{{DOMAINS}}` | Markdown sections from Step 2 — one per domain, with `Location`, `Tools`, `Skills`, `Cadence` lines |
| `{{SKILLS_TABLE}}` | Combined: shipped skills + skills generated in Step 6 |
| `{{CONNECTED_SERVICES}}` | Table of MCPs / tools from Step 3 |

Write to `<vaultPath>/CLAUDE.md`. If a backup is needed (Step 0), move the old file to `<vaultPath>/CLAUDE.md.bak-<timestamp>` first.

### Step 8: Scaffold vault structure

Run `mkdir -p` for each directory the new CLAUDE.md references:
- `<vaultPath>/raw/`
- `<vaultPath>/wiki/`
- `<vaultPath>/output/`
- `<vaultPath>/personas/`
- `<vaultPath>/clients/` (if applicable)
- `<vaultPath>/projects/` (if applicable)

Copy `templates/personas/agents.yaml` from the starter repo to `<vaultPath>/personas/agents.yaml` if the file doesn't already exist.

### Step 9: Confirm and hand off

Output a final summary:

```
✓ Vault initialized at <vaultPath>
✓ CLAUDE.md written
✓ <N> skills generated: <names>
✓ Persona pack copied
✓ Vault directories scaffolded

Next:
  1. Restart Claude Code so new skills load.
  2. Try `/raw <a thought>` to test the inbox.
  3. Try `/roundtable engineering <a question>` to test the personas.
```

---

## Mode: index

> **Experimental.** This mode walks `raw/` and proposes a destination for each file based on its content. Treat it as the "compile" step for the universal inbox.

### Step 1: Inventory

List all files in `<vaultPath>/raw/`. For each:
- Read the file (skip binaries; flag them separately)
- Note: filename, filed date (from frontmatter or mtime), first ~500 chars, any `tags` from frontmatter

### Step 2: Classify

For each file, infer a destination based on the user's CLAUDE.md routing rules. Categories:

| Signal | Likely destination |
|---|---|
| Mentions a known client (from `clients/` subdir names) | `clients/[name]/inbox/` |
| Mentions a known project (from `projects/` subdir names) | `projects/[name]/notes/` |
| Reads as cross-domain reference (definitions, methodology, "how X works") | `wiki/<slug>.md` (suggest filename) |
| Reads as a finished artifact (a draft, a deck, a one-pager) | `output/<area>/` |
| URL / link with no commentary | Leave in raw, flag as "needs decision" |
| No clear signal | Leave in raw, flag as "ambiguous" |

### Step 3: Present batch for review

Show the user a table:

```
| File | Snippet | Proposed destination | Confidence |
|---|---|---|---|
| 2026-05-08_pricing-thoughts.md | "Three tiers..." | wiki/pricing-models.md | high |
| 2026-05-09_acme-call-prep.md | "Acme Q3 review..." | clients/acme/inbox/ | high |
| 2026-05-10_random.md | "..." | (leave in raw) | n/a |
```

Ask: "Approve all, approve individually, or skip?"

### Step 4: Move

For each approved row:
- `mkdir -p` the destination
- Move the file (don't copy — index = compile, raw should empty out)
- For `wiki/<slug>.md` proposals, ask the user to confirm the slug before writing

### Step 5: Report

```
Indexed <N> files:
  → clients/acme/inbox/   (3 files)
  → wiki/                 (2 files)
  → output/decks/         (1 file)

Left in raw: <M> files (low confidence — review and re-run)
```

---

## Style

- This skill talks more than most. Onboarding is a conversation, not a form. Ask one question at a time.
- Don't fabricate domains or skills the user didn't bring up.
- Every generated skill should map to a real recurring function, not a hypothetical "wouldn't it be cool if".
- After init, the user's vault should reflect their actual work, not a template.
