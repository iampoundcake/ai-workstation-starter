#!/usr/bin/env bash
# AI Workstation — installer
#
# Idempotent. Re-running won't clobber existing files; it'll prompt before
# overwriting and skip on no.
#
# What it does:
#   1. Asks for vault path + theme
#   2. Updates config.json
#   3. Scaffolds the vault directory tree
#   4. Copies the starter persona pack into <vault>/personas/
#   5. Drops a starter CLAUDE.md into the vault (if none exists)
#   6. Installs the four shipped skills into ~/.claude/skills/
#   7. Adds an `aiws` shell alias
#   8. Installs npm dependencies
#
# Run from repo root: ./setup.sh

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

C_RESET="\033[0m"
C_BOLD="\033[1m"
C_DIM="\033[2m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_CYAN="\033[36m"

say()  { printf "${C_BOLD}%s${C_RESET}\n" "$*"; }
note() { printf "${C_DIM}  %s${C_RESET}\n" "$*"; }
ok()   { printf "${C_GREEN}✓${C_RESET} %s\n" "$*"; }
warn() { printf "${C_YELLOW}!${C_RESET} %s\n" "$*"; }
ask()  { printf "${C_CYAN}?${C_RESET} %s " "$*"; }

# --- preflight -------------------------------------------------------------

if ! command -v node >/dev/null 2>&1; then
  warn "node is required (https://nodejs.org). Install and re-run."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  warn "npm is required. Install and re-run."
  exit 1
fi

# --- header ----------------------------------------------------------------

say ""
say "AI Workstation installer"
note "$REPO"
say ""

# --- vault path ------------------------------------------------------------

DEFAULT_VAULT="$HOME/ai-workstation"
ask "Vault path [$DEFAULT_VAULT]:"
read -r VAULT_INPUT
VAULT="${VAULT_INPUT:-$DEFAULT_VAULT}"
VAULT="${VAULT/#\~/$HOME}"

# --- theme -----------------------------------------------------------------

say ""
say "Themes:"
note "  workshop  — editorial dark, sage + terracotta"
note "  daylight  — warm paper, forest accent"
note "  terminal  — Bloomberg-style dark, cyan + amber"
note "  studio    — burgundy editorial on cream"
ask "Theme [workshop]:"
read -r THEME_INPUT
THEME="${THEME_INPUT:-workshop}"

case "$THEME" in
  workshop|daylight|terminal|studio) ;;
  *)
    warn "Unknown theme '$THEME'. Falling back to workshop."
    THEME="workshop"
    ;;
esac

# --- write config.json -----------------------------------------------------

# Use python for JSON edit so we don't depend on jq.
python3 - <<PY
import json, os
p = os.path.join("$REPO", "config.json")
with open(p) as f: cfg = json.load(f)
cfg["vaultPath"] = "$VAULT"
cfg["clientsRoot"] = os.path.join("$VAULT", "clients")
cfg["theme"] = "$THEME"
with open(p, "w") as f: json.dump(cfg, f, indent=2)
PY

ok "config.json updated (theme=$THEME, vault=$VAULT)"

# --- scaffold vault --------------------------------------------------------

mkdir -p "$VAULT"/{raw,wiki,output,personas,clients,projects}
ok "vault scaffold at $VAULT"

# --- copy persona pack -----------------------------------------------------

if [ -f "$VAULT/personas/agents.yaml" ]; then
  ask "personas/agents.yaml already exists. Overwrite? [y/N]"
  read -r OW
  if [[ "$OW" =~ ^[Yy]$ ]]; then
    cp "$REPO/templates/personas/agents.yaml" "$VAULT/personas/agents.yaml"
    ok "personas/agents.yaml replaced"
  else
    note "kept existing personas/agents.yaml"
  fi
else
  cp "$REPO/templates/personas/agents.yaml" "$VAULT/personas/agents.yaml"
  ok "personas/agents.yaml installed"
fi

# --- starter CLAUDE.md -----------------------------------------------------

if [ -f "$VAULT/CLAUDE.md" ]; then
  note "CLAUDE.md exists at $VAULT/CLAUDE.md (skipped — run /aiworkstation init to refresh)"
else
  cp "$REPO/templates/vault/CLAUDE.md" "$VAULT/CLAUDE.md"
  ok "starter CLAUDE.md placed (run /aiworkstation init to fill in {{TOKEN}}s)"
fi

# --- install skills --------------------------------------------------------

mkdir -p "$SKILLS_DIR"
for skill in raw meeting account roundtable aiworkstation; do
  src="$REPO/skills/$skill"
  dst="$SKILLS_DIR/$skill"
  if [ -d "$dst" ]; then
    ask "skill '$skill' already installed. Overwrite? [y/N]"
    read -r OW
    if [[ "$OW" =~ ^[Yy]$ ]]; then
      rm -rf "$dst"
      cp -R "$src" "$dst"
      ok "skill '$skill' replaced"
    else
      note "kept existing skill '$skill'"
    fi
  else
    cp -R "$src" "$dst"
    ok "skill '$skill' installed"
  fi
done

# --- shell alias -----------------------------------------------------------

ALIAS_LINE="alias aiws='cd $REPO && npm run dev'"
SHELL_RC=""
case "${SHELL:-}" in
  *zsh)  SHELL_RC="$HOME/.zshrc" ;;
  *bash) SHELL_RC="$HOME/.bashrc" ;;
esac

if [ -n "$SHELL_RC" ]; then
  if [ -f "$SHELL_RC" ] && grep -Fq "alias aiws=" "$SHELL_RC"; then
    note "aiws alias already in $SHELL_RC (left as-is)"
  else
    printf "\n# AI Workstation\n%s\n" "$ALIAS_LINE" >> "$SHELL_RC"
    ok "aiws alias added to $SHELL_RC"
  fi
else
  warn "Couldn't detect your shell rc. Add this manually:"
  note "  $ALIAS_LINE"
fi

# --- npm install -----------------------------------------------------------

say ""
say "Installing dashboard dependencies (npm install)..."
cd "$REPO"
# If node_modules is a symlink (Joe's dev setup), remove it first so npm can
# do a real install.
if [ -L "node_modules" ]; then
  rm "node_modules"
fi
npm install --silent
ok "dependencies installed"

# --- done ------------------------------------------------------------------

say ""
ok "AI Workstation ready."
say ""
say "Next:"
note "  1. Open a new terminal (so the aiws alias loads), then run: aiws"
note "  2. In Claude Code, try /raw <a thought>"
note "  3. Run /aiworkstation init to generate personalized skills"
say ""
