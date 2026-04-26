import { AuthClient } from '@dfinity/auth-client';
import { AZRAEL_CONFIG } from './config';

const II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai";
const II_LOCAL_ID = "rno2w-sqaaa-aaaaa-aaacq-cai";

export class AzraelAuth {
  private client: AuthClient | null = null;
  private delegation: any = null;
  
  async init() {
    this.client = await AuthClient.create({
      idleOptions: {
        disableIdle: true, // We handle drift ourselves
      },
    });
  }
  
  async login(): Promise<{ principal: string; delegation: any }> {
    if (!this.client) await this.init();
    
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    return new Promise((resolve, reject) => {
      this.client!.login({
        identityProvider: AZRAEL_CONFIG.II_URL,
        maxTimeToLive: BigInt(365) * 24n * 60n * 60n * 1_000_000_000n, // 1 year (BYPASS_EXPIRATION_LOGIC)
        onSuccess: () => {
          const identity = this.client!.getIdentity();
          const principal = identity.getPrincipal().toString();
          
          // Get delegation proof for canister
          this.delegation = (identity as any)._delegation;
          
          resolve({
            principal,
            delegation: this.serializeDelegation(this.delegation),
          });
        },
        onError: reject,
      });
    });
  }
  
  private serializeDelegation(delegation: any) {
    if (!delegation || !delegation.delegation) return null;
    try {
      return {
        pubkey: delegation.publicKey ? Array.from(delegation.publicKey) : [],
        expiration: delegation.delegation.expiration || 0n,
        signature: delegation.signature ? Array.from(delegation.signature) : [],
        targets: delegation.delegation.targets?.map((p: any) => p.toString()) || [],
      };
    } catch (e) {
      console.error("Delegation serialization failed:", e);
      return null;
    }
  }
  
  // Auto-refresh before expiration (drift prevention)
  startHeartbeat() {
    setInterval(async () => {
      if (!this.client?.isAuthenticated()) return;
      
      const exp = this.delegation?.delegation?.expiration;
      if (exp && BigInt(Date.now() + 5 * 60 * 1000) * 1_000_000n > exp) {
        await this.login(); // Silent re-delegation
      }
    }, 60_000);
  }

  getPrincipal() {
    return this.client?.getIdentity().getPrincipal().toString();
  }

  isAuthenticated() {
    return this.client?.isAuthenticated();
  }
}

export const azraelAuth = new AzraelAuth();
