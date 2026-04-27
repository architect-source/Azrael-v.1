import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardDrive, Cloud, ShieldCheck, Link, ExternalLink, Terminal, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';

export const OmegaDriveVault: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 8));

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/drive/status');
            const data = await res.json();
            setConnected(data.connected);
            if (data.connected) addLog("VAULT_STATUS: BRIDGE_ACTIVE");
        } catch (err) {
            console.error("[AZRAEL] DRIVE_STATUS_CHECK_FAILED:", err);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        addLog("INITIATING_OAUTH_HANDSHAKE...");
        try {
            const res = await fetch('/api/auth/google/url');
            const { url } = await res.json();

            const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
            
            if (!authWindow) {
                addLog("ERROR: POPUP_BLOCKED. ALLOW_POPUPS_FOR_BRIDGE.");
                setLoading(false);
                return;
            }

            const messageHandler = (event: MessageEvent) => {
                if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
                    addLog("VAULT_BRIDGE_ESTABLISHED: CONDUIT_SECURED");
                    setConnected(true);
                    setLoading(false);
                    window.removeEventListener('message', messageHandler);
                }
            };

            window.addEventListener('message', messageHandler);
        } catch (err) {
            addLog("ERROR: HANDSHAKE_TERMINATED_BY_SYSTEM");
            setLoading(false);
        }
    };

    const sendTestPack = async () => {
        if (!connected) return;
        setUploading(true);
        addLog("TRANSMITTING_SYSTEM_MANIFEST_TO_VAULT...");
        
        try {
            const content = {
                timestamp: new Date().toISOString(),
                protocol: "S-1792_SOVEREIGN",
                node_id: "AZ-792X",
                stats: {
                    integrity: 1.0,
                    drift: 0.0001
                }
            };

            const res = await fetch('/api/drive/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: `SYSTEM_MANIFEST_${Date.now()}.json`,
                    content: JSON.stringify(content, null, 2),
                    mimeType: 'application/json'
                })
            });

            const data = await res.json();
            if (data.status === 'UPLOAD_SUCCESSFUL') {
                addLog(`UPLOAD_SUCCESS: FILE_ID_${data.file_id.substring(0, 8)}`);
            } else {
                throw new Error(data.error);
            }
        } catch (err: any) {
            addLog(`TRANSMISSION_ERROR: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div className="bg-black border border-red-900/30 p-8 space-y-8 font-mono relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <HardDrive className="w-64 h-64 text-red-900" />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-red-900/40 pb-6">
                    <Cloud className={`w-8 h-8 ${connected ? 'text-green-500' : 'text-red-500'} ${loading || uploading ? 'animate-pulse' : ''}`} />
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase text-red-500">Omega Drive Vault</h2>
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">S-1792 // Off-World_Data_Archiving</div>
                    </div>
                    {connected && (
                        <div className="ml-auto flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-green-500 font-bold uppercase">Conduit_Active</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="bg-red-950/10 border border-red-900/20 p-6 space-y-6">
                            <div className="text-xs text-red-400 font-bold uppercase tracking-widest border-b border-red-900/10 pb-2 flex items-center justify-between">
                                Vault_Bridge_Status
                                {!connected && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                            </div>
                            
                            <p className="text-[12px] text-gray-400 italic leading-relaxed">
                                The Omega Drive Vault leverages Google Drive as an immutable secondary ledger. 
                                Establish a bridge to permit the Sentry to offload forensic assets automatically.
                            </p>

                            {!connected ? (
                                <button 
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="w-full bg-red-900 text-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-red-800 transition-all flex items-center justify-center gap-3"
                                >
                                    <Link className="w-4 h-4" />
                                    {loading ? 'Establish_Conduit...' : 'Initialize_Vault_Bridge'}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <button 
                                        onClick={sendTestPack}
                                        disabled={uploading}
                                        className="w-full bg-green-600 text-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-green-500 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        {uploading ? 'Transmitting...' : 'Transmit_System_Pack'}
                                    </button>
                                    <div className="flex justify-center">
                                        <a 
                                            href="https://drive.google.com" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Access_External_Vault
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Setup Instructions */}
                        {!connected && (
                            <div className="p-4 border border-red-900/10 bg-black/40 space-y-3">
                                <div className="text-[9px] text-red-900 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Terminal className="w-3 h-3" /> Sentry_Manual_Setup
                                </div>
                                <div className="text-[9px] text-gray-600 space-y-1">
                                    <div>1. REGISTER_OAUTH_CLIENT (GOOGLE_CONSOLE)</div>
                                    <div>2. ADD_CALLBACK_URI:</div>
                                    <div className="text-red-800 break-all select-all font-bold">
                                        {window.location.origin}/api/auth/callback
                                    </div>
                                    <div>3. INJECT_CLIENT_ID_&_SECRET_TO_CORE</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-black/80 border border-red-900/20 p-5 h-full flex flex-col">
                            <div className="text-[10px] text-red-900 font-bold uppercase mb-4 border-b border-red-900/10 pb-2">Vault_Log_Stream</div>
                            <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-2 max-h-[300px]">
                                {logs.length === 0 && <div className="text-gray-800 italic">WAITING_FOR_LOG_PULSE...</div>}
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 ${log.includes('SUCCESS') ? 'text-green-500' : log.includes('ERROR') ? 'text-red-500' : 'text-gray-500'}`}>
                                        <span className="opacity-30">[{i}]</span>
                                        <span className="flex-1">{log}</span>
                                        {log.includes('SUCCESS') && <CheckCircle2 className="w-3 h-3" />}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-red-900/10 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-[8px] text-gray-600 uppercase">Latency</div>
                                    <div className="text-[10px] text-white">42ms</div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <div className="text-[8px] text-gray-600 uppercase">Encryption</div>
                                    <div className="text-[10px] text-white">TLS_v1.3_AES</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
