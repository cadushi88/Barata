#!/bin/sh
# Restart contract: leave the preview server running on 0.0.0.0:8080.
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace
npm run dev > /tmp/barata-dev.log 2>&1 &
# Wait until the port answers so revive is not racing the proxy.
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  sleep 1
done
exit 0
