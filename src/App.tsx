import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AzraelCore } from "./client/components/AzraelCore";
import { VoidOneSentry } from "./client/components/VoidOneSentry";
import { OmegaEScion } from "./client/components/OmegaEScion";
import { VoidMetalStudio } from "./client/components/VoidMetalStudio";
import { SonicWeaver } from "./client/components/SonicWeaver";
import { NodeOrchestrator } from "./client/components/NodeOrchestrator";
import { GatewaySentry } from "./client/components/GatewaySentry";
import { SovereignHunter } from "./client/components/SovereignHunter";
import { SovereignSynthesis } from "./client/components/SovereignSynthesis";
import { OmegaDriveVault } from "./client/components/OmegaDriveVault";

import { SonicVoidInterface } from "./client/components/SonicVoidInterface";
import { SovereignVideoAsset } from "./client/components/SovereignVideoAsset";
import { Menu, X, ChevronRight, Binary, Shield, Zap, Terminal, Database, Activity, Lock, Disc, Search, Radio, Film } from 'lucide-react';

export default function AzraelInterface() {
  const [view, setView] = useState<'core' | 'void' | 'omega' | 'studio' | 'weaver' | 'sonic-void' | 'temporal-video' | 'nodes' | 'gateway' | 'hunter' | 'synthesis' | 'vault'>('core');
  const [isArchitectMode, setIsArchitectMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSecretTrigger = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount === 5) {
      setIsArchitectMode(!isArchitectMode);
      setClickCount(0);
      setMenuOpen(true);
    }
  };

  const navItems = [
    { id: 'core', label: 'Azrael Core', icon: <Binary className="w-4 h-4" />, color: 'text-[#00d4aa]' },
    { id: 'void', label: 'VOID-1 Sentry', icon: <Shield className="w-4 h-4" />, color: 'text-green-500' },
    { id: 'omega', label: 'OMEGA-E Scion', icon: <Zap className="w-4 h-4" />, color: 'text-red-500' },
    { id: 'studio', label: 'Void Metal Studio', icon: <Terminal className="w-4 h-4" />, color: 'text-red-900' },
    { id: 'weaver', label: 'Sonic Weaver', icon: <Disc className="w-4 h-4" />, color: 'text-purple-500' },
    { id: 'sonic-void', label: 'Sonic-Void Interface', icon: <Radio className="w-4 h-4" />, color: 'text-[#8B0000]' },
    { id: 'temporal-video', label: 'Temporal Asset Core', icon: <Film className="w-4 h-4" />, color: 'text-red-600' },
  ];

  const adminItems = [
    { id: 'nodes', label: 'Node Orchestrator', icon: <Database className="w-4 h-4" />, color: 'text-red-500' },
    { id: 'gateway', label: 'Gateway Sentry', icon: <Activity className="w-4 h-4" />, color: 'text-orange-500' },
    { id: 'hunter', label: 'Sovereign Hunter', icon: <Search className="w-4 h-4" />, color: 'text-red-500' },
    { id: 'synthesis', label: 'Sovereign Synthesis', icon: <Zap className="w-4 h-4" />, color: 'text-red-500' },
    { id: 'vault', label: 'Omega Drive Vault', icon: <Lock className="w-4 h-4" />, color: 'text-red-500' },
  ];
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-300 font-mono relative overflow-hidden flex">
      {/* Sidebar Navigation */}
      <motion.nav 
        initial={false}
        animate={{ width: menuOpen ? 280 : 0, opacity: menuOpen ? 1 : 0 }}
        className="bg-black border-r border-[#2D2D2D] z-50 overflow-hidden relative flex flex-col"
      >
        <div className="p-6 border-b border-[#2D2D2D] flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-red-900">S-1792_Menu</span>
          <button onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 mb-4 text-[8px] text-gray-700 font-bold uppercase tracking-widest">Main_Modules</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id as any); setMenuOpen(false); }}
              className={`w-full flex items-center gap-4 px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${view === item.id ? 'bg-white/5 border-l-2 border-[#8B0000] text-white' : 'text-gray-600 hover:text-gray-400 hover:bg-white/2'}`}
            >
              <span className={view === item.id ? item.color : 'text-gray-700'}>{item.icon}</span>
              {item.label}
              {view === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
            </button>
          ))}

          {isArchitectMode && (
            <div className="mt-8">
              <div className="px-6 mb-4 text-[8px] text-red-950 font-bold uppercase tracking-widest">Architect_Access</div>
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id as any); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${view === item.id ? 'bg-red-900/10 border-l-2 border-red-500 text-white' : 'text-red-950 hover:text-red-500 hover:bg-red-900/5'}`}
                >
                  <span className={view === item.id ? item.color : 'text-red-950'}>{item.icon}</span>
                  [{item.label}]
                  {view === item.id && <ChevronRight className="w-3 h-3 ml-auto opacity-40" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#2D2D2D] text-[8px] text-gray-800 uppercase italic">
          Azrael Neural Enclave // v1.7.92
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Toggle Button (Hidden when menu is open on desktop, but let's keep it visible/fixed) */}
        {!menuOpen && (
          <button 
            onClick={() => setMenuOpen(true)}
            className="fixed top-6 left-6 z-[60] bg-black border border-[#2D2D2D] p-3 text-red-900 hover:text-red-500 hover:border-red-900 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] group"
          >
            <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}

        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {view === 'core' && <AzraelCore />}
              {view === 'void' && <VoidOneSentry />}
              {view === 'omega' && <OmegaEScion />}
              {view === 'studio' && <VoidMetalStudio />}
              {view === 'weaver' && <SonicWeaver />}
              {view === 'sonic-void' && <SonicVoidInterface />}
              {view === 'temporal-video' && <SovereignVideoAsset />}
              {view === 'nodes' && <NodeOrchestrator />}
              {view === 'gateway' && <GatewaySentry />}
              {view === 'hunter' && <SovereignHunter />}
              {view === 'synthesis' && <SovereignSynthesis />}
              {view === 'vault' && <OmegaDriveVault />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hidden Shadow Enclave */}
        <div className="hidden pointer-events-none opacity-0 h-0 w-0 overflow-hidden">
          {view !== 'nodes' && <NodeOrchestrator />}
          {view !== 'gateway' && <GatewaySentry />}
          {view !== 'hunter' && <SovereignHunter />}
          {view !== 'synthesis' && <SovereignSynthesis />}
          {view !== 'vault' && <OmegaDriveVault />}
        </div>

        {/* Architect's Anchor */}
        <div 
          onClick={handleSecretTrigger} 
          className="fixed bottom-0 right-0 p-1 opacity-5 cursor-default select-none text-[6px] text-gray-900 group hover:opacity-10 z-[100]"
        >
          S-1792_SOVEREIGN_ENCLAVE_{isArchitectMode ? 'OPEN' : 'SECURED'}
        </div>
      </div>
    </div>
  );
}

