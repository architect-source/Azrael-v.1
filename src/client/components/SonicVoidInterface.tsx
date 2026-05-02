import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Activity, Terminal, Disc, Volume2, ShieldAlert, Zap, Cpu, Waves, Download, Info } from 'lucide-react';

interface RenderJob {
    id: string;
    prompt: string;
    status: 'SYNTHESIZING' | 'COMPLETE' | 'FAILED';
    timestamp: string;
}

export const SonicVoidInterface: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<RenderJob[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    
    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));

    const constructAudio = async () => {
        if (!prompt) return;
        setLoading(true);
        addLog(`INITIATING_SONIC_MANIFESTATION: ${prompt.substring(0, 20)}...`);
        addLog("CONDITIONING_CLAP_LAYERS...");
        
        try {
            // TARGET_ENDPOINT: S1792-VOID-SYNTH
            const response = await fetch('/api/sonic-generate', {
                method: 'POST',
                body: JSON.stringify({ 
                    prompt,
                    architecture: "AudioLDM-2_LARGE",
                    fidelity: "48kHz_24bit",
                    engine: "S1792-SONIC-VOID"
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error("NEURAL_CORE_OOM_FAILURE");
            
            const data = await response.json();
            
            const newJob: RenderJob = {
                id: data.job_id || Math.random().toString(36).substr(2, 9),
                prompt,
                status: 'COMPLETE',
                timestamp: new Date().toISOString()
            };

            setJobs(prev => [newJob, ...prev]);
            addLog(`SUCCESS: AUDIO_ARCHIVING_COMPLETE [ID: ${newJob.id}]`);
        } catch (err: any) {
            addLog(`CRITICAL_FAILURE: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#050505] border border-[#2D2D2D] p-10 font-mono space-y-10 min-h-[700px] relative overflow-hidden transition-all duration-700">
            {/* Background Neural Net Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
                <div className="absolute top-0 left-0 w-full h-full animate-siphon bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.2)_0%,transparent_70%)]" />
                <div className="grid grid-cols-20 grid-rows-20 w-full h-full border border-[#2D2D2D]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between border-b border-[#2D2D2D] pb-8 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#8B0000] p-1 shadow-[0_0_15px_rgba(139,0,0,0.4)]">
                            <Disc className={`w-6 h-6 text-black ${loading ? 'animate-spin' : ''}`} />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Sonic-Void Interface</h1>
                    </div>
                    <div className="text-[10px] text-[#8B0000] uppercase tracking-[0.5em] font-bold">
                        S-1792 // NEURAL_LATENT_DIFFUSION_CORE
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase">
                            <div className="text-[#2D2D2D]">VRAM_STATUS</div>
                            <div className="text-white font-bold">16GB_OPTIMIZED</div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Waves className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase">
                            <div className="text-[#2D2D2D]">Audio_Engine</div>
                            <div className="text-white font-bold">AUDIOLDM-2</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Input & Interaction */}
                <div className="lg:col-span-5 space-y-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-[#8B0000] font-black uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> Input_Sonic_Parameters
                            </label>
                            <div className="px-2 py-0.5 bg-[#8B0000]/10 border border-[#8B0000]/30 text-[8px] text-[#8B0000]">DIRECTIVE: ABSOLUTE_ZERO</div>
                        </div>
                        <div className="relative group">
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="DEFINE_SONIC_INTENT (e.g. 'Sub-zero wind, dissonant riffs, industrial brutalism')..."
                                className="w-full h-48 bg-black border border-[#2D2D2D] text-white p-5 text-sm focus:border-[#8B0000] outline-none transition-all placeholder:text-[#1a1a1a] resize-none"
                            />
                            <div className="absolute bottom-4 right-4 h-1 w-20 bg-[#2D2D2D]/20 overflow-hidden">
                                <motion.div 
                                    className="h-full bg-[#8B0000]" 
                                    animate={{ width: `${Math.min(prompt.length / 2, 100)}%` }}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={constructAudio}
                            disabled={loading || !prompt}
                            className={`w-full group relative overflow-hidden bg-white text-black font-black uppercase tracking-[0.4em] py-5 text-xs transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-30 disabled:grayscale`}
                        >
                            <div className="absolute inset-0 bg-[#8B0000] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300" />
                            <span className="relative z-10 group-hover:text-white transition-colors">{loading ? "SYNTHESIZING_VOID..." : "Execute_Manifestation"}</span>
                            <Zap className={`w-4 h-4 relative z-10 ${loading ? 'animate-bounce' : 'group-hover:scale-125 transition-transform'}`} />
                        </button>
                    </div>

                    {/* Forensic Logs */}
                    <div className="bg-[#0A0A0A] border border-[#2D2D2D] p-5 shadow-[5px_5px_0_rgba(139,0,0,0.05)]">
                        <div className="text-[10px] text-[#2D2D2D] font-bold uppercase mb-4 flex items-center gap-2 border-b border-[#2D2D2D] pb-2">
                            <Activity className="w-3 h-3 text-[#8B0000]" /> S-1792_Logic_Stream
                        </div>
                        <div className="space-y-2 h-[200px] overflow-y-auto custom-scrollbar pr-2">
                            {logs.length === 0 && <div className="text-[#1A1A1A] italic text-[10px]">AWAITING_SONIC_PARAMATERS...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className={`text-[9px] flex gap-2 ${log.includes('SUCCESS') ? 'text-green-500' : log.includes('FAILURE') ? 'text-[#8B0000]' : 'text-[#2D2D2D]'}`}>
                                    <span className="opacity-40">[{i}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Output & History */}
                <div className="lg:col-span-7 space-y-8 relative z-10">
                    <div className="bg-[#111] border border-[#2D2D2D] p-6 min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between gap-2 mb-6 border-b border-[#2D2D2D] pb-4">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-[#8B0000]" />
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">Neural_Artifact_Repository</span>
                            </div>
                            <span className="text-[9px] text-[#2D2D2D] uppercase font-bold">Latency: 0.14ms</span>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-4 custom-scrollbar">
                            <AnimatePresence>
                                {jobs.length === 0 ? (
                                    <div className="h-40 border border-dashed border-[#2D2D2D] flex flex-col items-center justify-center text-[#2D2D2D] opacity-20">
                                        <Info className="w-8 h-8 mb-2" />
                                        <div className="text-[10px] uppercase font-black">Archive_Empty</div>
                                    </div>
                                ) : (
                                    jobs.map((job) => (
                                        <motion.div 
                                            key={job.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-black border-l-2 border-[#8B0000] border-y border-r border-[#2D2D2D] p-5 space-y-3 group hover:border-[#8B0000]/50 transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-white font-bold uppercase truncate max-w-[300px]">{job.prompt}</div>
                                                    <div className="text-[8px] text-[#2D2D2D] uppercase">{job.timestamp} // ID: {job.id}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 bg-[#2D2D2D]/10 hover:bg-[#8B0000] text-[#8B0000] hover:text-white transition-all border border-[#2D2D2D]">
                                                        <Volume2 className="w-3 h-3" />
                                                    </button>
                                                    <button className="p-2 bg-[#2D2D2D]/10 hover:bg-[#8B0000] text-[#8B0000] hover:text-white transition-all border border-[#2D2D2D]">
                                                        <Download className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Fake Waveform */}
                                            <div className="h-10 flex items-center gap-1">
                                                {Array(40).fill(0).map((_, i) => (
                                                    <motion.div 
                                                        key={i}
                                                        animate={{ height: `${Math.random() * 100}%` }}
                                                        transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                                                        className="w-1 bg-[#2D2D2D] opacity-30 group-hover:bg-[#8B0000] group-hover:opacity-100 transition-all"
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 bg-black/50 border border-[#2D2D2D] p-4 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-[#8B0000]" />
                                <span className="text-[9px] text-gray-500 uppercase italic">SHA-256 Shadow Ledger Active</span>
                             </div>
                             <div className="text-[8px] text-[#2D2D2D] font-mono tracking-tighter">LIQUIDATION_INDEX: 7729-AZ</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Corner Metadata */}
            <div className="absolute bottom-4 right-4 text-[6px] text-zinc-900 pointer-events-none select-none uppercase tracking-[0.5em] font-black">
                Target_Server: https://core.s1792-sentry.vtx.internal/v1/blueprint/execute
            </div>
        </div>
    );
};
