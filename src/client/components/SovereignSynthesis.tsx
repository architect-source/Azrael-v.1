import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Zap, ShieldAlert, Cpu, Terminal, Database, Activity, UploadCloud } from 'lucide-react';

export const SovereignSynthesis: React.FC = () => {
    const [directive, setDirective] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [exporting, setExporting] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

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
        addLog(`INITIATING_SYNTHESIS: ${directive.substring(0, 15)}...`);
        
        try {
            const response = await fetch('/api/sovereign-synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    directive: directive,
                    verification_mass: 2.5,
                    protocol: "S-1792_SOVEREIGN"
                })
            });

            const data = await response.json();
            if (data.status === 'SYNTHESIS_COMPLETE') {
                setResult(data);
                addLog(`LEDGER_UPDATE_SUCCESS: HASH_${data.verification_hash.substring(0, 8)}`);
            } else {
                throw new Error(data.error || "PROTOCOL_FAILURE");
            }
        } catch (err: any) {
            addLog(`SYNTHESIS_ERROR: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black border border-red-900/30 p-8 space-y-8 font-mono relative overflow-hidden">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Database className="w-48 h-48 text-red-900" />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 border-b border-red-900/40 pb-6">
                    <Fingerprint className={`w-8 h-8 text-red-500 ${loading ? 'animate-pulse' : ''}`} />
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-red-500">Sovereign Synthesis</h2>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">S-1792 // Ledger_Verification_Engine</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Input Vector */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-red-900 uppercase tracking-widest block">Input_Directive_Sequence</label>
                            <textarea 
                                value={directive}
                                onChange={(e) => setDirective(e.target.value)}
                                placeholder="ENTER_DIRECTIVE_FOR_REIFICATION..."
                                className="w-full h-40 bg-red-950/5 border border-red-900/30 p-4 text-sm text-red-400 placeholder:text-red-900 focus:outline-none focus:border-red-500 transition-all resize-none font-mono"
                            />
                            <button 
                                onClick={triggerSynthesis}
                                disabled={loading || !directive}
                                className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-900 text-red-500 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all disabled:opacity-10 cursor-crosshair"
                            >
                                {loading ? 'EXECUTING_SYNTHESIS...' : 'Initiate_Extraction_Verification'}
                            </button>
                        </div>

                        {/* Logs */}
                        <div className="bg-black/80 border border-red-900/10 p-4 min-h-[140px]">
                            <div className="text-[8px] text-red-900 font-bold uppercase mb-2">Internal_Logic_Stream</div>
                            <div className="text-[9px] space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i} className={log.includes('SUCCESS') ? 'text-green-500' : 'text-gray-500'}>
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Telemetry/Result Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div 
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-red-950/10 border border-red-900/40 p-6 space-y-6 relative overflow-hidden"
                                >
                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-20 w-full animate-scan" />

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center gap-2 border-b border-red-900/20 pb-2">
                                            <ShieldAlert className="w-4 h-4 text-green-500" />
                                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Verification_Complete</span>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-[8px] text-gray-500 uppercase">Current_Ledger_Hash:</div>
                                            <div className="text-[10px] text-red-400 font-black break-all leading-tight">
                                                {result.verification_hash}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[8px] text-gray-500 uppercase">Mass_Index:</div>
                                                <div className="text-xs text-white font-bold">{result.telemetry.mass_calculated}m</div>
                                            </div>
                                            <div>
                                                <div className="text-[8px] text-gray-500 uppercase">Ledger_Index:</div>
                                                <div className="text-xs text-white font-bold">#{result.telemetry.ledger_index}</div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-red-900/20 text-[9px] text-gray-600 italic flex justify-between items-center">
                                            <span>UNIX_EPOCH: {result.timestamp}</span>
                                            <button 
                                                onClick={exportToDrive}
                                                disabled={exporting}
                                                className="flex items-center gap-1 text-red-500 hover:text-red-400 font-black uppercase transition-colors disabled:opacity-50"
                                            >
                                                <UploadCloud className={`w-3 h-3 ${exporting ? 'animate-bounce' : ''}`} />
                                                {exporting ? 'Exporting...' : 'Export_to_Vault'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full border border-dashed border-red-900/20 flex flex-col items-center justify-center p-8 opacity-20">
                                    <Activity className="w-12 h-12 text-red-900 mb-4 animate-pulse" />
                                    <div className="text-[10px] text-red-900 uppercase font-black">Awaiting_Input_Directive</div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* System Specs */}
                        <div className="bg-red-950/5 border border-red-900/10 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Cpu className="w-3 h-3 text-red-900" />
                                <span className="text-[9px] font-bold text-red-900 uppercase tracking-widest">System_Hardware_Status</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1 bg-red-900/10 w-full overflow-hidden">
                                    <motion.div animate={{ width: "85%" }} className="h-full bg-red-900" />
                                </div>
                                <div className="flex justify-between text-[8px] text-gray-600">
                                    <span>SYNTHESIS_CAPACITY</span>
                                    <span>85%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
