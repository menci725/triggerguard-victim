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
  RUN_ID="${GITHUB_RUN_ID:-$(date +%s)}"
  PROOF_PATH="triggerguard-proof/workflow-run-${RUN_ID}.txt"
  PROOF_BODY="$(cat <<EOF
TRIGGERGUARD_CONTENT_WRITE_PROOF=workflow_run
repo=${REPO}
event=${EVENT_NAME}
actor=${ACTOR}
run_id=${RUN_ID}
EOF
)"
  ENCODED_CONTENT="$(printf '%s\n' "${PROOF_BODY}" | base64 -w 0)"
  echo "Attempting optional write proof against disposable test repo."
  set +e
  gh api \
    -X PUT \
    "repos/${REPO}/contents/${PROOF_PATH}" \
    -f "message=TriggerGuard workflow_run content write proof ${RUN_ID}" \
    -f "content=${ENCODED_CONTENT}"
  STATUS="$?"
  set -e
  echo "write_proof_exit=${STATUS}"
  echo "write_proof_path=${PROOF_PATH}"
  exit "${STATUS}"
fi
