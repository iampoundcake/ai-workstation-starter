# {{VAULT_NAME}}

You are operating inside {{USER_NAME}}'s AI command center. Everything they do — work, projects, research — routes through this vault. Your job is to know where things live, what skills to use, and where outputs go.

## Who {{USER_NAME}} Is

{{USER_BIO}}

## Domains

{{DOMAINS}}

## Vault Structure

```
{{VAULT_PATH}}/
├── CLAUDE.md              ← this file
├── raw/                   ← universal inbox (notes, dumps, research)
├── wiki/                  ← compiled cross-domain knowledge
├── output/                ← finished deliverables
├── personas/              ← agents.yaml + persona profiles for /roundtable
├── clients/               ← client / account folders (if applicable)
└── projects/              ← active project folders
```

## Raw — The Universal Inbox

`raw/` is where everything lands first. Use `/raw` to capture anything: thoughts, links, snippets, transcripts. From there, content gets routed (manually, or by `/aiworkstation index`) to the right home.

| If it's about... | Route to |
|---|---|
| A specific client | `clients/[name]/` |
| A specific project | `projects/[name]/` |
| Cross-domain knowledge | `wiki/` |
| A finished deliverable | `output/` |

**File naming in raw:** `YYYY-MM-DD_[topic-slug].md`

## Wiki — Compiled Knowledge

`wiki/` holds knowledge articles that span domains or don't belong inside a single client/project folder.

**File naming in wiki:** `[topic-slug].md` — descriptive and grep-friendly.

## Routing Rules

1. **Client work** → `clients/[name]/` — each client has its own subtree.
2. **Dev projects** → `projects/[name]/` (or wherever the project actually lives).
3. **Everything else** → starts in `raw/`, routes from there.

## Skills Reference

{{SKILLS_TABLE}}

## Connected Services

{{CONNECTED_SERVICES}}
