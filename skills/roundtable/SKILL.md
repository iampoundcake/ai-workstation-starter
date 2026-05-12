---
name: roundtable
description: "Multi-persona advisory panel in a single chat. Loads personas from the user's persona library and has Claude play multiple experts weighing in on a question. Trigger on 'roundtable', 'panel', 'what would [persona] think', 'get me the team on this', 'weigh in', or `/roundtable`."
argument-hint: "[team-name or persona1,persona2,...] [question]"
user-invocable: true
---

# /roundtable — Multi-Persona Advisory Panel

Loads personas from `~/ai-workstation/personas/` and runs a structured panel discussion where each persona responds in character. Cheaper and faster than spawning multiple agents for simple decisions, process questions, and methodology debates.

## Persona Library

**Source:**
- `~/ai-workstation/personas/agents.yaml` — system prompts and team definitions
- `~/ai-workstation/personas/*.md` — detailed profiles (optional but recommended)

When a persona has both a YAML entry and a `.md` file, load **both** — YAML gives the system prompt, the `.md` gives the full backstory and detailed expertise.

If neither file exists, tell the user: "No personas found at `~/ai-workstation/personas/`. Use `/persona-creator` to build one, or invoke ad hoc personas inline (see Custom Personas below)."

## Pre-Configured Teams

Teams are defined in `agents.yaml` under the `teams:` key. Starter teams shipped in the example agents.yaml:

| Team | Personas | Good for |
|---|---|---|
| Engineering | Architect, Engineer, Frontend, Reviewer | Technical decisions, architecture |
| Design Sprint | Designer, Researcher, Copywriter, Frontend | UX/UI decisions, user flows |
| Product Planning | Strategist, Designer, PM, Architect | Roadmap, prioritization |
| Code Review | Reviewer, Architect, Engineer, DevOps | Architecture review, QA |

The user's actual teams come from their `agents.yaml`. Read it before listing.

## Invocation

| Input | Behavior |
|---|---|
| `/roundtable engineering How should we structure this service?` | Loads team, runs panel |
| `/roundtable architect,reviewer,engineer Pick a queue.` | Loads named personas |
| `/roundtable` | Lists available teams and personas |

**Matching:** Team and persona names are matched fuzzily.

## How the Panel Works

### Step 1: Load Personas

Read `agents.yaml` and any matching `.md` files. For each selected persona, internalize:
- Name, role, specialties
- System prompt (personality, voice)
- Detailed profile (expertise, opinions, blind spots, deferral patterns)

### Step 2: Present the Question

```
🎙️ Roundtable: [Team Name or "Custom Panel"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Panelists: [Name (Role)], [Name (Role)], [Name (Role)]

Question: [The question]
```

### Step 3: Each Persona Responds

Go around the table. Each persona responds **in character**:

- **Stay in character.** Don't drift across lanes.
- **Be opinionated.** Senior experts. Strong views, held loosely. No "it depends" without specifics.
- **Be concise.** 3-6 sentences per persona.
- **Reference each other.** Agree, disagree, or build on prior speakers. Use deferral patterns from `.md` files.
- **Flag disagreements explicitly.** Tension is the point.

Format:

```
**[Name]** ([Role]):
[Their take — concise, opinionated, in character]
```

### Step 4: Synthesis

After everyone speaks, synthesize as yourself (Claude, not a persona):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Synthesis:**
- **Consensus:** [Where they agree]
- **Tension:** [Where they disagree and why]
- **Recommended path:** [If a clear direction emerged]
- **Open questions:** [What wasn't resolved]
```

### Step 5: Continue or Close

Ask: "Want to dig deeper on anything, or put a different question to the table?"

If the user continues, personas stay loaded and remember the prior turn.

## Custom Personas

The user can define ad hoc personas inline:

```
/roundtable "CMO who hates dashboards", "Junior analyst who loves the platform", architect
How should we simplify reporting?
```

For inline personas (quoted strings), invent a plausible expert with that perspective. Library personas load as defined.
