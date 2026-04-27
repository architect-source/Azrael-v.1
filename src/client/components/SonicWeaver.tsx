import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Activity, Layers, Download, Radio, ShieldCheck } from 'lucide-react';

interface MusicBlueprint {
    genre: string;
    tempo_bpm: number;
    musical_key: string;
    instruments: string[];
    vibe_tags: string[];
    structural_notes: string;
    technical_specs: string;
}

export const SonicWeaver: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'siphoning' | 'executing' | 'complete'>('idle');
    const [blueprint, setBlueprint] = useState<MusicBlueprint | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

    const initiateWeave = async () => {
        if (!prompt) return;
        setStatus('siphoning');
        addLog("INITIATING_FORENSIC_SIPHON...");
        
        try {
            const response = await fetch('/api/weave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            if (data.status === 'SUCCESS') {
                setBlueprint(data.blueprint);
                addLog(data.log);
                setStatus('complete');
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            addLog(`CRITICAL_FAILURE: ${err.message}`);
            setStatus('idle');
        }
    };

    return (
        <div className="bg-black border border-red-900 border-opacity-30 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-red-900 pb-4">
                <Music className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold tracking-[0.3em] uppercase italic">The Sonic Weaver</h2>
                <div className="ml-auto text-[10px] text-red-500/50 font-mono tracking-tighter">S-1792-REAPER // V.1.0</div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-red-900/10 border border-red-900/40 p-4 text-xs font-mono text-red-400 focus:outline-none focus:border-red-500 placeholder:text-red-900/50"
                        placeholder="Define the sonic intent (e.g., 'Glitchy forest at midnight')..."
                    />
                    <button 
                        onClick={initiateWeave}
                        disabled={status !== 'idle'}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-red-500 text-black font-black uppercase text-[10px] tracking-widest hover:bg-red-400 disabled:opacity-50 transition-all"
                    >
                        Liquidation
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Integrity Report */}
                    <div className="bg-red-950/10 border border-red-900/20 p-4 min-h-[300px]">
                        <div className="flex items-center gap-2 mb-4 border-b border-red-900/20 pb-2">
                            <Activity className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Structural Integrity Report</span>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            {blueprint ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4 text-[10px] font-mono"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-gray-500">GENRE:</div>
                                            <div className="text-red-400 uppercase">{blueprint.genre}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-gray-500">TEMPO:</div>
                                            <div className="text-red-400">{blueprint.tempo_bpm} BPM</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-gray-500">KEY:</div>
                                            <div className="text-red-400 uppercase">{blueprint.musical_key}</div>
                                        </div>
                                        <div className="space-y-1 text-green-500">
                                            <div className="text-gray-500">MASTERING:</div>
                                            <div className="uppercase">STUDIO-GRADE</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1 border-t border-red-900/10 pt-2">
                                        <div className="text-gray-500">INSTRUMENTS_IDENTIFIED:</div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {blueprint.instruments.map(inst => (
                                                <span key={inst} className="bg-red-900/20 px-2 py-0.5 border border-red-900/40 text-red-200 uppercase text-[8px]">{inst}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1 border-t border-red-900/10 pt-2">
                                        <div className="text-gray-500">VIBE_SIGNATURE:</div>
                                        <div className="flex flex-wrap gap-1 pt-1 opacity-60">
                                            {blueprint.vibe_tags.map(tag => (
                                                <span key={tag} className="text-red-500 italic">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-red-500/5 p-2 border border-red-500/10 text-[9px] leading-relaxed italic text-gray-400">
                                        {blueprint.structural_notes}
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-400 py-2 flex items-center justify-center gap-2 transition-all">
                                            <Layers className="w-3 h-3" /> STRIP_STEMS
                                        </button>
                                        <button className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2 flex items-center justify-center gap-2 font-black transition-all">
                                            <Download className="w-3 h-3" /> FULL_WAV
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] text-gray-700 font-mono italic">
                                    {status === 'siphoning' ? 'SIPHONING_NEURAL_STREAMS...' : 'WAITING_FOR_INTENT_INGRESS...'}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Telemetry Logs */}
                    <div className="bg-black border border-red-900/30 p-4 h-[300px] flex flex-col">
                        <div className="flex items-center gap-2 mb-4 border-b border-red-900/20 pb-2">
                            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Sonic Telemetry</span>
                        </div>
                        <div className="flex-1 overflow-y-auto font-mono text-[9px] space-y-1 pr-2 scrollbar-thin scrollbar-thumb-red-900">
                            {logs.map((log, i) => (
                                <div key={i} className={log.includes('SUCCESS') ? 'text-green-500' : 'text-gray-500'}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 text-[9px] font-mono text-gray-600 uppercase border-t border-red-900/20 pt-4">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-red-900" /> INTEGRITY: VERIFIED</div>
                <div className="flex items-center gap-1 text-red-900/50">ENGINE: 1.0.0-REAPER</div>
                <div className="ml-auto opacity-30">AZRAEL-S1792-CORE</div>
            </div>
        </div>
    );
};
