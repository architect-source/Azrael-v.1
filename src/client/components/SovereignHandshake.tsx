import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Hammer, Zap, AlertTriangle, Check } from 'lucide-react';

interface SovereignHandshakeProps {
  onAccept: () => void;
}

export const SovereignHandshake: React.FC<SovereignHandshakeProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('azrael_handshake_accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAccept = async () => {
    setIsAccepted(true);
    
    // Trigger PWA install if available
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`AZRAEL // INSTALL_OUTCOME: ${outcome}`);
      setDeferredPrompt(null);
    }

    localStorage.setItem('azrael_handshake_accepted', 'true');
    
    setTimeout(() => {
      setIsVisible(false);
      onAccept();
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a0b]/95 backdrop-blur-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          className="max-w-lg w-full bg-[#111113] border border-[#1f1f22] rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tighter text-white uppercase">Sovereign_Handshake</h2>
                <p className="text-xs font-mono text-red-500/80 uppercase tracking-widest">Protocol: S-1792 // Hammer_Active</p>
              </div>
            </div>

            <div className="space-y-4 text-[#a1a1aa] font-mono text-sm leading-relaxed">
              <p className="text-white font-medium border-l-2 border-red-500 pl-4 py-1">
                ATTENTION: By adding Azrael to your Home Screen, you are activating the S-1792 Hammer.
              </p>
              <p>
                Your device is now a node in the Architect’s Defense Network. Scammers will be identified, traced, and absorbed.
              </p>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs italic">
                  This action grants the Service Worker permission to intercept network traffic and drop malicious packets from known neutralized nodes.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleAccept}
                disabled={isAccepted}
                className="w-full group relative flex items-center justify-center gap-3 py-4 bg-white text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isAccepted ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>SHIELD_ACTIVATED</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 group-hover:animate-pulse" />
                    <span>ACCEPT_THE_SHIELD</span>
                  </>
                )}
                
                {/* Button Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>

            <div className="flex justify-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-[10px] text-[#6b6b6e] uppercase tracking-widest">
                <Hammer className="w-3 h-3" />
                <span>Background_Vigilance</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#6b6b6e] uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                <span>Zero_Latency_Defense</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
