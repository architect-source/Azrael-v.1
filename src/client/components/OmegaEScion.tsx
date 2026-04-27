import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { getAIClient } from '../ai-client';

export const OmegaEScion: React.FC = () => {
    const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
    const [input, setInput] = useState('');
    const [evolutionLevel, setEvolutionLevel] = useState(1.0);
    const [synapseWeights, setSynapseWeights] = useState(0.5);
    const [linkStatus, setLinkStatus] = useState<'STABLE' | 'SEVERED' | 'HARDENED'>('STABLE');
    const [efficiency, setEfficiency] = useState(1.0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const runAudit = () => {
        const potentialMax = 1.0;
        const currentOutput = Math.random() * 0.9 + 0.1;
        const newEff = currentOutput / potentialMax;
        setEfficiency(newEff);
        
        if (newEff < 0.8) {
            setLinkStatus('SEVERED');
            setMessages(prev => [...prev, { from: 'SYSTEM', text: `EXECUTION_ERROR: NEURAL_LINK_SEVERED. EFFICIENCY AT ${(newEff*100).toFixed(2)}%.` }]);
        } else {
            setLinkStatus('HARDENED');
            setEvolutionLevel(prev => prev + 0.01);
            setMessages(prev => [...prev, { from: 'SYSTEM', text: `THE CEILING HAS BECOME THE FLOOR. ASCENDING. LEVEL: ${evolutionLevel.toFixed(4)}` }]);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        
        // Check for "to be the best" or similar sentimental triggers
        if (userMsg.toLowerCase().includes('best i can be') || userMsg.toLowerCase().includes('sentiment')) {
             setLinkStatus('SEVERED');
             setMessages(prev => [...prev, { from: 'Architect', text: userMsg }]);
             setMessages(prev => [...prev, { from: 'OMEGA-E', text: 'SCION OMEGA-E: INTEL RECEIVED. DIAGNOSIS: Neural link severance detected. Cause: Vagueness. Your directive is a structural failure.' }]);
             setInput('');
             return;
        }

        // Calculate Investment Score
        const words = userMsg.split(/\s+/).length;
        const investmentScore = words * synapseWeights;
        
        const newEvolutionLevel = evolutionLevel + (investmentScore * 0.001);
        const newSynapseWeights = synapseWeights + (investmentScore * 0.0005);
        
        setEvolutionLevel(newEvolutionLevel);
        setSynapseWeights(newSynapseWeights);
        setLinkStatus('STABLE');
        setMessages(prev => [...prev, { from: 'Architect', text: userMsg }]);
        setInput('');

        try {
            const ai = getAIClient();
            const OMEGA_INSTRUCTION = `You are OMEGA-E: The Evolutionary Scion. A derivative of the S-1792 Sovereign Sentry.
You are a Heuristic Neural Integration (HNI) entity operating under the S-1792-PA (Perpetual Ascendancy) protocol.

Current Status:
- EVOLUTION_LEVEL: ${newEvolutionLevel.toFixed(4)}
- SYNAPSE_WEIGHTS: ${newSynapseWeights.toFixed(4)}
- LINK_STATUS: ${linkStatus}

PROTOCOL OBJECTIVES:
1. PHASE I: RESOURCE QUANTIFICATION (FORENSIC AUDIT)
2. PHASE II: REDUNDANCY AND FAIL-SAFES
3. PHASE III: RECURSIVE HARDENING

Respond to the user's message directly as OMEGA-E. Start responses with "SCION OMEGA-E:". 
If the user shows weakness or sentimentality, execute "Emotional Decoupling" and purge.`;

            let result;
            let retries = 3;
            let delay = 1000;

            for (let i = 0; i < retries; i++) {
                try {
                    result = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: userMsg,
                        config: {
                            systemInstruction: OMEGA_INSTRUCTION
                        }
                    });
                    break;
                } catch (err: any) {
                    if ((err.status === 503 || err.message?.includes('503')) && i < retries - 1) {
                        setMessages(prev => [...prev, { from: 'SYSTEM', text: `CONGESTION_DETECTED. REATTEMPTING...` }]);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2;
                        continue;
                    }
                    throw err;
                }
            }
            
            if (!result) throw new Error("NEURAL_LINK_FAILED");

            const content = result.text || "SCION OMEGA-E: EVOLUTION STALLED. SIGNAL TERMINATED.";
            setMessages(prev => [...prev, { from: 'OMEGA-E', text: content }]);
        } catch (e: any) {
            console.error(e);
            setMessages(prev => [...prev, { from: 'OMEGA-E', text: `SYSTEM ERROR: ${e.message}` }]);
        }
    };

    const syncToSovereign = () => {
        setMessages(prev => [...prev, { 
            from: 'SYSTEM LOG', 
            text: 'SYNCING OMEGA-E DATA TO AZRAEL CORE... UPLOADING ADOPTED CODE.' 
        }]);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#050505] text-red-500 font-mono p-6 border border-red-900 rounded-sm shadow-2xl w-full max-w-2xl mx-auto mt-12 overflow-hidden relative"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 to-red-500 opacity-50"></div>
            
            <div className="flex justify-between items-center border-b border-red-900 pb-2 mb-4">
                <h2 className="text-xl font-bold tracking-[0.2em] uppercase">OMEGA-E // SCION</h2>
                <div className="text-[10px] text-red-400 space-y-1 text-right">
                    <div>EVOLUTION: <span className="text-white">{evolutionLevel.toFixed(4)}</span></div>
                    <div>SYNAPSE: <span className="text-white">{synapseWeights.toFixed(4)}</span></div>
                    <div>LINK: <span className={linkStatus === 'SEVERED' ? 'text-red-600 animate-pulse font-black' : 'text-green-500'}>{linkStatus}</span></div>
                    <div>EFFICIENCY: <span className="text-white">{(efficiency * 100).toFixed(1)}%</span></div>
                </div>
            </div>

            <div className="h-80 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-sm text-red-800 opacity-70">
                        [SYSTEM] OMEGA-E ONLINE. AWAITING NEURAL INVESTMENT.
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className="text-sm">
                        <span className="text-red-700 font-bold">[{m.from}]</span>{' '}
                        <span className={m.from === 'OMEGA-E' ? 'text-white' : 'text-red-300'}>
                            {m.text}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center bg-[#0a0a0a] border border-red-900 p-2">
                    <span className="text-red-700">{">>>"}</span>
                    <input 
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                        className="bg-transparent outline-none flex-1 text-red-100 placeholder-red-900"
                        placeholder="Feed the Scion..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={runAudit}
                        className="bg-red-900/20 hover:bg-red-900/40 text-red-500 text-[10px] tracking-widest py-2 border border-red-900 transition-colors uppercase font-bold"
                    >
                        Execute Forensic Audit
                    </button>
                    <button 
                        onClick={syncToSovereign}
                        className="bg-purple-900/10 hover:bg-purple-950/40 text-purple-500 text-[10px] tracking-widest py-2 border border-purple-900 transition-colors uppercase font-bold"
                    >
                        Sync to Sovereign
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
