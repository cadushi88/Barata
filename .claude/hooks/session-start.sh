#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# package-lock.json here can drift out of sync with package.json (npm ci then
# fails), so use install rather than ci — it self-heals the lockfile and lets
# the container cache node_modules across sessions.
npm install
