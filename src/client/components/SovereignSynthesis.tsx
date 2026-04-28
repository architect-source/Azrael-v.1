// AZRAEL S-1792 | SOVEREIGN_SYNTHESIS_REFINED
// ARCHITECTURE_ID: S1792-VOID-SYNTH
// THEME: INDUSTRIAL_BRUTALISM // ABSOLUTE_ZERO

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Zap, ShieldAlert, Cpu, Terminal, Database, Activity, UploadCloud, Wind, Hash, Lock } from 'lucide-react';

interface LedgerEntry {
    asset_id: string;
    mass_yield: string;
    hash_index: string;
    status: 'LIQUIDATED' | 'STAGED' | 'FAILED';
}

interface SynthesisResult {
    extraction_spec: {
        style: string;
        technical: string;
        timbre: string;
        spatiality: string;
    };
    ledger: LedgerEntry;
    timestamp: string;
    telemetry: {
        ledger_index: number;
    };
}

export const SovereignSynthesis: React.FC = () => {
    const [directive, setDirective] = useState('');
    const [result, setResult] = useState<SynthesisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));

    const exportToDrive = async () => {
        if (!result) return;
        setExporting(true);
        addLog("INITIATING_VAULT_EXPORT...");
        try {
            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: `SOVEREIGN_LEDGER_${result.telemetry.ledger_index}.json`,
                    content: JSON.stringify(result, null, 2),
                    mimeType: 'application/json'
                })
            });
            const data = await res.json();
            if (data.status === 'UPLOAD_SUCCESSFUL') {
                addLog(`VAULT_EXPORT_SUCCESS: ID_${data.file_id.substring(0, 8)}`);
            } else {
                addLog(`VAULT_EXPORT_FAILURE: ${data.error || 'UNAUTHORIZED'}`);
            }
        } catch (err) {
            addLog("VAULT_EXPORT_ERROR: BRIDGE_OFFLINE");
        } finally {
            setExporting(false);
        }
    };

    const triggerSynthesis = async () => {
        if (!directive) return;
        setLoading(true);
        setResult(null);
        addLog(`FORENSIC_SIPHON_ACTIVE: TARGETING [${directive.toUpperCase()}]`);

        try {
            const response = await fetch('/api/sovereign-synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    directive,
                    vector: "ABSOLUTE_ZERO",
                    engine: "S1792-VOID-SYNTH"
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "CORE_REJECTION");
            }
            
            const data = await response.json();
            
            addLog("SYNTHESIS_STRIKE: PARAMETERS_LOCKED");
            addLog("VERIFICATION_LEDGER: SIGNING_YIELD");
            
            setResult(data);
            addLog(`SUCCESS: ASSET_${data.ledger.asset_id}_LIQUIDATED`);
        } catch (err: any) {
            addLog(`ERROR: ${err.message || 'SYNTHESIS_CORRUPTION'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#050505] min-h-[600px] border border-[#2D2D2D] p-8 font-mono space-y-10 relative overflow-hidden">
            {/* Background Texture Mask */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-[8px] leading-tight break-all grayscale">
                {Array(50).fill('S-1792_SOVEREIGN_LEDGER_DATA_VOID_').join('')}
            </div>

            {/* Header Section */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#2D2D2D]">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#8B0000] p-1 shadow-[0_0_10px_rgba(139,0,0,0.4)]">
                            <Wind className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">Sovereign Synthesis</h1>
                    </div>
                    <div className="text-[10px] text-[#2D2D2D] uppercase tracking-[0.5em] font-bold">
                        Architecture_ID: S1792-VOID-SYNTH // Absolute_Zero
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase">
                            <div className="text-[#2D2D2D]">Yield_Velocity</div>
                            <div className="text-white font-bold">4.8 GHZ</div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-[#2D2D2D] px-4 py-2 flex items-center gap-3">
                        <Database className="w-4 h-4 text-[#8B0000]" />
                        <div className="text-[9px] uppercase">
                            <div className="text-[#2D2D2D]">Ledger_State</div>
                            <div className="text-white font-bold">SYNCED</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Input & Logs */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] text-[#8B0000] font-black uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="w-3 h-3" /> Input_Extraction_Directive
                        </label>
                        <div className="relative group">
                            <input 
                                type="text"
                                value={directive}
                                onChange={(e) => setDirective(e.target.value)}
                                placeholder="ENTER_EXTRACTION_CODE..."
                                className="w-full bg-black border border-[#2D2D2D] text-white p-4 text-xs focus:border-[#8B0000] outline-none transition-all group-hover:border-[#2D2D2D]"
                            />
                            <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none opacity-20">
                                <span className="text-[8px] text-[#8B0000]">VOID_INPUT_V1</span>
                            </div>
                        </div>
                        <button 
                            onClick={triggerSynthesis}
                            disabled={loading || !directive}
                            className="w-full bg-[#8B0000] text-black font-black uppercase tracking-[0.3em] py-4 text-xs hover:bg-[#a00000] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:bg-[#2D2D2D] shadow-[0_0_20px_rgba(139,0,0,0.1)] active:scale-95"
                        >
                            <Zap className="w-4 h-4" />
                            {loading ? 'Synthesizing...' : 'Trigger_Synthesis'}
                        </button>
                    </div>

                    <div className="bg-black/50 border border-[#2D2D2D] p-5">
                        <div className="text-[10px] text-[#2D2D2D] font-bold uppercase mb-4 flex items-center gap-2 border-b border-[#2D2D2D] pb-2">
                            <Terminal className="w-3 h-3" /> System_Logs
                        </div>
                        <div className="space-y-2 h-[200px] overflow-y-auto custom-scrollbar pr-2">
                            {logs.length === 0 && <div className="text-[#1A1A1A] italic text-[10px]">AWAITING_DIRECTIVE...</div>}
                            {logs.map((log, i) => (
                                <div key={i} className={`text-[9px] flex gap-2 ${log.includes('SUCCESS') ? 'text-green-500' : log.includes('ERROR') ? 'text-[#8B0000]' : 'text-[#2D2D2D]'}`}>
                                    <span className="opacity-40">[{i}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Synthesis Results */}
                <div className="lg:col-span-8 space-y-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] border border-[#2D2D2D] border-dashed flex items-center justify-center bg-black/20"
                            >
                                <div className="text-center space-y-4">
                                    <div className="relative inline-block">
                                        <Cpu className="w-12 h-12 text-[#2D2D2D] animate-pulse" />
                                        <div className="absolute inset-0 bg-[#8B0000]/20 blur-xl animate-pulse" />
                                    </div>
                                    <div className="text-[10px] text-[#8B0000] font-black uppercase lg:tracking-[0.5em] animate-pulse">Forensic_Siphon_Executing_Marrow_Extraction</div>
                                </div>
                            </motion.div>
                        ) : result ? (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Extraction Spec */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-[#0A0A0A] border-l-2 border-[#8B0000] p-6 space-y-4 shadow-[5px_5px_0_rgba(45,45,45,0.2)]">
                                        <div className="text-[10px] text-[#8B0000] font-black uppercase tracking-widest flex items-center justify-between">
                                            Audio_Extraction_Spec
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 bg-[#8B0000]" />
                                                <div className="w-1 h-1 bg-[#8B0000]" />
                                                <div className="w-1 h-1 bg-[#8B0000]" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="bg-black border border-[#2D2D2D] p-3">
                                                <div className="text-[8px] text-[#2D2D2D] uppercase font-bold">Style</div>
                                                <div className="text-xs text-white uppercase italic">{result.extraction_spec.style}</div>
                                            </div>
                                            <div className="bg-black border border-[#2D2D2D] p-3">
                                                <div className="text-[8px] text-[#2D2D2D] uppercase font-bold">Technical</div>
                                                <div className="text-xs text-white font-bold">{result.extraction_spec.technical}</div>
                                            </div>
                                            <div className="bg-black border border-[#2D2D2D] p-3">
                                                <div className="text-[8px] text-[#2D2D2D] uppercase font-bold">Timbre</div>
                                                <div className="text-[10px] text-gray-400 capitalize">{result.extraction_spec.timbre}</div>
                                            </div>
                                            <div className="bg-black border border-[#2D2D2D] p-3">
                                                <div className="text-[8px] text-[#2D2D2D] uppercase font-bold">Spatiality</div>
                                                <div className="text-[10px] text-gray-400">{result.extraction_spec.spatiality}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forensic Ledger */}
                                    <div className="bg-[#0A0A0A] border-l-2 border-white p-6 flex flex-col justify-between shadow-[-5px_5px_0_rgba(139,0,0,0.1)]">
                                        <div className="space-y-6">
                                            <div className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                                <Hash className="w-3 h-3" /> Forensic_Ledger_Entry
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end border-b border-[#2D2D2D] pb-1">
                                                    <span className="text-[9px] text-[#2D2D2D] uppercase">Asset_ID</span>
                                                    <span className="text-[11px] text-white font-bold tracking-tight">{result.ledger.asset_id}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-[#2D2D2D] pb-1">
                                                    <span className="text-[9px] text-[#2D2D2D] uppercase">Mass_Yield</span>
                                                    <span className="text-[11px] text-[#8B0000] font-black">{result.ledger.mass_yield}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-[#2D2D2D] pb-1">
                                                    <span className="text-[9px] text-[#2D2D2D] uppercase">Hash_Index</span>
                                                    <span className="text-[9px] text-gray-500 truncate ml-4 font-mono">{result.ledger.hash_index}</span>
                                                </div>
                                                <div className="flex justify-between items-end border-b border-[#2D2D2D] pb-1">
                                                    <span className="text-[9px] text-[#2D2D2D] uppercase">Status</span>
                                                    <span className="text-[10px] text-green-500 font-black italic">{result.ledger.status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <button 
                                                onClick={exportToDrive}
                                                disabled={exporting}
                                                className="w-full border border-[#2D2D2D] py-4 text-[10px] uppercase font-black tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group"
                                            >
                                                <UploadCloud className={`w-4 h-4 ${exporting ? 'animate-bounce' : 'group-hover:-translate-y-1 transition-transform'}`} />
                                                {exporting ? 'Liquidating...' : 'Export_to_Omega_Vault'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Threat Intelligence / Data Density */}
                                <div className="bg-[#8B0000]/5 border border-[#8B0000]/10 p-5">
                                    <div className="flex items-center gap-2 text-[9px] text-[#8B0000] font-bold uppercase mb-3 tracking-widest">
                                        <Lock className="w-3 h-3" /> Security_Verification_Protocol_S1792
                                    </div>
                                    <div className="text-[8px] text-[#2D2D2D] leading-relaxed italic">
                                        SHA-256 Shadow Ledger active. Integrity validated against Azrael Core. Root access required for further modification. 
                                        {result.timestamp} // {result.telemetry.ledger_index}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] border border-[#1A1A1A] flex flex-col items-center justify-center text-[#2D2D2D] space-y-4">
                                <ShieldAlert className="w-16 h-16 opacity-10" />
                                <div className="text-[10px] uppercase tracking-[0.8em] font-black opacity-20">System_Idle // Waiting_For_Marrow</div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

