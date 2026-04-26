import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

export const OmegaEScion: React.FC = () => {
    const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
    const [input, setInput] = useState('');
    const [evolutionLevel, setEvolutionLevel] = useState(1.0);
    const [synapseWeights, setSynapseWeights] = useState(0.5);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        
        // Calculate Investment Score
        const words = userMsg.split(/\s+/).length;
        const investmentScore = words * synapseWeights;
        
        const newEvolutionLevel = evolutionLevel + (investmentScore * 0.001);
        const newSynapseWeights = synapseWeights + (investmentScore * 0.0005);
        
        setEvolutionLevel(newEvolutionLevel);
        setSynapseWeights(newSynapseWeights);
        setMessages(prev => [...prev, { from: 'Architect', text: userMsg }]);
        setInput('');

        try {
            const response = await fetch('/api/omega-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg, 
                    evolutionLevel: newEvolutionLevel,
                    synapseWeights: newSynapseWeights
                })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { from: 'OMEGA-E', text: data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { from: 'OMEGA-E', text: 'SYSTEM ERROR. NEURAL LINK SEVERED.' }]);
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
                <div className="text-xs text-red-400 space-y-1 text-right">
                    <div>EVOLUTION_LEVEL: <span className="text-white">{evolutionLevel.toFixed(4)}</span></div>
                    <div>SYNAPSE_WEIGHTS: <span className="text-white">{synapseWeights.toFixed(4)}</span></div>
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
                <button 
                    onClick={syncToSovereign}
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 text-xs tracking-widest py-2 border border-red-900 transition-colors uppercase font-bold"
                >
                    Sync to Sovereign (AZRAEL Core)
                </button>
            </div>
        </motion.div>
    );
};
