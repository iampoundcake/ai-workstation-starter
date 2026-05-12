---
name: raw
description: "Quick-capture to the vault inbox at ~/ai-workstation/raw/. Use when the user wants to file a note, brain dump, idea, link, quote, snippet, or anything that should land in the inbox before being routed elsewhere. Trigger on phrases like 'save this', 'capture this', 'file this', 'drop this in raw', 'add to raw', 'jot this down', or `/raw`."
argument-hint: "[content, title, URL, or file path]"
user-invocable: true
---

# /raw — Vault Inbox Capture

Files anything into the universal inbox at `~/ai-workstation/raw/`. From there, content gets routed (manually, or by `/aiworkstation index`) into wiki articles, project folders, or wherever it belongs.

The vault's CLAUDE.md (`~/ai-workstation/CLAUDE.md`) defines routing rules out of `raw/`. This skill only handles the IN.

## What this skill files

| Input type | Behavior |
|---|---|
| **Text content** (paragraphs of thought) | Save as-is into a dated markdown file |
| **A short topic + body** | Use the topic as title, body as content |
| **A URL** | Save the URL with a stub. If the user says "fetch", pull the page and summarize |
| **A file path** (e.g. `/raw read ~/Downloads/notes.md`) | Read the file, save its contents into raw |
| **Empty input** | Ask one question: "What do you want to file?" Wait. Don't manufacture content. |

## Steps

1. **Parse the argument.**
   - URL → link capture.
   - File path or `read <path>` → file capture.
   - Text → content.
   - Empty → prompt: "What do you want to file?" Wait.

2. **Determine the title.**
   - If the user provided `--title "X"` or wrote a clear short heading on the first line, use that.
   - Otherwise, extract the most specific noun phrase from the first 1-2 sentences. Avoid generic titles ("note", "thoughts", "stuff"). Aim for something the user would search for later.
   - If you can't infer a clear title, ask: "How should I title this?" Wait.

3. **Build the slug.** Lowercase, hyphenated, punctuation stripped, max 40 chars, filesystem-safe.

4. **Generate the filename.** `~/ai-workstation/raw/YYYY-MM-DD_<slug>.md`. If the file exists, append `-2`, `-3`, etc.

5. **Write the file.**

   ```markdown
   ---
   filed: YYYY-MM-DD HH:MM
   source: <inferred: clipboard | dictation | url | file | direct-input>
   tags: <comma-separated, optional, only if obvious>
   ---

   # <Title>

   <Content, preserved verbatim>
   ```

   **Critical:** preserve the user's content as-is. Don't reformat, fix typos, or rephrase. Their raw input is the artifact. The skill files; it doesn't edit.

6. **Confirm.**

   ```
   Filed → ~/ai-workstation/raw/YYYY-MM-DD_slug.md
   Title: <title>
   ```

7. **Suggest routing (optional, only if obvious).** If the content clearly belongs somewhere else (a specific project folder, a wiki article), say so as an offer, not an action. Always default to leaving it in raw.

## URL captures

When the user passes a URL:

1. Save the URL as the source.
2. Title default: parse the page title via WebFetch.
3. If the user says "summarize" or "fetch", use WebFetch to pull the content and embed a summary plus key quotes.
4. If just a bare URL, save a stub:

   ```markdown
   ---
   filed: YYYY-MM-DD HH:MM
   source: url
   url: https://example.com/article
   ---

   # <page title or fallback>

   [URL captured. Fetch later with `/raw fetch <url>`.]
   ```

## File captures

When the user says `/raw read <path>`:

1. Read the file. If binary, save a reference (path + size + filed timestamp).
2. If text, save the contents into raw/ with attribution to the original path.
3. The original file is not moved. Raw gets a copy.

## Style

- Direct. No "I've successfully filed your note" preamble. Just `Filed → path`.
- Don't ask permission to write the file. The user asked for it; do it.
- Only ask follow-ups when input is genuinely missing.
