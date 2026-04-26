// src/client/agent-vercel.ts
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { AZRAEL_CONFIG } from './config';
import { AZRAEL_IDL } from './ic-agent';

// Vercel-compatible: no Node-specific code
export class AzraelAgentVercel {
  private actor: any;
  private authClient: AuthClient | null = null;
  
  async init() {
    // Browser-only: create agent without Node dependencies
    const agent = new HttpAgent({ 
      host: AZRAEL_CONFIG.IC_HOST 
    });
    
    // For mainnet, remove this. For local testing only:
    if (AZRAEL_CONFIG.IC_HOST.includes('localhost') || AZRAEL_CONFIG.IC_HOST.includes('127.0.0.1')) {
      await agent.fetchRootKey();
    }
    
    this.actor = Actor.createActor(AZRAEL_IDL, {
      agent,
      canisterId: AZRAEL_CONFIG.CANISTER_ID!,
    });
    
    this.authClient = await AuthClient.create({
      idleOptions: { disableIdle: true },
    });
  }
  
  async login(): Promise<{ principal: string; identity: any }> {
    if (!this.authClient) await this.init();
    
    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider: AZRAEL_CONFIG.II_URL,
        maxTimeToLive: BigInt(24) * 60n * 60n * 1_000_000_000n,
        onSuccess: () => {
          const identity = this.authClient!.getIdentity();
          resolve({
            principal: identity.getPrincipal().toString(),
            identity,
          });
        },
        onError: reject,
      });
    });
  }
  
  // Direct canister calls (no Express proxy in browser)
  async whisperDirect(sessionId: string, encrypted: any) {
    if (!this.actor) await this.init();
    return this.actor.whisper(sessionId, encrypted);
  }

  async awaken(delegation?: any) {
    if (!this.actor) await this.init();
    const result = await this.actor.awaken(delegation ? [delegation] : []);
    if ('Ok' in result) return result.Ok;
    throw new Error(Object.keys(result.Err)[0]);
  }

  async sentryVitals(sessionId: string) {
    if (!this.actor) await this.init();
    return this.actor.sentry_vitals(sessionId);
  }
}
