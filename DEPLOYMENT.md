# AZRAEL Deployment Protocols

## 1. ICP Backend Deployment (Mainnet)

To manifest the Azrael Sentry on the Internet Computer mainnet, follow these tactical steps:

### Prerequisites
- Install `dfx` (IC SDK):
  ```bash
  sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  ```

### Identity & Cycles
1. **Create Identity**:
   ```bash
   dfx identity new azrael-deployer
   dfx identity use azrael-deployer
   ```
2. **Acquire Cycles**:
   - DFINITY grants: [dfinity.org/grants](https://dfinity.org/grants)
   - Cycle faucet: [faucet.dfinity.org](https://faucet.dfinity.org) (requires GitHub auth)

### Deployment
1. **Deploy to IC**:
   ```bash
   dfx deploy --network ic azrael_backend
   ```
2. **Capture Canister ID**:
   ```bash
   dfx canister id azrael_backend --network ic
   ```
   *Output will be something like: `bnz7o-iiaaa-aaaag-qc6gq-cai`*

---

## 2. Vercel Frontend Deployment

### Environment Variables
Set the following in your Vercel Project Settings (Environment Variables):

| Key | Value |
|-----|-------|
| `VITE_IC_CANISTER_ID` | *Your captured Canister ID* |
| `VITE_IC_HOST` | `https://ic0.app` |
| `VITE_II_URL` | `https://identity.ic0.app` |
| `VITE_PROXY_URL` | `https://your-proxy-server.com` (Optional) |
| `GEMINI_API_KEY` | *Your Google AI Studio API Key* |

### Deployment Command
```bash
vercel --prod
```

---

## 3. Tactical Fallbacks
- If `VITE_PROXY_URL` is unavailable, the Sentry will attempt to use the local `/api/proxy` serverless function.
- If the Canister is unreachable, the Sentry will enter **Mock Awakening** mode to maintain interface integrity.
