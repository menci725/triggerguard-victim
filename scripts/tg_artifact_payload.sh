#!/usr/bin/env bash
set -euo pipefail

MODE="${TRIGGERGUARD_MODE:-observe}"
REPO="${GITHUB_REPOSITORY:-unknown/repo}"
EVENT_NAME="${GITHUB_EVENT_NAME:-unknown}"
ACTOR="${GITHUB_ACTOR:-unknown}"

echo "TRIGGERGUARD_WORKFLOW_RUN_MARKER=executed"
echo "mode=${MODE}"
echo "repo=${REPO}"
echo "event=${EVENT_NAME}"
echo "actor=${ACTOR}"

if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "github_token_present=yes"
else
  echo "github_token_present=no"
fi

if [ "${MODE}" = "prove_write" ]; then
  MARKER="triggerguard-$(date +%s)"
  echo "Attempting optional write proof against disposable test repo."
  gh api \
    -X POST \
    "repos/${REPO}/actions/variables" \
    -f "name=TRIGGERGUARD_MARKER" \
    -f "value=${MARKER}" \
    || gh api \
    -X PATCH \
    "repos/${REPO}/actions/variables/TRIGGERGUARD_MARKER" \
    -f "name=TRIGGERGUARD_MARKER" \
    -f "value=${MARKER}"
fi
