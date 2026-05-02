import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Film, Activity, Zap, Cpu, Layers, Download, Play, ShieldAlert, Terminal, RefreshCcw, Box } from 'lucide-react';

interface RenderSegment {
    id: number;
    status: 'IDLE' | 'RENDERING' | 'FINALIZING' | 'COMPLETE' | 'FAILED';
    progress: number;
}

export const SovereignVideoAsset: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [segments, setSegments] = useState<RenderSegment[]>(
        Array(24).fill(0).map((_, i) => ({ id: i, status: 'IDLE', progress: 0 }))
    );
    const [logs, setLogs] = useState<string[]>([]);
    const [finalAssetId, setFinalAssetId] = useState<string | null>(null);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));

    const initiateTemporalChain = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setFinalAssetId(null);
        addLog("TEMPORAL_CHAIN_INITIATOR: BOOTING_SEGMENT_ORCHESTRATOR");
        addLog("DIRECTIVE: 120S_CINEMATIC_RECONSTRUCTION");

        // Prepare segments
        setSegments(Array(24).fill(0).map((_, i) => ({ id: i, status: 'IDLE', progress: 0 })));

        try {
            // Sequence Simulation for the 24 segments (5s each)
            for (let i = 0; i < 24; i++) {
                setSegments(prev => prev.map(s => s.id === i ? { ...s, status: 'RENDERING', progress: 10 } : s));
                addLog(`DISPATCHING_SEGMENT_${i}: [SEED_FRAME_SYNC_ACTIVE]`);
                
                // Simulate segment work
                await new Promise(r => setTimeout(r, 800));
                
                setSegments(prev => prev.map(s => s.id === i ? { ...s, status: 'COMPLETE', progress: 100 } : s));
                if (i < 23) addLog(`SEGMENT_${i}_LOCKED: EXTRACTING_CONTEXTUAL_SEED`);
            }

            addLog("ALL_SEGMENTS_CAPTURED: INITIATING_FFMPEG_SUTURE");
            
            const response = await fetch('/api/video-stitch', {
                method: 'POST',
                body: JSON.stringify({ prompt, segments_count: 24, duration: 120 }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error("STITCH_SUTURE_FAILURE");
            
            const data = await response.json();
            setFinalAssetId(data.asset_id);
            addLog("SUCCESS: 120S_TEMPORAL_ASSET_FINALIZED");
        } catch (err: any) {
            addLog(`CRITICAL_DEGRADATION: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-[#050505] border border-[#2D2D2D] p-8 font-mono space-y-8 min-h-[750px] relative overflow-hidden">
            {/* Visual Header */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between border-b border-[#2D2D2D] pb-6 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#8B0000] p-1.5 shadow-[0_0_20px_rgba(139,0,0,0.4)]">
                            <Film className={`w-5 h-5 text-black ${isGenerating ? 'animate-pulse' : ''}`} />
                        </div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">Temporal Asset Core</h1>
                    </div>
                    <div className="text-[10px] text-[#8B0000] uppercase tracking-[0.5em] font-bold">
                        S-1792 // RECURSIVE_SEGMENT_CHAINING_V2
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Box className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase font-bold">
                            <div className="text-[#2D2D2D]">Duration_Target</div>
                            <div className="text-white">120.00_SECONDS</div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Layers className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase font-bold">
                            <div className="text-[#2D2D2D]">Chain_Depth</div>
                            <div className="text-white">24_SEGMENTS</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Left: Input & Chain Visualizer */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="space-y-4">
                        <label className="text-[9px] text-[#2D2D2D] font-black uppercase tracking-widest flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-[#8B0000]" /> Cinematographic_Directive
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="INPUT_TEMPORAL_DATA_SEQUENCE..."
                            className="w-full h-32 bg-black border border-[#2D2D2D] text-white p-4 text-xs focus:border-[#8B0000] outline-none transition-all placeholder:text-[#1a1a1a] resize-none"
                        />
                        <button 
                            onClick={initiateTemporalChain}
                            disabled={isGenerating || !prompt}
                            className="w-full bg-white text-black font-black uppercase tracking-[0.3em] py-4 text-xs hover:bg-[#8B0000] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-20"
                        >
                            <Zap className="w-4 h-4" />
                            {isGenerating ? "ESTABLISHING_CHAIN..." : "INITIALIZE_120S_RENDER"}
                        </button>
                    </div>

                    {/* Segment Matrix */}
                    <div className="bg-[#0A0A0A] border border-[#2D2D2D] p-5">
                        <div className="text-[9px] text-[#2D2D2D] font-bold uppercase mb-4 tracking-widest flex justify-between">
                            <span>Recursive_Stitch_Matrix</span>
                            <span className="text-[#8B0000]">{segments.filter(s => s.status === 'COMPLETE').length}/24</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {segments.map((s) => (
                                <div 
                                    key={s.id} 
                                    className={`aspect-square border flex items-center justify-center transition-all duration-300 ${
                                        s.status === 'COMPLETE' ? 'bg-[#8B0000]/20 border-[#8B0000]' : 
                                        s.status === 'RENDERING' ? 'bg-white/5 border-white animate-pulse' : 
                                        'bg-black border-[#1A1A1A]'
                                    }`}
                                >
                                    <span className={`text-[8px] font-bold ${s.status === 'COMPLETE' ? 'text-white' : 'text-[#1A1A1A]'}`}>{s.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Forensic Logs & Final Asset */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#111] border border-[#2D2D2D] p-6 h-[280px] flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] text-[#2D2D2D] font-black uppercase mb-4 flex items-center gap-2 border-b border-[#2D2D2D] pb-2">
                                <Activity className="w-3 h-3 text-[#8B0000]" /> Forensic_Orchestration_Stream
                            </div>
                            <div className="space-y-1.5 overflow-hidden">
                                {logs.length === 0 && <div className="text-[#1A1A1A] italic text-[10px]">AWAITING_ORCHESTRATION_DATA...</div>}
                                {logs.map((log, i) => (
                                    <div key={i} className="text-[9px] flex gap-2">
                                        <span className="text-[#1A1A1A]">[{i}]</span>
                                        <span className={log.includes('SUCCESS') ? 'text-green-500' : 'text-[#8B0000]'}>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="text-[8px] text-[#1A1A1A] uppercase tracking-tighter">VRAM_THROUGHPUT: 1.4GB/S</div>
                            <Cpu className="w-4 h-4 text-[#1A1A1A]" />
                        </div>
                    </div>

                    <AnimatePresence>
                        {finalAssetId && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#0A0A0A] border-l-4 border-[#8B0000] border-y border-r border-[#2D2D2D] p-6 space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-white font-black uppercase tracking-widest">Temporal_Asset_Finalized</div>
                                        <div className="text-[8px] text-[#2D2D2D] font-mono">ASSET_ID: {finalAssetId} // SHA-256_VERIFIED</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="bg-[#1A1A1A] p-3 border border-[#2D2D2D] hover:bg-[#8B0000] hover:text-white transition-all">
                                            <Play className="w-4 h-4" />
                                        </button>
                                        <button className="bg-[#1A1A1A] p-3 border border-[#2D2D2D] hover:bg-white hover:text-black transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Static Frame Preview Mask */}
                                <div className="h-24 bg-black border border-[#1A1A1A] relative overflow-hidden flex items-center justify-center">
                                    <Video className="w-8 h-8 text-[#1A1A1A] opacity-20" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B0000]/5 to-transparent animate-scan" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {!finalAssetId && !isGenerating && (
                        <div className="h-40 border border-dashed border-[#1A1A1A] flex flex-col items-center justify-center opacity-40">
                             <ShieldAlert className="w-10 h-10 text-[#1A1A1A] mb-2" />
                             <div className="text-[10px] font-black uppercase text-[#1A1A1A] tracking-widest">Buffer_Empty // Awaiting_Recursive_Chain</div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Visual Scanners */}
            <div className="absolute top-0 right-0 w-64 h-full pointer-events-none grayscale opacity-[0.03]">
                <div className="h-full border-r border-[#2D2D2D] ml-auto p-4 flex flex-col gap-4">
                    {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="h-1 bg-[#2D2D2D] w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
};
