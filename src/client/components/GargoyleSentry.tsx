// src/client/components/GargoyleSentry.tsx
import { motion } from 'motion/react';
import { AZRAEL_BRAND } from '../theme/azrael-brand';

interface GargoyleProps {
  state: 'vigilant' | 'dimmed' | 'guarding' | 'reforming';
  side: 'left' | 'right';
  intensity?: number; // 0-100, controls glow
}

export function GargoyleSentry({ state, side, intensity = 100 }: GargoyleProps) {
  const isLeft = side === 'left';
  const coreColor = state === 'guarding' 
    ? AZRAEL_BRAND.war.blood 
    : state === 'dimmed' 
    ? AZRAEL_BRAND.war.ember 
    : AZRAEL_BRAND.core.glow;
  
  const glowIntensity = state === 'reforming' ? 0.3 : intensity / 100;
  
  return (
    <div className={`relative w-32 h-48 ${isLeft ? '' : 'scale-x-[-1]'}`}>
      {/* Mechanical wing structure */}
      <svg 
        viewBox="0 0 128 192" 
        className="absolute inset-0 w-full h-full"
        style={{ filter: `drop-shadow(0 0 ${10 * glowIntensity}px ${coreColor})` }}
      >
        {/* Armor plates - industrial gothic */}
        <path
          d="M64 20 L20 60 L30 100 L64 140 L98 100 L108 60 Z"
          fill={AZRAEL_BRAND.void.raised}
          stroke={AZRAEL_BRAND.void.edge}
          strokeWidth="2"
        />
        
        {/* Wing bones - mechanical */}
        <motion.path
          d="M64 20 L10 80 L25 120 M64 20 L118 80 L103 120"
          fill="none"
          stroke={AZRAEL_BRAND.void.edge}
          strokeWidth="3"
          strokeLinecap="round"
          animate={state === 'vigilant' ? {
            d: [
              "M64 20 L10 80 L25 120 M64 20 L118 80 L103 120",
              "M64 25 L12 85 L28 125 M64 25 L116 85 L102 125",
              "M64 20 L10 80 L25 120 M64 20 L118 80 L103 120",
            ],
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Gargoyle face - simplified mechanical */}
        <circle cx="64" cy="70" r="25" fill={AZRAEL_BRAND.void.surface} stroke={AZRAEL_BRAND.void.edge} strokeWidth="2" />
        <ellipse cx="54" cy="65" rx="6" ry="4" fill={AZRAEL_BRAND.bone.dark} /> {/* Left eye socket */}
        <ellipse cx="74" cy="65" rx="6" ry="4" fill={AZRAEL_BRAND.bone.dark} /> {/* Right eye socket */}
        
        {/* Horns - industrial */}
        <path d="M45 50 L35 20 L40 25" fill="none" stroke={AZRAEL_BRAND.void.edge} strokeWidth="4" strokeLinecap="round" />
        <path d="M83 50 L93 20 L88 25" fill="none" stroke={AZRAEL_BRAND.void.edge} strokeWidth="4" strokeLinecap="round" />
        
        {/* Cyan core - the mechanical heart */}
        <motion.circle
          cx="64"
          cy="100"
          r="12"
          fill={coreColor}
          animate={{
            r: [12, 14, 12],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: state === 'vigilant' ? 2 : state === 'reforming' ? 0.5 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Core glow rays */}
        <motion.path
          d="M64 85 L64 75 M64 115 L64 125 M49 100 L39 100 M79 100 L89 100"
          stroke={coreColor}
          strokeWidth="2"
          strokeLinecap="round"
          animate={{
            opacity: [0.3, 0.8, 0.3],
            strokeWidth: [2, 4, 2],
          }}
          transition={{
            duration: state === 'vigilant' ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Skull pile base - from brand image */}
        <path
          d="M20 160 Q64 140 108 160 L108 180 Q64 170 20 180 Z"
          fill={AZRAEL_BRAND.void.surface}
          stroke={AZRAEL_BRAND.void.edge}
        />
      </svg>
      
      {/* Side label from brand image */}
      <div 
        className="absolute bottom-0 left-0 right-0 text-center text-[8px] uppercase tracking-widest"
        style={{ color: AZRAEL_BRAND.bone.dark }}
      >
        GARGOYLE SENTRY — AZRAEL
      </div>
    </div>
  );
}
