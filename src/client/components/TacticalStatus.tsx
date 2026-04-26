import { Shield, AlertTriangle, Lock, Radio, Eye, EyeOff } from 'lucide-react';

export type CompartmentStatus = 'active' | 'suspicious' | 'quarantined' | 'terminated';

export interface CompartmentInfo {
  session_id: string;
  status: CompartmentStatus;
  threat_score: number;
  memory_used: bigint;
  cycles_consumed: bigint;
  created_at: bigint;
  tee_verified: boolean;
}

export function TacticalStatus({ status, threatScore, teeVerified }: { status: CompartmentStatus, threatScore: number, teeVerified: boolean }) {
  const indicators = {
    active: { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', text: 'SECURE' },
    suspicious: { icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10', text: 'WATCHED' },
    quarantined: { icon: EyeOff, color: 'text-orange-400', bg: 'bg-orange-500/10', text: 'AIRGAP' },
    terminated: { icon: Lock, color: 'text-rose-400', bg: 'bg-rose-500/10', text: 'WIPED' },
  };
  
  const ind = indicators[status] || indicators.active;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded ${ind.bg} border border-${ind.color.split('-')[1]}-500/20`}>
      <ind.icon size={14} className={ind.color} />
      <span className={`text-xs font-bold ${ind.color}`}>{ind.text}</span>
      {threatScore > 0 && (
        <span className="text-[10px] text-neutral-500">
          RISK: {threatScore}
        </span>
      )}
      {teeVerified && (
        <Radio size={12} className="text-emerald-400" />
      )}
    </div>
  );
}

// Kill switch controls (controller only)
export function EmergencyPanel({ isController, onTrigger }: { isController: boolean, onTrigger: (type: string) => void }) {
  if (!isController) return null;
  
  return (
    <div className="border border-rose-500/30 bg-rose-950/10 p-4 rounded-lg">
      <h3 className="text-rose-400 font-bold flex items-center gap-2 mb-3">
        <AlertTriangle size={16} />
        EMERGENCY CONTROLS
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => onTrigger('ProxyHalt')}
          className="px-3 py-2 bg-rose-500/20 text-rose-300 rounded text-sm hover:bg-rose-500/30 transition-colors"
        >
          HALT PROXIES
        </button>
        <button 
          onClick={() => onTrigger('SessionFreeze')}
          className="px-3 py-2 bg-rose-500/20 text-rose-300 rounded text-sm hover:bg-rose-500/30 transition-colors"
        >
          FREEZE SESSIONS
        </button>
        <button 
          onClick={() => onTrigger('DeadDrop')}
          className="px-3 py-2 bg-rose-500 text-rose-950 rounded text-sm font-bold hover:bg-rose-400 transition-colors"
        >
          DEAD DROP ALL
        </button>
        <button 
          onClick={() => onTrigger('FullLockdown')}
          className="px-3 py-2 bg-neutral-950 text-rose-500 border border-rose-500 rounded text-sm font-bold hover:bg-rose-500/10 transition-colors"
        >
          FULL LOCKDOWN
        </button>
      </div>
    </div>
  );
}
