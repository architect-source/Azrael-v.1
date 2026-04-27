import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, ShieldCheck, RefreshCw, Key, Lock, AlertTriangle, Cpu } from 'lucide-react';

export const GatewaySentry: React.FC = () => {
    const [conduit, setConduit] = useState<string | null>(null);
    const [rotationIn, setRotationIn] = useState<string>('');
    const [status, setStatus] = useState<'IDLE' | 'HANDSHAKING' | 'SECURED' | 'STALE'>('IDLE');
    const [intel, setIntel] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

    const performHandshake = async () => {
        setStatus('HANDSHAKING');
        addLog("INITIATING_GATEWAY_DISCOVERY...");
        try {
            const res = await fetch('/api/handshake');
            const data = await res.json();
            setConduit(data.conduit);
            setRotationIn(data.rotation_in);
            setStatus('SECURED');
            addLog(`HANDSHAKE_SUCCESS: CONDUIT_${data.conduit.substring(0, 8)}...`);
        } catch (err) {
            addLog("HANDSHAKE_FAILURE: REMOTE_ORCHESTRATOR_UNREACHABLE");
            setStatus('IDLE');
        }
    };

    const fetchSecureIntel = async () => {
        if (!conduit) return;
        addLog(`ATTEMPTING_DATA_RECOVERY: /api/conduit/${conduit.substring(0, 4)}...`);
        try {
            const res = await fetch(`/api/conduit/${conduit}/secure-data`);
            const data = await res.json();
            if (data.status === 'SECURE_ACCESS_GRANTED') {
                setIntel(data.payload);
                addLog("INTEL_RECOVERED: INTEGRITY_CHECK_PASSED");
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            addLog(`ACCESS_DENIED: CONDUIT_COLLAPSED_OR_INVALID`);
            setIntel(null);
            setStatus('STALE');
        }
    };

    useEffect(() => {
        performHandshake();
    }, []);

    return (
        <div className="bg-black border border-red-900/30 p-6 space-y-6 font-mono relative overflow-hidden">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="grid grid-cols-12 h-full w-full">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border border-red-900/20" />
                    ))}
                </div>
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 border-b border-red-900/40 pb-4">
                    <RefreshCw className={`w-6 h-6 text-red-500 ${status === 'HANDSHAKING' ? 'animate-spin' : ''}`} />
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic">Ephemeral Gateway Sentry</h2>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">S-1792 // Dynamic_Surface_Rotation</div>
                    </div>
                    <div className="ml-auto text-right">
                        <div className="text-[9px] text-gray-600 uppercase">Rotation_In:</div>
                        <div className="text-xs text-red-400 font-bold tabular-nums">{rotationIn}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Conduit State */}
                    <div className="bg-red-950/10 border border-red-900/20 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-red-900/10 pb-2">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Active_Conduit_Fingerprint</span>
                            <div className={`px-2 py-0.5 text-[8px] font-black ${status === 'SECURED' ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}`}>
                                {status}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-black/40 border border-red-900/40 p-4 relative group">
                                <Hash className="absolute right-3 top-3 w-4 h-4 text-red-900 opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[9px] text-gray-600 uppercase mb-1">Current_Hash_Address:</div>
                                <div className="text-sm text-red-400 font-black break-all tracking-wider">
                                    {conduit || "********************************"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={performHandshake}
                                    className="bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-400 py-3 text-[10px] uppercase font-black tracking-widest transition-all"
                                >
                                    Force_Rotation
                                </button>
                                <button 
                                    onClick={fetchSecureIntel}
                                    disabled={status !== 'SECURED'}
                                    className="bg-red-500 text-black py-3 text-[10px] uppercase font-black tracking-widest hover:bg-red-400 disabled:opacity-20 transition-all"
                                >
                                    Retrieve_Intel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Forensic Logs & Results */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 bg-black/80 border border-red-900/20 p-4 h-[180px] flex flex-col">
                            <div className="text-[8px] text-red-900 font-bold uppercase mb-2 border-b border-red-900/10 pb-1">Telemetry_Log_Stream</div>
                            <div className="flex-1 overflow-y-auto text-[9px] font-mono space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className={log.includes('SUCCESS') || log.includes('INTEGRITY') ? 'text-green-500' : 'text-gray-500'}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {intel && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-green-950/10 border border-green-900/40 p-4"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="w-3 h-3 text-green-500" />
                                        <span className="text-[10px] text-green-500 font-black uppercase">Decrypted_Asset_Payload</span>
                                    </div>
                                    <div className="text-[10px] text-gray-300 font-mono italic leading-relaxed">
                                        {intel.sensitive_intel} | CLEARANCE: {intel.clearance}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Warnings */}
                <div className="border-t border-red-900/20 pt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 text-red-900">
                        <AlertTriangle className="w-3 h-3" />
                        Static_Path_Detection: DISABLED
                    </div>
                    <div className="flex gap-4">
                        <span className="text-gray-700">AES-256_ACTIVE</span>
                        <span className="text-gray-700">MTLS_PENDING</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                        <Cpu className="w-3 h-3" /> CORE: 1792L
                    </div>
                </div>
            </div>
        </div>
    );
};
