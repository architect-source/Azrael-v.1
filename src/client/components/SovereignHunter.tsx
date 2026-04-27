import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Search, AlertCircle, ExternalLink, ShieldCheck, Clock, Hash, Zap } from 'lucide-react';

interface TargetItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    hash: string;
    isNew: boolean;
}

export const SovereignHunter: React.FC = () => {
    const [targets, setTargets] = useState<TargetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

    const performHunt = async () => {
        setLoading(true);
        addLog("INITIATING_FORENSIC_SCAN...");
        try {
            const res = await fetch('/api/hunt');
            const data = await res.json();
            
            if (data.status === 'SCAN_COMPLETE') {
                setTargets(data.targets);
                setLastScan(new Date().toLocaleTimeString());
                addLog(`SCAN_COMPLETE: ${data.new_targets_count} NEW_TARGETS_IDENTIFIED`);
            } else {
                throw new Error("MALFORMED_RESPONSE");
            }
        } catch (err: any) {
            addLog(`SCAN_FAILURE: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        performHunt();
        const interval = setInterval(performHunt, 60000); // Check every 60s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black border border-red-900/30 p-6 space-y-6 font-mono selection:bg-red-500 selection:text-black">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 border-b border-red-900/40 pb-6">
                <div className="flex items-center gap-3">
                    <Target className={`w-8 h-8 text-red-500 ${loading ? 'animate-spin' : ''}`} />
                    <div>
                        <h2 className="text-xl font-black tracking-tighter uppercase italic text-red-500">Sovereign Hunter</h2>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">MOD-SH1 // Sudden_Capital_Acquisition</div>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[9px] text-gray-600 uppercase">Last_Scan</div>
                        <div className="text-xs text-white font-bold">{lastScan || "--:--:--"}</div>
                    </div>
                    <button 
                        onClick={performHunt}
                        disabled={loading}
                        className="bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 px-6 py-2 text-[10px] uppercase font-black tracking-widest transition-all disabled:opacity-20"
                    >
                        {loading ? 'Scanning...' : 'Manual_Scan'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel: Telemetry & Config */}
                <div className="space-y-6">
                    <div className="bg-red-950/10 border border-red-900/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 border-b border-red-900/10 pb-2">
                            <Zap className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500 uppercase">Perimeter_Config</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-[8px] text-gray-600 uppercase mb-1">Target_Vector:</div>
                                <div className="text-[10px] text-red-400 break-all font-bold">UPWORK_RSS_V1</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-gray-600 uppercase mb-1">Status:</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active_Standby</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/50 border border-red-900/10 p-4">
                        <div className="text-[8px] text-red-900 font-bold uppercase mb-2 border-b border-red-900/10 pb-1">Activity_Feed</div>
                        <div className="text-[9px] font-mono space-y-1 max-h-[200px] overflow-y-auto">
                            {logs.map((log, i) => (
                                <div key={i} className={log.includes('SUCCESS') ? 'text-green-500' : 'text-gray-500'}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Target List */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-red-500">Identified_Targets ({targets.length})</span>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {targets.length === 0 && !loading && (
                                <div className="text-center py-12 border border-dashed border-red-900/20">
                                    <AlertCircle className="w-8 h-8 text-red-900/40 mx-auto mb-2" />
                                    <div className="text-[10px] text-gray-600 uppercase">No active incursions detected.</div>
                                </div>
                            )}

                            {targets.map((target) => (
                                <motion.div
                                    key={target.hash}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative group bg-[#0d0d0f] border ${target.isNew ? 'border-red-500/50 hover:border-red-500' : 'border-red-900/20 hover:border-red-900/40'} p-4 transition-all overflow-hidden`}
                                >
                                    {target.isNew && (
                                        <div className="absolute top-0 right-0 bg-red-500 text-black text-[8px] font-black px-2 py-0.5 uppercase z-10">
                                            New_Target
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                                                {target.title}
                                            </h3>
                                            <a 
                                                href={target.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-red-500 hover:text-white transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>

                                        <div className="text-[10px] text-gray-400 font-mono line-clamp-2 leading-relaxed italic" 
                                            dangerouslySetInnerHTML={{ __html: target.description }} 
                                        />

                                        <div className="flex items-center gap-6 pt-2 border-t border-red-900/10">
                                            <div className="flex items-center gap-2 text-[9px] text-gray-600">
                                                <Clock className="w-3 h-3" />
                                                {new Date(target.pubDate).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] text-gray-600">
                                                <Hash className="w-3 h-3" />
                                                {target.hash.substring(0, 12)}...
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Forensic Scanner Animation Item */}
                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-red-500/10 group-hover:bg-red-500/50 overflow-hidden">
                                        <motion.div 
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-1/3 h-full bg-red-500"
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-red-900/20 pt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2 text-red-900">
                    <ShieldCheck className="w-3 h-3" />
                    State_Persistence: ACTIVE [MEMORY_HASH_SET]
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                    <span>FORENSIC_PRIORITY: HIGH</span>
                    <span>1947_VECTOR_THROTTLING: BYPASSED</span>
                </div>
            </div>
        </div>
    );
};
