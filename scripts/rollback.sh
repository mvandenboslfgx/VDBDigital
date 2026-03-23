#!/usr/bin/env bash
# Roll back Vercel production to the previous deployment.
# Requires: VERCEL_TOKEN, and usually VERCEL_ORG_ID + VERCEL_PROJECT_ID (or linked .vercel/)
#
# Usage:
#   export VERCEL_TOKEN=...
#   export VERCEL_ORG_ID=team_xxx   # optional if project is linked
#   export VERCEL_PROJECT_ID=prj_xxx
#   ./scripts/rollback.sh
set -euo pipefail

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "error: VERCEL_TOKEN is required" >&2
  exit 1
fi

exec npx --yes vercel rollback --yes --token "$VERCEL_TOKEN" "$@"
