#!/usr/bin/env bash
set -euo pipefail
BRANCH=${1:-main}

echo "[safe-push] fetch origin/${BRANCH}"
git fetch origin "${BRANCH}"

echo "[safe-push] rebase onto origin/${BRANCH}"
git rebase "origin/${BRANCH}"

echo "[safe-push] push ${BRANCH}"
git push origin "${BRANCH}"

echo "[safe-push] done"
