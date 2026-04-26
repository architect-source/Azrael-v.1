#!/bin/bash
# fix-vercel.sh

echo "=== AZRAEL Vercel Diagnostic ==="

# Check Node version
node --version  # Should be 18+

# Check files exist
[ -f "index.html" ] && echo "✓ index.html" || echo "✗ Missing index.html"
[ -f "vite.config.ts" ] && echo "✓ vite.config.ts" || echo "✗ Missing vite.config.ts"
[ -f "vercel.json" ] && echo "✓ vercel.json" || echo "✗ Missing vercel.json"
[ -d "src" ] && echo "✓ src/" || echo "✗ Missing src/"

# Check build works locally
npm install
npm run build 2>&1 | tee build.log

# Check dist folder
if [ -d "dist" ]; then
  echo "✓ dist/ exists ($(ls dist/ | wc -l) files)"
  [ -f "dist/index.html" ] && echo "✓ dist/index.html" || echo "✗ Missing dist/index.html"
else
  echo "✗ dist/ missing - build failed"
  cat build.log | tail -20
  exit 1
fi

echo "=== Local test ==="
# Note: serve might not be installed, using npx
npx -y serve dist/ &
SERVE_PID=$!
sleep 5
curl -s http://localhost:3000 | head -5
kill $SERVE_PID

echo "=== Ready for Vercel ==="
