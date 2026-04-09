import { HttpAgent, Actor } from "@dfinity/agent";

// The Candid interface for the AzraelSentry canister
const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    checkIn: IDL.Func([IDL.Text], [IDL.Text], []),
    getSovereignLogs: IDL.Func([], [IDL.Vec(IDL.Text)], ["query"]),
  });
};

const canisterId = import.meta.env.VITE_IC_CANISTER_ID || "";

export const getAzraelCanister = async () => {
  if (!canisterId) {
    console.warn("VITE_IC_CANISTER_ID is not set. IC integration disabled.");
    return null;
  }

  const agent = new HttpAgent({ host: "https://ic0.app" });
  
  // Only needed for local development, but good practice
  if (process.env.NODE_ENV !== "production") {
    await agent.fetchRootKey().catch((err) => {
      console.warn("Unable to fetch root key. Check your local replica.", err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};
