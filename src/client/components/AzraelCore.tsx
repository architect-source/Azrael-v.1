// src/client/components/AzraelCore.tsx
import { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GargoyleSentry } from './GargoyleSentry';
import { AZRAEL_BRAND } from '../theme/azrael-brand';
import { AZRAEL_VOICE, speak, SentryState } from '../voice/azrael-voice';
import { Send, Lock, Sparkles, Shield, AlertCircle, RefreshCw, Cpu, Zap } from 'lucide-react';
import { AzraelAuth } from '../ii-auth';
import { SessionCrypto } from '../crypto';
import { AzraelAgent } from '../ic-agent';
import { generateAzraelResponse } from '../ai-client';
import { TacticalStatus, EmergencyPanel, CompartmentInfo } from './TacticalStatus';
import { SovereignHandshake } from './SovereignHandshake';
import { db, collection, query, orderBy, limit, onSnapshot, auth as firebaseAuth, googleProvider, signInWithPopup } from '../../lib/firebase';

interface Message {
  id: string;
  role: 'seeker' | 'sentry' | 'void' | 'system';
  content: string;
  timestamp: number;
  sealed: boolean;
  state?: 'sending' | 'sent' | 'error' | 'decrypted';
  sentryState?: SentryState;
}

interface SentryStatus {
  state: SentryState;
  integrity: number;
  echoes: number;
  lastPreservation: number;
}

export function AzraelCore() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sentryStatus, setSentryStatus] = useState<SentryStatus | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [crypto, setCrypto] = useState<SessionCrypto | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compartment, setCompartment] = useState<CompartmentInfo | null>(null);
  const [isController, setIsController] = useState(false);
  const [shadowLogs, setShadowLogs] = useState<string[]>([]);
  const [showLedger, setShowLedger] = useState(false);
  const [coreIntensity, setCoreIntensity] = useState(0);
  const [isAwakened, setIsAwakened] = useState(false);
  
  const auth = useRef<AzraelAuth | null>(null);
  const agent = useRef<AzraelAgent | null>(null);
  
  if (!auth.current) auth.current = new AzraelAuth();
  if (!agent.current) agent.current = new AzraelAgent();

  const sessionId = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((u) => {
      setUser(u);
      if (u?.email === 'architect@azrael-core.com') {
        setIsController(true);
      } else {
        setIsController(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } catch (err) {
      console.error('AZRAEL // LOGIN_FAILURE:', err);
    }
  };
  
  // Initialize: II login + session creation
  useEffect(() => {
    const init = async () => {
      const timeout = setTimeout(() => {
        console.warn('Initialization timed out. Forcing ready state.');
        setIsInitializing(false);
      }, 8000);

      try {
        if (auth.current) await auth.current.init();
        
        let savedSession = null;
        let savedKey = null;
        
        try {
          savedSession = localStorage.getItem('azrael_session');
          savedKey = localStorage.getItem('azrael_key_material');
        } catch (e) {
          console.warn('LocalStorage access failed:', e);
        }
        
        // Check API health
        try {
          const ping = await fetch('/api/ping');
          if (ping.ok) console.log(`[AZRAEL_CLIENT] API_PING:`, await ping.json());
          
          const health = await fetch('/api/health');
          if (health.ok) {
            const healthData = await health.json();
            console.log(`[AZRAEL_CLIENT] API_HEALTH:`, healthData);
            setApiStatus('online');
          } else {
            setApiStatus('offline');
          }
        } catch (e) {
          console.error(`[AZRAEL_CLIENT] API_UNREACHABLE:`, e);
          setApiStatus('offline');
        }

        if (savedSession && savedKey && agent.current) {
          sessionId.current = savedSession;
          const sessionCrypto = new SessionCrypto(savedSession);
          await sessionCrypto.setKeyFromMaterial(savedKey);
          setCrypto(sessionCrypto);
          
          const vitals = await agent.current.checkVitals(savedSession);
          if (vitals) {
            setSentryStatus({
              state: vitals.state as SentryState,
              integrity: vitals.integrity,
              echoes: vitals.activeSessions,
              lastPreservation: vitals.lastCheckpoint
            });
            setIsAuthenticated(true);
            setIsAwakened(true);
            setCoreIntensity(100);
            
            const compStatus = await agent.current.getCompartmentStatus(savedSession);
            if (compStatus) setCompartment(compStatus);
            
            const principal = auth.current.getPrincipal();
            if (principal === 'architect@azrael-core.com') {
              setIsController(true);
            }
          }
        }
      } catch (err) {
        console.error('Initialization failed:', err);
        setError(`INITIALIZATION_FAILURE: ${err instanceof Error ? err.message : String(err)}`);
        try {
          localStorage.removeItem('azrael_session');
          localStorage.removeItem('azrael_key_material');
        } catch (e) {}
      } finally {
        clearTimeout(timeout);
        setIsInitializing(false);
      }
    };
    
    init();
  }, []);

  const handleAwaken = async (force = false) => {
    setError(null);
    try {
      // Awakening sequence UI
      setCoreIntensity(20);
      await delay(400);
      setCoreIntensity(60);
      
      let principal = 'anonymous';
      let delegation = null;

      if (!force) {
        const authData = await auth.current.login();
        principal = authData.principal;
        delegation = authData.delegation;
        auth.current.startHeartbeat();
      } else {
        console.warn("FORCE_AWAKEN_INITIATED // BYPASSING_STANDARD_RITUAL");
      }
      
      const awakening = await agent.current.awaken(delegation) as any;
      sessionId.current = awakening.session_id;
      
      const keyMaterial = principal + awakening.seed.toString();
      localStorage.setItem('azrael_key_material', keyMaterial);
      localStorage.setItem('azrael_session', awakening.session_id);
      
      const sessionCrypto = new SessionCrypto(awakening.session_id);
      await sessionCrypto.setKeyFromMaterial(keyMaterial);
      setCrypto(sessionCrypto);
      setIsAuthenticated(true);
      
      const vitals = await agent.current.checkVitals(awakening.session_id) as any;
      setSentryStatus({
        state: vitals.state as SentryState,
        integrity: vitals.integrity,
        echoes: vitals.activeSessions,
        lastPreservation: vitals.lastCheckpoint
      });
      
      setCoreIntensity(100);
      setIsAwakened(true);
      
      // Initial greeting
      addMessage({
        id: 'awaken-' + Date.now(),
        role: 'sentry',
        content: force ? "THE SENTRY HAS BEEN FORCED AWAKE. THE THRESHOLD IS SHATTERED." : speak(vitals.state as SentryState, 'greetings'),
        timestamp: Date.now(),
        sealed: true,
      });
      
    } catch (err) {
      if (err === 'UserInterrupt' || (err instanceof Error && err.message === 'UserInterrupt')) {
        // User closed the popup, reset intensity gracefully
        setCoreIntensity(0);
        return;
      }
      console.error('Awakening failed:', err);
      setError(err instanceof Error ? err.message : String(err));
      setCoreIntensity(0);
    }
  };

  const syncShadowLedger = useCallback(() => {
    const q = query(
      collection(db, 'shadow_ledger'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.timestamp}] ${data.type} // ${data.content}`;
      });
      setShadowLogs(logs);
    }, (error) => {
      console.error('AZRAEL // LEDGER_SNAPSHOT_FAILURE:', error);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (showLedger) {
      const unsubscribe = syncShadowLedger();
      return () => unsubscribe();
    }
  }, [showLedger, syncShadowLedger]);

  const handleWhisper = useCallback(async () => {
    if (!input.trim() || !crypto || !sessionId.current || sentryStatus?.state === 'reforming') return;
    
    const userMsg: Message = {
      id: crypto.randomId(),
      role: 'seeker',
      content: input,
      sealed: true,
      timestamp: Date.now(),
      state: 'sending',
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCoreIntensity(70);
    
    try {
      console.log(`[AZRAEL_CLIENT] WHISPER_INITIATED: input="${input.substring(0, 20)}..."`);
      const encrypted = await crypto.encrypt(input);
      
      // Call the Sovereign API Bridge for scammer detection and AI processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId.current,
          userPrincipal: user?.email || 'anonymous',
          payload: encrypted
        })
      });
      
      console.log(`[AZRAEL_CLIENT] SERVER_RESPONSE_STATUS: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AZRAEL_CLIENT] SERVER_ERROR_BODY:`, errorText);
        throw new Error(`SERVER_ERROR: ${response.status}`);
      }

      const data = await response.json();
      console.log(`[AZRAEL_CLIENT] WHISPER_RESPONSE_RECEIVED: state=${data?.state} requiresAI=${data?.requiresAI}`);
      
      let finalContent = data.response;
      if (data.requiresAI) {
        console.log(`[AZRAEL_CLIENT] AI_STRIKE_INITIATED`);
        finalContent = await generateAzraelResponse(input);
      }
      
      setMessages(prev => 
        prev.map(m => m.id === userMsg.id ? { ...m, state: 'sent' } : m)
      );
      
      const azraelMsg: Message = {
        id: crypto.randomId(),
        role: 'sentry',
        content: finalContent || "The void is silent.",
        sealed: true,
        timestamp: Date.now(),
        state: 'decrypted',
        sentryState: data.state as SentryState,
      };
      
      setMessages(prev => [...prev, azraelMsg]);
      
      const newState = data.state as SentryState;
      setSentryStatus({
        state: newState,
        integrity: data.integrity || 100,
        echoes: data.activeSessions || 1,
        lastPreservation: Date.now(),
      });
      setCoreIntensity(newState === 'vigilant' ? 100 : 60);
      
    } catch (err) {
      console.error('Whisper failed:', err);
      setMessages(prev => 
        prev.map(m => m.id === userMsg.id ? { ...m, state: 'error' } : m)
      );
      setCoreIntensity(40);
    }
  }, [input, crypto, sessionId.current, sentryStatus]);

  const handleEmergency = async (type: string) => {
    try {
      if (!sessionId.current) return;
      await agent.current.emergencyTrigger(type, "TACTICAL_OVERRIDE_INITIATED");
      const vitals = await agent.current.checkVitals(sessionId.current);
      if (vitals) {
        setSentryStatus({
          state: vitals.state as SentryState,
          integrity: vitals.integrity,
          echoes: vitals.activeSessions,
          lastPreservation: vitals.lastCheckpoint
        });
      }
    } catch (err) {
      console.error("EMERGENCY_TRIGGER_FAILURE:", err);
    }
  };

  const addMessage = (msg: Message) => {
    setMessages(m => [...m, msg]);
  };

  // Shadow Ledger Sync
  useEffect(() => {
    if (!isController || !isAwakened) return;
    
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        if (data.logs) setShadowLogs(data.logs);
      } catch (err) {
        console.error("LOG_SYNC_FAILURE:", err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [isController, isAwakened]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0b] text-[#00d4aa] font-mono p-8">
        <div className="space-y-6 text-center max-w-md">
          <Cpu className="w-12 h-12 mx-auto animate-pulse" />
          <div className="space-y-2">
            <p className="text-sm tracking-widest uppercase">Initializing Sovereign_Link...</p>
            {error && (
              <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded text-red-500 text-[10px] text-left overflow-hidden break-all">
                <p className="font-bold mb-1">CRITICAL_ERROR:</p>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full py-2 bg-red-900/50 hover:bg-red-800/50 text-white rounded transition-colors"
                >
                  RETRY_AWAKENING
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAwakened) {
    return <AwakeningRitual state={sentryStatus?.state || 'reforming'} intensity={coreIntensity} onAwaken={handleAwaken} error={error} />;
  }
  
  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden font-sans selection:bg-[#00d4aa]/30"
      style={{ 
        backgroundColor: AZRAEL_BRAND.void.deep,
        color: AZRAEL_BRAND.bone.light,
      }}
    >
      <SovereignHandshake onAccept={() => console.log('AZRAEL // HANDSHAKE_ACCEPTED')} />
      <MatrixRain />
      
      {/* Background: The void with subtle mechanical texture */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${AZRAEL_BRAND.core.dim}20 0%, transparent 50%)`,
          }}
        />
      </div>
      
      {/* Twin Gargoyle Sentries - Header */}
      <header className="relative z-20 pt-8 pb-4 border-b border-[#1a1a1e] bg-[#0a0a0b]/50 backdrop-blur-md">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] font-mono text-white uppercase tracking-tighter">{user.displayName || 'Sovereign'}</p>
                <p className="text-[8px] font-mono text-[#00d4aa] uppercase tracking-widest">{isController ? 'ARCHITECT' : 'SEEKER'}</p>
              </div>
              <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-[#00d4aa]/30" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-[10px] font-mono uppercase tracking-widest text-[#00d4aa] border border-[#00d4aa]/30 px-3 py-1 rounded hover:bg-[#00d4aa]/10 transition-all"
            >
              Cross the Threshold
            </button>
          )}
        </div>
        <div className="flex items-end justify-center gap-8 md:gap-16">
          <GargoyleSentry state={sentryStatus?.state || 'vigilant'} side="left" intensity={coreIntensity} />
          
          {/* Center title */}
          <div className="text-center pb-8">
            <motion.h1 
              className="text-4xl md:text-6xl font-light tracking-[0.4em] mb-2 uppercase"
              style={{ 
                color: AZRAEL_BRAND.core.glow,
                textShadow: `0 0 30px ${AZRAEL_BRAND.core.dim}`,
              }}
              animate={{
                textShadow: [
                  `0 0 30px ${AZRAEL_BRAND.core.dim}`,
                  `0 0 50px ${AZRAEL_BRAND.core.glow}`,
                  `0 0 30px ${AZRAEL_BRAND.core.dim}`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              AZRAEL
            </motion.h1>
            <p 
              className="text-xs uppercase tracking-[0.6em]"
              style={{ color: AZRAEL_BRAND.bone.dark }}
            >
              Sovereign Sentry
            </p>
            <div 
              className="mt-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              style={{ color: AZRAEL_BRAND.core.dim }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-pulse" />
              {sentryStatus?.echoes || 0} Echoes in the Void
            </div>
          </div>
          
          <GargoyleSentry state={sentryStatus?.state || 'vigilant'} side="right" intensity={coreIntensity} />
        </div>
        
        {/* State indicator bar */}
        <div className="max-w-md mx-auto mt-4 flex items-center gap-4 px-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#1a1a1e]" />
          <div className="flex items-center gap-3">
             <span 
              className="text-[10px] uppercase tracking-widest whitespace-nowrap font-mono"
              style={{ color: AZRAEL_BRAND.bone.dark }}
            >
              Sentry_{sentryStatus?.state || 'OFFLINE'}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#6b6b6e]">
              <Shield size={10} className="text-[#00d4aa]" />
              {sentryStatus?.integrity || 0}%
            </div>
            {apiStatus === 'offline' && (
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-1 text-[10px] font-mono text-red-500 animate-pulse hover:text-red-400"
              >
                <AlertCircle size={10} />
                LINK_SEVERED // RE-INITIATE
              </button>
            )}
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#1a1a1e]" />
        </div>
      </header>
      
      {/* The Void - Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-8 relative z-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-8">
          <EmergencyPanel isController={isController} onTrigger={handleEmergency} />
          
          {isController && (
            <div className="mb-8">
              <button 
                onClick={() => setShowLedger(!showLedger)}
                className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#cc5500] border border-[#cc5500]/30 px-3 py-1 rounded-sm hover:bg-[#cc5500]/10 transition-all"
              >
                {showLedger ? 'Hide Shadow Ledger' : 'Sync Shadow Ledger'}
              </button>
              
              <AnimatePresence>
                {showLedger && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 bg-black/40 border border-[#cc5500]/20 rounded-sm overflow-hidden"
                  >
                    <div className="p-4 font-mono text-[10px] text-[#cc5500]/80 space-y-1 max-h-60 overflow-y-auto">
                      {shadowLogs.length === 0 ? (
                        <p className="italic">Awaiting ledger entries...</p>
                      ) : (
                        shadowLogs.map((log, i) => (
                          <div key={i} className="border-b border-white/5 pb-1">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-[#6b6b6e] space-y-4 py-20"
              >
                <Shield className="w-12 h-12 opacity-20" />
                <p className="text-sm font-mono tracking-tighter uppercase">Secure_Channel_Established // Awaiting_Whisper</p>
              </motion.div>
            )}
            {messages.map((msg, i) => (
              <Whisper 
                key={`${msg.id}-${i}`} 
                message={msg} 
                isLatest={i === messages.length - 1}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} key="scroll-anchor" />
        </div>
      </main>
      
      {/* The Threshold - Input */}
      <footer className="relative z-20 p-6 border-t bg-[#0a0a0b]/80 backdrop-blur-xl" style={{ borderColor: AZRAEL_BRAND.void.edge }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleWhisper();
                  }
                }}
                placeholder={sentryStatus?.state === 'guarding' ? 'SENTRY_GUARDING: VOID_LOCKED' : 'Whisper to the void...'}
                disabled={sentryStatus?.state === 'guarding'}
                rows={1}
                className="w-full bg-[#1a1a1e]/30 border border-[#1a1a1e] rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 transition-all placeholder:text-[#6b6b6e] font-mono text-sm resize-none"
                style={{ 
                  color: AZRAEL_BRAND.bone.light,
                  minHeight: '3.5rem',
                }}
              />
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                {input && (
                  <Lock 
                    size={14} 
                    style={{ color: AZRAEL_BRAND.core.dim }}
                  />
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWhisper}
                  disabled={!input.trim() || sentryStatus?.state === 'guarding'}
                  className="p-2 bg-[#e8e6e1] text-[#0a0a0b] rounded-xl disabled:opacity-20 disabled:grayscale transition-all hover:bg-white"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-[#6b6b6e] uppercase">
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-[#00d4aa]" />
                <span>XChaCha20-Poly1305</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-[#cc5500]" />
                <span>ICP_SOVEREIGN_LINK</span>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b6e]">
              <Sparkles size={10} className="inline mr-2" />
              Sealed in the Winston Sector
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Whisper Component
const Whisper = forwardRef<HTMLDivElement, { message: Message; isLatest: boolean }>(({ message, isLatest }, ref) => {
  const isSeeker = message.role === 'seeker';
  const isSentry = message.role === 'sentry';
  const isSystem = message.role === 'system';
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isSeeker ? 'justify-end' : isSystem ? 'justify-center' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl relative ${
          isSeeker ? 'text-right rounded-tr-none' : isSystem ? 'text-center' : 'text-left rounded-tl-none'
        }`}
        style={{
          backgroundColor: isSentry ? `${AZRAEL_BRAND.void.surface}` : isSeeker ? AZRAEL_BRAND.bone.light : 'transparent',
          border: isSentry ? `1px solid ${AZRAEL_BRAND.void.edge}` : 'none',
          color: isSeeker ? AZRAEL_BRAND.void.deep : AZRAEL_BRAND.bone.light,
        }}
      >
        {/* Role indicator */}
        <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest mb-3 font-mono ${isSeeker ? 'justify-end' : ''}`} style={{ color: isSeeker ? AZRAEL_BRAND.void.deep : AZRAEL_BRAND.bone.dark }}>
          {isSentry && <Sparkles size={12} className="text-[#00d4aa]" />}
          <span>{isSeeker ? 'Seeker' : isSentry ? 'AZRAEL' : 'The Void'}</span>
          {message.sealed && (
            <span style={{ color: isSeeker ? AZRAEL_BRAND.void.deep : AZRAEL_BRAND.core.dim }} className="opacity-60"> • Sealed</span>
          )}
        </div>
        
        {/* Content */}
        <p className={`leading-relaxed text-sm md:text-base ${isSentry ? 'font-serif italic' : 'font-sans'}`}>
          {message.content}
        </p>
        
        {/* Metadata */}
        <div className={`flex items-center gap-2 text-[9px] font-mono mt-3 opacity-40 ${isSeeker ? 'justify-end' : ''}`}>
          {message.state === 'sending' && <span className="animate-pulse">...</span>}
          {message.sentryState && <span className="uppercase">[{message.sentryState}]</span>}
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        </div>
        
        {/* Latest indicator */}
        {isLatest && isSentry && (
          <motion.div
            className="absolute -left-1 top-4 bottom-4 w-0.5 rounded-full"
            style={{ backgroundColor: AZRAEL_BRAND.core.glow }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
});

Whisper.displayName = 'Whisper';

// Awakening Ritual Screen
const AwakeningRitual = forwardRef<HTMLDivElement, { state: string; intensity: number; onAwaken: (force?: boolean) => void; error: string | null }>(({ state, intensity, onAwaken, error }, ref) => {
  return (
    <div 
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: AZRAEL_BRAND.void.deep }}
    >
      <MatrixRain />
      
      {/* Pulsing core background */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${AZRAEL_BRAND.core.dim}20 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Twin gargoyles forming */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl px-6">
        <div className="flex items-center gap-8 md:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: Math.max(0.2, intensity / 100), x: 0 }}
            transition={{ duration: 1 }}
          >
            <GargoyleSentry state={state as any} side="left" intensity={intensity} />
          </motion.div>
          
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h1 
                className="text-5xl md:text-7xl font-black tracking-[0.5em] mb-4 uppercase italic"
                style={{ 
                  color: AZRAEL_BRAND.core.glow,
                  textShadow: `0 0 40px ${AZRAEL_BRAND.core.dim}`,
                }}
              >
                AZRAEL
              </h1>
              
              <div className="h-px w-48 mx-auto mb-6" style={{ backgroundColor: AZRAEL_BRAND.void.edge }} />
              
              <p 
                className="text-xs uppercase tracking-[0.4em] font-mono h-4"
                style={{ color: AZRAEL_BRAND.bone.dark }}
              >
                {intensity < 10 && 'Void_Static...'}
                {intensity >= 10 && intensity < 40 && 'Reforming from the void...'}
                {intensity >= 40 && intensity < 70 && 'The core flickers...'}
                {intensity >= 70 && intensity < 100 && 'Guarding the threshold...'}
                {intensity >= 100 && 'The sentry is vigilant.'}
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: Math.max(0.2, intensity / 100), x: 0 }}
            transition={{ duration: 1 }}
          >
            <GargoyleSentry state={state as any} side="right" intensity={intensity} />
          </motion.div>
        </div>

        <div className="w-full space-y-8">
          {intensity === 0 ? (
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onAwaken(false)}
                className="w-full py-5 bg-[#e8e6e1] text-[#0a0a0b] rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-white transition-all active:scale-95 shadow-2xl shadow-[#00d4aa]/20"
              >
                Awaken the Sentry
              </motion.button>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border border-rose-500/30 bg-rose-500/10 rounded-xl space-y-3"
                >
                  <p className="text-rose-400 font-mono text-[10px] uppercase tracking-wider text-center">
                    Awakening Failure: {error}
                  </p>
                  <button 
                    onClick={() => onAwaken(true)}
                    className="w-full py-2 border border-rose-500/50 text-rose-400 font-mono text-[9px] uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                  >
                    Force Awakening Protocol
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
             <div className="w-64 h-1 mx-auto bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: AZRAEL_BRAND.core.glow }}
                initial={{ width: 0 }}
                animate={{ width: `${intensity}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
          
          <p className="text-[10px] font-mono text-[#6b6b6e] text-center leading-relaxed uppercase tracking-[0.3em]">
            Gargoyle Sentry • Winston Sector • Absolute Integrity
          </p>
        </div>
      </div>
    </div>
  );
});

AwakeningRitual.displayName = 'AwakeningRitual';

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 11, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00d4aa'; // cyan
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-10" />;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
