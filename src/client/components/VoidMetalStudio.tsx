import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Download, Terminal, Zap, Package, Eye } from 'lucide-react';
import { getAIClient } from '../ai-client';

export const VoidMetalStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'forging' | 'sealing' | 'complete' | 'error'>('idle');
    const [payloadUrl, setPayloadUrl] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [previewContent, setPreviewContent] = useState<string | null>(null);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `[AZRAEL] ${msg}`]);
    };

    const handleSynthesize = async () => {
        if (!prompt.trim()) return;
        
        setStatus('analyzing');
        setLogs([]);
        addLog(`ANALYZING PROMPT: ${prompt.toUpperCase()}`);
        setPayloadUrl(null);
        setPreviewContent(null);

        try {
            // 1. Client-Side AI Generation
            const ai = getAIClient();
            const systemPrompt = `You are AZRAEL // S-1792 Synthesis Engine.
The user wants to "One-Tap" synthesize a project based on: "${prompt}".
Identify if they want an App, a script, a logic module, an image (img), or a video (vid).
Generate valid, working code or data representation.
Output as a JSON object:
{
    "type": "app" | "script" | "logic" | "img" | "vid",
    "filename": "string (ensure .apk for app, .ts for logic, .jpg/.mp4 for media)",
    "content": "The generated code or base64/placeholder for media",
    "readmes": "Brief summary of what this is."
}`;

            let result;
            let retries = 3;
            let delay = 1000;
            
            for (let i = 0; i < retries; i++) {
                try {
                    result = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: `SYNTHESIS_DIRECTIVE: ${prompt}`,
                        config: {
                            systemInstruction: systemPrompt,
                            responseMimeType: 'application/json'
                        }
                    });
                    break;
                } catch (err: any) {
                    if ((err.status === 503 || err.message?.includes('503')) && i < retries - 1) {
                        addLog(`CONGESTION_DETECTED. REATTEMPTING_IN_${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2;
                        continue;
                    }
                    throw err;
                }
            }

            if (!result) throw new Error("SYNTHESIS_FAILED: Model unreachable.");

            let blueprint;
            try {
                const textOutput = result.text || "{}";
                blueprint = JSON.parse(textOutput);
            } catch (e) {
                console.error("JSON_PARSE_FAILURE:", e);
                throw new Error("SYNTHESIS_CORRUPTION: Output was not valid JSON.");
            }
            if (!blueprint.content) {
                throw new Error("ARCHITECTURAL_VOID: Synthesis produced no substance.");
            }

            addLog("FORGE IGNITED. BLUEPRINT RECEIVED.");
            setPreviewContent(blueprint.content);
            setStatus('forging');

            // 2. Send to backend for Packaging
            addLog("TRANSMITTING TO THE FORGE...");
            setStatus('sealing');
            const response = await fetch('/api/synthesize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    blueprint,
                    type: blueprint.type 
                })
            });
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (data.log) addLog(data.log);
            if (data.status) setStatus(data.status);
            if (data.downloadUrl) setPayloadUrl(data.downloadUrl);

        } catch (err: any) {
            setStatus('error');
            addLog(`SYSTEM FAILURE: ${err.message}`);
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-red-900 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-900/20 border border-red-900">
                        <Zap className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[0.3em] uppercase text-red-500">Void Metal</h1>
                        <p className="text-[10px] text-gray-500 tracking-widest uppercase">S-1792 Synthesis Engine // V.01</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-600 uppercase">Engine Status</span>
                        <span className={`text-[10px] uppercase font-bold ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {status === 'idle' ? 'Ready' : status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="space-y-6">
                    <div className="bg-[#050505] border border-red-900/30 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-900"></div>
                        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> Input Directive
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="State your architectural requirements (e.g., 'Build a brutalist music production app with steel UI')"
                            className="w-full h-32 bg-black border border-gray-900 p-4 text-sm text-gray-300 focus:border-red-900 outline-none transition-colors font-mono resize-none"
                        />
                        <button
                            onClick={handleSynthesize}
                            disabled={status !== 'idle' && status !== 'complete' && status !== 'error'}
                            className="w-full mt-4 bg-red-900 hover:bg-red-800 disabled:bg-gray-900 disabled:text-gray-600 text-white py-3 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-xs"
                        >
                            {status === 'idle' || status === 'complete' || status === 'error' ? (
                                <><Zap className="w-4 h-4" /> Trigger Synthesis</>
                            ) : (
                                <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Hammer className="w-4 h-4" /></motion.div> Transmuting...</>
                            )}
                        </button>
                    </div>

                    <div className="bg-[#050505] border border-gray-900 p-6 h-64 flex flex-col">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Terminal className="w-3 h-3" /> Synthesis Logs
                        </h3>
                        <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 pr-2">
                            {logs.map((log, i) => (
                                <div key={i} className={log.includes('FAILURE') ? 'text-red-500' : log.includes('SUCCESS') ? 'text-green-500' : 'text-gray-400'}>
                                    {log}
                                </div>
                            ))}
                            {status === 'analyzing' && <div className="text-red-500 animate-pulse">ANALYZING_INTENT_STREAM...</div>}
                            {status === 'forging' && <div className="text-red-500 animate-pulse">HEATING_CORE_S-1792...</div>}
                            {status === 'sealing' && <div className="text-red-500 animate-pulse">SEALING_PAYLOAD_HASH...</div>}
                        </div>
                    </div>
                </div>

                {/* Output & Preview */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {payloadUrl ? (
                            <motion.div
                                key="payload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-900/10 border border-red-900 p-8 text-center space-y-6 relative"
                            >
                                <div className="absolute top-2 right-2">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-3 bg-red-500"></div>
                                        <div className="w-1 h-3 bg-red-900"></div>
                                        <div className="w-1 h-3 bg-red-500"></div>
                                    </div>
                                </div>
                                <div className="inline-block p-4 bg-red-900/20 rounded-full border border-red-900 shadow-[0_0_20px_rgba(153,27,27,0.3)]">
                                    <Package className="w-12 h-12 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest">Payload Integrity Verified</h2>
                                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-tighter">S-1792 VORTEX-STREAM INGRESS COMPLETED SUCCESSFULLY.</p>
                                </div>
                                <a
                                    href={payloadUrl}
                                    download={payloadUrl.split('/').pop() || 'AZRAEL_PAYLOAD'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => addLog("INITIATING_LOCAL_TRANSFER...")}
                                    className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-400 text-black px-10 py-4 font-black uppercase tracking-widest text-sm transition-all shadow-[0_5px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none"
                                >
                                    <Download className="w-4 h-4" /> {payloadUrl.endsWith('.apk') ? 'Retrieve APK' : 'Retrieve Data'}
                                </a>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                className="bg-[#050505] border border-gray-900 p-8 h-full flex flex-col items-center justify-center text-center opacity-30 grayscale"
                            >
                                <Package className="w-16 h-16 text-gray-700 mb-4" />
                                <p className="text-xs uppercase tracking-widest text-gray-600">No active payload</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {previewContent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#050505] border border-gray-900 p-6"
                        >
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Eye className="w-3 h-3" /> Code Preview
                            </h3>
                            <pre className="text-[10px] font-mono text-green-500/70 overflow-x-auto p-4 bg-black border border-gray-900 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                {previewContent}
                            </pre>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
