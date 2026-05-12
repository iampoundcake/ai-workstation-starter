# POUNDCAKE OS Dashboard

## Register

**Product.** This is a tool that serves the work, not a marketing surface.

## Product Purpose

POUNDCAKE OS Dashboard is the visual front-end for Joe Scott's personal agentic operating system. The vault at `~/POUNDCAKE_OS/` holds his domains, skills, and routines as files; the dashboard maps those files to clickable buttons and a continuous chat with Claude Code.

The job: make the daily AI-augmented workflow feel like opening a workshop, not launching a SaaS app.

## Users

A single user. Joe Scott:
- Director of Strategy & Insights at Premium Blend
- Leads the internal AI & Innovation pod
- Runs enterprise account work (Starbucks)
- Builds his own software on the side
- Lives in the terminal but wants the chrome of a dashboard for at-a-glance routines, skill discovery, and follow-up chat
- Uses a laptop. Mobile is graceful degradation, not a target.

He is opinionated, design-literate, allergic to SaaS patterns, and cares about brand fidelity.

## Brand

The dashboard inherits the design system of `anotherjoescott.com` — "the workshop with sage walls." Editorial dark theme, paper-warm palette, Source Serif 4 / IBM Plex Sans / JetBrains Mono / Instrument Serif typography pairing. The full system reference is `~/Desktop/PB/internal/projects/jspro/DESIGN.md`. Project-specific specifics live in this directory's `DESIGN.md`.

This dashboard is a tool, but the brand language is editorial. The work happens here daily; it should feel considered, not utilitarian.

## Tone

- Direct. Joe is High-D on DiSC. Empty courtesy reads as friction.
- Dryly funny. The empty state says "A workshop is built one bench at a time." Not "Get started" or "Welcome."
- Withholding. The system prefers to under-tell rather than over-explain. Nothing shouts.
- No em dashes. Use commas, periods, semicolons, parentheses. Also not `--`.
- Mono labels for category words and dates. Serif for headlines and italic asides. Body in IBM Plex.

## Anti-References

What this dashboard is NOT and must not become:

- **SaaS landing-page choreography.** No hero metrics, no gradient ribbons, no scroll-revealed cards.
- **AI-tool sparkle.** No glow buttons, no neon, no animated AI orbs.
- **Productivity-influencer aesthetic.** No "10X your workflow" framing, no Notion-template vibe.
- **Agency-portfolio scroll reveals.** No big number animations, no parallax.
- **Dev-portfolio gradient-and-glow.** No background gradients, no card-glow hovers.
- **The hero-metric template.** No big-number + small-label + supporting-stats layout.
- **Identical card grids.** Tiles must vary in weight or size. The vanilla SaaS pricing-card grid is exactly the trap.
- **Glassmorphism as default decoration.** The waves canvas is the texture; surfaces should be solid so it stays a frame, not a noise field.

## Strategic Principles

1. **The vault is the source of truth.** The dashboard reads files in `~/POUNDCAKE_OS/` and surfaces them. It doesn't store state of its own.
2. **Click → Claude Code.** Every skill button spawns a real `claude -p` process running in the vault directory. The dashboard is a thin UI layer over Claude Code, not a wrapper or replacement.
3. **Conversation continues.** Once a session starts (via skill click or direct chat), Claude Code's session is preserved and follow-up messages resume it. The dashboard is not a one-shot launcher.
4. **Routines are first-class.** The 5 cron-based routines (morning brief, leadership prep, sales status, Friday wrap, LinkedIn ideas) appear in the sidebar so Joe can see at a glance what fires when.
5. **Workshop bench, not control panel.** The aesthetic communicates "things at different states of done," not "command center."

## Audience-Of-One Editing Principle

Future-Joe is the only audience. No copy is written for an outside reader. No element exists to impress someone who might land here. If a feature is added because "users would expect it," it shouldn't ship.
