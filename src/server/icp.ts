// src/server/icp.ts
import { DriftState } from "./safety";

// Mock Canister State for fallback
const MOCK_SESSIONS = new Map<string, any>();

class ICPAgent {
  async getActor() {
    return null;
  }

  async getSession(sessionId: string) {
    const mock = MOCK_SESSIONS.get(sessionId);
    if (mock) return mock;

    return {
      id: sessionId,
      owner: "anonymous",
      state: 'active' as DriftState,
      lastHeartbeat: BigInt(Date.now()),
      message_count: 0n,
      checksum: 0n
    };
  }

  async processMessage(sessionId: string, payload: any, identityProof?: any) {
    // Mock processing
    return {
      session_id: sessionId,
      content: "", // Trigger proxy/local AI
      state: { Degraded: null },
      timestamp: BigInt(Date.now()),
      signature: new Uint8Array(32),
      requires_proxy: true,
      msg_id: BigInt(Date.now())
    };
  }

  async createSession() {
    const sessionId = `mock_${Math.random().toString(36).substring(7)}`;
    const session = {
      id: sessionId,
      owner: "anonymous",
      state: { Active: null },
      last_heartbeat: BigInt(Date.now()),
      message_count: 0n,
      checksum: 0n
    };
    MOCK_SESSIONS.set(sessionId, session);
    return session;
  }
}

export const icpAgent = new ICPAgent();
