// src/client/config.ts - Defensive version
const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return '';
};

export const AZRAEL_CONFIG = {
  CANISTER_ID: getEnv('VITE_IC_CANISTER_ID') || 'bnz7o-iiaaa-aaaag-qc6gq-cai',
  IC_HOST: getEnv('VITE_IC_HOST') || 'https://ic0.app',
  II_URL: getEnv('VITE_II_URL') || 'https://identity.ic0.app',
  PROXY_URL: getEnv('VITE_PROXY_URL') || '',
};

// Safe initialization
export function initAzrael() {
  if (!AZRAEL_CONFIG.CANISTER_ID || AZRAEL_CONFIG.CANISTER_ID === 'bnz7o-iiaaa-aaaag-qc6gq-cai') {
    console.warn('AZRAEL: No custom canister ID, using mainnet fallback');
    return { mode: 'fallback' };
  }
  return { mode: 'active' };
}

// Check if we're in browser (Vercel) vs Node (local dev)
export const isBrowser = typeof window !== 'undefined';
