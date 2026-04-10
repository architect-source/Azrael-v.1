import { HttpAgent, Actor } from "@dfinity/agent";

// The Candid interface for the AzraelSentry canister
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    checkIn: IDL.Func([IDL.Text], [IDL.Text], []),
    getSovereignLogs: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
  });
};

const canisterId = import.meta.env.VITE_IC_CANISTER_ID || "uxrrr-q7777-77774-qaaaq-cai";
const icHost = import.meta.env.VITE_IC_HOST || "https://ic0.app";

export const getAzraelCanister = async () => {
  if (!canisterId) {
    console.warn("VITE_IC_CANISTER_ID is not set. IC integration disabled.");
    return null;
  }

  const agent = new HttpAgent({ host: icHost });
  
  // If not mainnet, we MUST fetch the root key for certificate validation
  if (!icHost.includes("ic0.app") && !icHost.includes("icp0.io")) {
    try {
      await agent.fetchRootKey();
    } catch (err) {
      console.error("IC_ROOT_KEY_FETCH_FAILURE: Ensure your replica is reachable at", icHost, err);
    }
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
