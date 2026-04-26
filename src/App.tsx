import React, { useState } from "react";
import { AzraelCore } from "./client/components/AzraelCore";
import { VoidOneSentry } from "./client/components/VoidOneSentry";

export default function AzraelInterface() {
  const [view, setView] = useState<'core' | 'void'>('core');
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4">
      <div className="flex gap-4 justify-center mb-4">
        <button onClick={() => setView('core')} className={`text-[10px] uppercase tracking-widest px-3 py-1 ${view === 'core' ? 'text-[#00d4aa] border-b border-[#00d4aa]' : 'text-gray-500'}`}>Azrael Core</button>
        <button onClick={() => setView('void')} className={`text-[10px] uppercase tracking-widest px-3 py-1 ${view === 'void' ? 'text-green-500 border-b border-green-500' : 'text-gray-500'}`}>VOID-1 Sentry</button>
      </div>
      {view === 'core' ? <AzraelCore /> : <VoidOneSentry />}
    </div>
  );
}
