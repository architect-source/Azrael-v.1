// src/server/safety.ts
export type DriftState = 'active' | 'degraded' | 'survival';

export interface ChatContext {
  userPrincipal: string;
  sessionId: string;
  state: DriftState;
  lastHeartbeat: bigint;
}

// Constraint violation → null action (don't crash, don't lie)
export function validateConstraints(ctx: ChatContext): boolean {
  const now = Date.now();
  const drift = now - Number(ctx.lastHeartbeat);
  
  if (drift > 30000) { // 30s timeout
    ctx.state = 'survival';
    return false; // Triggers null/safe action
  }
  return true;
}

export function nullAction(sessionId: string) {
  return {
    response: "AZRAEL_PROTOCOL: Session drift detected. Re-sync required.",
    sessionId,
    state: 'survival'
  };
}
