#!/usr/bin/env bash
# VAN OPS — serve the wall over http:// so the monitors can talk to each other.
cd "$(dirname "$0")" || exit 1
PORT="${1:-8080}"
echo ""
echo "  VAN OPS is up.  Open this on every monitor:"
echo ""
echo "      http://localhost:${PORT}/"
echo ""
echo "  Ctrl-C to stop."
echo ""
if command -v python3 >/dev/null 2>&1; then exec python3 -m http.server "$PORT"
elif command -v python  >/dev/null 2>&1; then exec python  -m SimpleHTTPServer "$PORT"
elif command -v npx     >/dev/null 2>&1; then exec npx --yes serve -l "$PORT" .
else echo "Need python3 or node installed."; exit 1; fi
