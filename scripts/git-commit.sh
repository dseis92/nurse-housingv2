#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-$HOME/dev/nurse-app/nurse-housingv2}"
MSG="${2:-chore: commit updates}"

cd "$REPO" 2>/dev/null || { echo "❌ repo not found: $REPO"; exit 2; }

# init if needed, prefer 'main'
if [ ! -d .git ]; then
  git init
fi
if git rev-parse --verify master >/dev/null 2>&1; then
  git branch -M master main
fi
current_branch="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
git branch -M "$current_branch" main 2>/dev/null || true

# stage, commit, push (if origin exists)
git add -A

if git diff --cached --quiet; then
  echo "🟡 nothing to commit"
else
  git commit -m "$MSG" || true
fi

if git remote get-url origin >/dev/null 2>&1; then
  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    git push
  else
    git push -u origin "$(git symbolic-ref --short HEAD || echo main)"
  fi
else
  echo "🔹 no 'origin' remote set."
  echo "   add one:  git remote add origin git@github.com:<USER>/<REPO>.git"
fi

echo "— last commit —"
git --no-pager log -1 --stat
