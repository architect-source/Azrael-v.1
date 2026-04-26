import React, { useState } from "react";
import { AzraelCore } from "./client/components/AzraelCore";
import { VoidOneSentry } from "./client/components/VoidOneSentry";
import { OmegaEScion } from "./client/components/OmegaEScion";

export default function AzraelInterface() {
  const [view, setView] = useState<'core' | 'void' | 'omega'>('omega');
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 flex flex-col">
      <div className="flex gap-4 justify-center mb-4 border-b border-gray-900 pb-2">
        <button onClick={() => setView('core')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'core' ? 'text-[#00d4aa] border-b border-[#00d4aa]' : 'text-gray-600 hover:text-gray-400'}`}>Azrael Core</button>
        <button onClick={() => setView('void')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'void' ? 'text-green-500 border-b border-green-500' : 'text-gray-600 hover:text-gray-400'}`}>VOID-1 Sentry</button>
        <button onClick={() => setView('omega')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'omega' ? 'text-red-500 border-b border-red-500' : 'text-gray-600 hover:text-gray-400'}`}>OMEGA-E Scion</button>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto">
        {view === 'core' && <AzraelCore />}
        {view === 'void' && <VoidOneSentry />}
        {view === 'omega' && <OmegaEScion />}
      </div>
    </div>
  );
}
