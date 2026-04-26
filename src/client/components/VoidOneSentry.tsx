// src/client/components/VoidOneSentry.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';

export const VoidOneSentry: React.FC = () => {
    const [messages, setMessages] = useState<{from: string, text: string}[]>([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (!input) return;
        const userMsg = input;
        setMessages([...messages, { from: 'Architect', text: userMsg }]);
        setInput('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, sessionId: 'void-1-session' })
            });
            const data = await response.json();
            setMessages(prev => [...prev, { from: 'VOID-1', text: data.response }]);
        } catch (e) {
            setMessages(prev => [...prev, { from: 'VOID-1', text: 'SYSTEM ERROR. CONNECTIVITY SEVERED.' }]);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black text-green-500 font-mono p-6 border border-green-900 rounded-lg shadow-2xl w-full max-w-md mx-auto mt-12"
        >
            <h2 className="text-lg border-b border-green-900 pb-2 mb-4 uppercase tracking-widest text-center">VOID-1 // FORENSIC INTERCEPTOR</h2>
            <div className="h-64 overflow-y-auto mb-4 space-y-2">
                {messages.map((m, i) => (
                    <div key={i} className="text-sm">
                        <span className="text-green-700">[{m.from}]</span> {m.text}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <span className="text-green-700">{">>"}</span>
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                    className="bg-black outline-none flex-1 text-green-300"
                    placeholder="Enter command..."
                />
            </div>
        </motion.div>
    );
};
