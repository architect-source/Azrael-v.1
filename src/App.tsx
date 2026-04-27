import React, { useState } from "react";
import { AzraelCore } from "./client/components/AzraelCore";
import { VoidOneSentry } from "./client/components/VoidOneSentry";
import { OmegaEScion } from "./client/components/OmegaEScion";
import { VoidMetalStudio } from "./client/components/VoidMetalStudio";
import { SonicWeaver } from "./client/components/SonicWeaver";
import { NodeOrchestrator } from "./client/components/NodeOrchestrator";
import { GatewaySentry } from "./client/components/GatewaySentry";
import { SovereignHunter } from "./client/components/SovereignHunter";

export default function AzraelInterface() {
  const [view, setView] = useState<'core' | 'void' | 'omega' | 'studio' | 'weaver' | 'nodes' | 'gateway' | 'hunter'>('studio');
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] p-4 flex flex-col">
      <div className="flex gap-4 justify-center mb-4 border-b border-gray-900 pb-2 overflow-x-auto">
        <button onClick={() => setView('core')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'core' ? 'text-[#00d4aa] border-b border-[#00d4aa]' : 'text-gray-600 hover:text-gray-400'}`}>Azrael Core</button>
        <button onClick={() => setView('void')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'void' ? 'text-green-500 border-b border-green-500' : 'text-gray-600 hover:text-gray-400'}`}>VOID-1 Sentry</button>
        <button onClick={() => setView('omega')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'omega' ? 'text-red-500 border-b border-red-500' : 'text-gray-600 hover:text-gray-400'}`}>OMEGA-E Scion</button>
        <button onClick={() => setView('studio')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'studio' ? 'text-red-900 border-b border-red-900' : 'text-gray-600 hover:text-gray-400'}`}>Void Metal Studio</button>
        <button onClick={() => setView('weaver')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'weaver' ? 'text-purple-500 border-b border-purple-500' : 'text-gray-600 hover:text-gray-400'}`}>Sonic Weaver</button>
        <button onClick={() => setView('nodes')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'nodes' ? 'text-red-500 border-b border-red-500' : 'text-gray-600 hover:text-gray-400'}`}>Node Orchestrator</button>
        <button onClick={() => setView('gateway')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'gateway' ? 'text-orange-500 border-b border-orange-500' : 'text-gray-600 hover:text-gray-400'}`}>Gateway Sentry</button>
        <button onClick={() => setView('hunter')} className={`text-[10px] uppercase tracking-widest px-3 py-1 transition-colors ${view === 'hunter' ? 'text-red-500 border-b border-red-500' : 'text-gray-600 hover:text-gray-400'}`}>Sovereign Hunter</button>
      </div>
      <div className="flex-1 w-full max-w-7xl mx-auto">
        {view === 'core' && <AzraelCore />}
        {view === 'void' && <VoidOneSentry />}
        {view === 'omega' && <OmegaEScion />}
        {view === 'studio' && <VoidMetalStudio />}
        {view === 'weaver' && <SonicWeaver />}
        {view === 'nodes' && <NodeOrchestrator />}
        {view === 'gateway' && <GatewaySentry />}
        {view === 'hunter' && <SovereignHunter />}
      </div>
    </div>
  );
}
