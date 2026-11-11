#!/usr/bin/env bash
set -e

cd /workspaces/tavern.exe
mkdir -p .logs

echo "Starting Tavern.exe services..."

# Frontend — Vite
if ! (echo > /dev/tcp/127.0.0.1/5173) 2>/dev/null; then
  echo "Starting Vite..."

  setsid bash -c \
    'cd /workspaces/tavern.exe/client && exec npm run dev -- --host 0.0.0.0 --port 5173 --strictPort' \
    > .logs/vite.log 2>&1 < /dev/null &
else
  echo "Vite is already running."
fi

# Backend — Node.js
if [ -f server/index.mjs ]; then
  if ! (echo > /dev/tcp/127.0.0.1/3000) 2>/dev/null; then
    echo "Starting Node.js..."

    setsid node server/index.mjs \
      > .logs/server.log 2>&1 < /dev/null &
  else
    echo "Node.js is already running."
  fi
else
  echo "Backend not found. Skipping."
fi

echo "Tavern.exe startup commands completed."
