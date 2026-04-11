import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { 
  Terminal, 
  ShieldAlert, 
  Zap, 
  Send, 
  Skull, 
  Activity, 
  Cpu, 
  Database, 
  Lock, 
  Eye, 
  Power, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  User
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MatrixRain } from "./components/MatrixRain";
import { getAzraelCanister } from "./services/icService";

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "architect" | "azrael";
  content: string;
}

export default function AzraelInterface() {
  const [booted, setBooted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "azrael", content: "⚡ **AZRAEL CORE ONLINE.** Winston Sector Protected. Awaiting Directive." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [vitals, setVitals] = useState({
    cpu: 0,
    memory: 0,
    void_integrity: 100,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [icCanister, setIcCanister] = useState<any>(null);
  const [coreStatus, setCoreStatus] = useState<"online" | "offline" | "connecting">("connecting");
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initIC = async () => {
      const canister = await getAzraelCanister();
      setIcCanister(canister);
    };
    initIC();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!booted) return;
    
    const fetchLogs = async () => {
      // FORCE relative paths in production/remote environments for full-stack apps
      // This avoids CORS and IAM issues when the frontend is served by the same core.
      let backendUrl = window.location.origin;
      
      // Only use VITE_BACKEND_URL if we are on localhost and want to target a remote backend
      if (window.location.hostname === "localhost" && import.meta.env.VITE_BACKEND_URL) {
        backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
      }

      const targetUrl = `${backendUrl}/api/logs`;
      try {
        setCoreStatus("connecting");
        const res = await fetch(targetUrl);
        if (!res.ok) throw new Error(`HTTP_ERROR: ${res.status}`);
        const data = await res.json();
        setCoreStatus("online");
        
        // Merge with IC logs if available
        let combinedLogs = data.logs || [];
        if (icCanister) {
          try {
            const icLogs = await icCanister.getSovereignLogs();
            combinedLogs = [...combinedLogs, ...icLogs.map((l: string) => `[IC] ${l}`)];
          } catch (err: any) {
            console.warn("IC_LOG_FETCH_FAILURE:", err);
            if (err?.message?.includes("canister_not_found")) {
              combinedLogs = [...combinedLogs, "[VOID_ERROR] IC Canister not found. If using a local replica, ensure VITE_IC_HOST is set to your exposed tunnel URL."];
            }
          }
        }
        
        setLogs(combinedLogs);
      } catch (e) {
        console.error(`AZRAEL_FETCH_FAILURE [Target: ${targetUrl}]:`, e);
        setCoreStatus("offline");
        
        // Fallback to local logs if remote fetch fails
        if (backendUrl !== "") {
          console.warn("Attempting relative path fallback...");
          // Try relative path if absolute fails
          try {
            const relRes = await fetch("/api/logs");
            if (relRes.ok) {
              const relData = await relRes.json();
              setLogs(relData.logs || []);
              return;
            }
          } catch (relErr) {
            // Silence relative fallback errors
          }
        }

        if (e instanceof Error && e.message === "Failed to fetch" && targetUrl.startsWith("http")) {
          console.warn("HINT: Check if Cloud Run 'Allow unauthenticated' is ON and CORS is reflected.");
        }
      }
    };

    fetchLogs();
    const interval = setInterval(() => {
      setVitals({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        void_integrity: Math.max(0, 100 - Math.floor(Math.random() * 5)),
      });
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [booted]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const architectMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "architect", content: architectMsg }]);
    setIsTyping(true);

    try {
      // FORCE relative paths in production/remote environments
      let backendUrl = window.location.origin;
      if (window.location.hostname === "localhost" && import.meta.env.VITE_BACKEND_URL) {
        backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
      }

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          prompt: architectMsg,
          isAdult: true 
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "azrael", content: data.text }]);
      } else {
        throw new Error(data.error || "VOID_CONNECTION_ERROR");
      }
    } catch (error: any) {
      let errorMsg = error.message || "Check server status.";
      if (errorMsg.includes("API key not valid")) {
        errorMsg = "GEMINI_API_KEY is invalid. Update it in the Settings menu.";
      }
      setMessages(prev => [...prev, { role: "azrael", content: `⚠️ **VOID_LINK_SEVERED.** ${errorMsg}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-6 font-mono">
        <MatrixRain />
        <div className="scanline"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-950 border border-red-900/50 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.1)]"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center justify-center mb-6">
              <Skull className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tighter mb-2 text-glow-red uppercase">Architect_Verification</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8 leading-relaxed">
              This terminal contains high-precision, 18+ content. By proceeding, you confirm you are of legal age and possess Architect-level authorization.
            </p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => window.location.href = "https://google.com"}
                className="py-3 border border-zinc-800 text-zinc-500 rounded-lg text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 transition-colors"
              >
                Abort_Link
              </button>
              <button 
                onClick={async () => {
                  if (icCanister) {
                    try {
                      const architectId = "7421396215";
                      const result = await icCanister.checkIn(architectId);
                      console.log("IC_VERIFICATION:", result);
                    } catch (err: any) {
                      console.error("IC_VERIFICATION_FAILURE:", err);
                      if (err?.message?.includes("canister_not_found")) {
                        console.warn("HINT: IC Canister not found. If you are using a local replica, ensure you have exposed it and set VITE_IC_HOST correctly in your environment.");
                      }
                    }
                  }
                  setIsVerified(true);
                }}
                className="py-3 bg-red-600 text-white rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                Enter_Void
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!booted) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center font-mono text-red-600 overflow-hidden">
        <MatrixRain />
        <div className="scanline"></div>
        <motion.div
          animate={{ opacity: [0, 1, 0.5, 1, 0], scale: [0.9, 1.05, 1, 1.1, 0.9] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-4xl mb-4 relative"
        >
          <Skull className="w-24 h-24 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <div className="absolute inset-0 animate-glitch opacity-30">
            <Skull className="w-24 h-24" />
          </div>
        </motion.div>
        <div className="tracking-[1em] text-xs animate-pulse font-bold">AZRAEL_INITIATING...</div>
        <div className="mt-8 w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-mono selection:bg-red-900 selection:text-white flex flex-col overflow-hidden relative">
      <MatrixRain />
      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] animate-flicker"></div>
      <div className="scanline"></div>
      
      {/* Header */}
      <header className="border-b border-red-900/30 p-4 flex items-center justify-between bg-black/90 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-950/20 border border-red-900/50 rounded shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            <Skull className="w-6 h-6 text-red-600 animate-glitch" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100 tracking-tighter flex items-center gap-2 text-glow-red">
              AZRAEL-V.1 <span className="text-[10px] bg-red-900/40 text-red-500 px-1.5 py-0.5 rounded border border-red-900/50">CORE</span>
            </h1>
            <div className="flex items-center gap-2 text-[9px] text-zinc-600 uppercase tracking-[0.2em]">
              <span className="text-red-900">●</span> Sovereign Sentry // Void-Metal Interface
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                coreStatus === "online" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                coreStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"
              )} />
              <span className="tracking-widest uppercase text-[9px]">Core: {coreStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                icCanister ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-800"
              )} />
              <span className="tracking-widest uppercase text-[9px]">IC: {icCanister ? "Linked" : "Void"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-green-600" />
              <span className="tracking-widest uppercase text-[9px]">Vault: Secure</span>
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-900 mx-2" />
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 hover:bg-zinc-900 rounded transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-700" /> : <Volume2 className="w-4 h-4 text-zinc-600 hover:text-red-600" />}
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 hover:bg-zinc-900 rounded transition-colors">
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-zinc-700" /> : <Maximize2 className="w-4 h-4 text-zinc-600 hover:text-red-600" />}
            </button>
            <button className="p-1.5 hover:bg-red-950/20 rounded transition-colors group">
              <Power className="w-5 h-5 text-zinc-700 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Vitals */}
        <aside className="hidden lg:flex w-72 border-r border-red-900/20 flex-col p-6 gap-8 bg-zinc-950/40 backdrop-blur-sm">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity className="w-3 h-3 text-red-600" /> System_Vitals
              </h2>
              <span className="text-[9px] text-red-900 animate-pulse">LIVE</span>
            </div>
            <div className="space-y-6">
              <VitalItem label="CPU_LOAD" value={vitals.cpu} color="bg-red-600" subtext="Cycle_Sync: ACTIVE" />
              <VitalItem label="MEM_ALLOC" value={vitals.memory} color="bg-blue-600" subtext="Buffer: STABLE" />
              <VitalItem label="VOID_INT" value={vitals.void_integrity} color="bg-purple-600" subtext="Integrity: NOMINAL" />
            </div>
          </section>
          
          <div className="h-px bg-gradient-to-r from-transparent via-red-900/20 to-transparent" />

          <section className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-bold text-zinc-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal className="w-3 h-3 text-red-600" /> Shadow_Ledger
            </h2>
            <div className="flex-1 overflow-y-auto text-[10px] space-y-2 text-zinc-600 scrollbar-hide font-mono">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 items-start group"
                  >
                    <span className="text-red-900 font-bold opacity-50 group-hover:opacity-100 transition-opacity">»</span>
                    <span className="leading-tight break-all">{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          <div className="p-4 border border-red-900/20 bg-red-950/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3 h-3 text-red-600" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Security_Protocol</span>
            </div>
            <p className="text-[8px] text-zinc-600 leading-relaxed uppercase">
              Architect_ID: 7421396215<br/>
              Status: AUTHORIZED<br/>
              Encryption: VOID-256
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(153,27,27,0.05),transparent)] pointer-events-none"></div>
          
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide relative z-10"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Skull className="w-48 h-48 text-red-900 mb-8 animate-pulse" />
                <div className="text-center max-w-sm">
                  <p className="text-lg font-bold tracking-[0.5em] mb-2 uppercase">The Abyss</p>
                  <p className="text-xs italic tracking-widest">\"THE ABYSS DOES NOT GAZE BACK. IT CONSUMES.\"</p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "architect" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex gap-6", msg.role === "architect" ? "flex-row-reverse" : "flex-row")}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500",
                    msg.role === "architect" 
                      ? "bg-zinc-900 border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                      : "bg-red-950/20 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  )}>
                    {msg.role === "architect" ? <User className="w-5 h-5 text-zinc-500" /> : <Skull className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] p-6 rounded-xl relative group",
                    msg.role === "architect" 
                      ? "bg-zinc-900/40 text-zinc-300 border border-zinc-800/50" 
                      : "bg-red-950/5 text-zinc-100 border border-red-900/10"
                  )}>
                    <div className={cn(
                      "text-[9px] uppercase tracking-[0.3em] mb-4 font-bold",
                      msg.role === "architect" ? "text-zinc-600" : "text-red-900"
                    )}>
                      {msg.role === "architect" ? "Architect" : "Azrael"}
                    </div>
                    <div className="markdown-body prose prose-invert prose-sm max-w-none">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                    {/* Decorative corner */}
                    <div className={cn(
                      "absolute top-0 w-2 h-2 border-t border-l",
                      msg.role === "architect" ? "left-0 border-zinc-700" : "right-0 border-red-900/50"
                    )} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-950/20 border border-red-900/50 animate-pulse">
                  <Skull className="w-5 h-5 text-red-600" />
                </div>
                <div className="bg-red-950/5 border border-red-900/10 p-6 rounded-xl text-red-500 text-xs italic flex items-center gap-3 animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1 h-1 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1 h-1 bg-red-900 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  AZRAEL IS DECRYPTING...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-8 border-t border-red-900/10 bg-black/90 backdrop-blur-xl relative z-20"
          >
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-lg"></div>
              <div className="relative flex items-center">
                <Terminal className="absolute left-4 w-4 h-4 text-zinc-700 group-focus-within:text-red-900 transition-colors" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Issue directive to the Void..."
                  className="w-full bg-zinc-950/50 border border-zinc-800/50 focus:border-red-600 focus:ring-0 text-zinc-100 p-5 pl-12 pr-16 rounded-xl text-xs font-mono placeholder:text-zinc-800 transition-all"
                />
                <button 
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="absolute right-4 p-2 text-zinc-600 hover:text-red-600 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-[8px] text-zinc-800 uppercase tracking-[0.5em] font-bold">
                Architect_Authorization_Required // 18+ Protocol // Secure_Link: ESTABLISHED
              </span>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-8 border-t border-red-900/10 bg-zinc-950 flex items-center justify-between px-6 text-[8px] uppercase tracking-[0.4em] text-zinc-700 font-bold">
        <div className="flex gap-8">
          <span className="hover:text-zinc-500 transition-colors cursor-default">Build: 1.7.9.2_VOID</span>
          <span className="hover:text-zinc-500 transition-colors cursor-default">Region: ABYSS_NORTH</span>
          <span className="hover:text-zinc-500 transition-colors cursor-default">Node: AZ-01</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2"><Zap className="w-2.5 h-2.5 text-red-900" /> Latency: 0.001ms</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
            <span className="text-red-900">Live_Feed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function VitalItem({ label, value, color, subtext }: { label: string; value: number; color: string; subtext?: string }) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] mb-2 uppercase tracking-[0.2em] font-bold">
        <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</span>
        <span className="text-zinc-600 group-hover:text-red-600 transition-colors">{value}%</span>
      </div>
      <div className="h-1 bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-900/30">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", color)}
        />
      </div>
      {subtext && (
        <div className="mt-1.5 text-[7px] text-zinc-700 uppercase tracking-widest text-right italic">
          {subtext}
        </div>
      )}
    </div>
  );
}
