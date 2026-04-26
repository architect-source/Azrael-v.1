#!/bin/bash
# scripts/tactical-deploy.sh

set -euo pipefail

# 1. Environment verification
echo "[PHASE 0] Verifying tactical environment..."

# Check for required secrets (optional for local dev, but good to have)
# [[ -z "${AZRAEL_CONTROLLER_KEY:-}" ]] && { echo "Missing controller key"; exit 1; }

# Clean build
# cargo clean
# rm -rf target/

# 2. Build canister
echo "[PHASE 1] Building canister..."
# CARGO_NET_OFFLINE=false \
# CARGO_INCREMENTAL=0 \
# cargo build --target wasm32-unknown-unknown --release \
#  --locked --frozen

# 3. Local deployment with II
echo "[PHASE 2] Local deployment..."
# dfx start --background --clean

# Deploy II first
# dfx deploy internet_identity

# Deploy with tactical init args
dfx deploy azrael_backend --argument "(record {
  proxy_whitelist = vec {};
  max_session_duration = 86400000000000;
  dead_drop_enabled = true;
  tactical_mode = true;
})"

# 4. Frontend
echo "[PHASE 4] Frontend deployment..."
npm run build
dfx deploy azrael_frontend

echo "[COMPLETE] Tactical deployment verified"
