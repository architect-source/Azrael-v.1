// src/client/theme/azrael-brand.ts
export const AZRAEL_BRAND = {
  // Core cyan from the mechanical hearts
  core: {
    bright: '#00f0d0',      // Active, vigilant
    glow: '#00d4aa',        // Standard cyan
    dim: '#006b55',         // Dimmed state
    pulse: '#00ffcc',       // Heartbeat flash
  },
  
  // Void and steel from the gargoyle armor
  void: {
    deep: '#050505',        // Background
    surface: '#0a0a0b',     // Cards, containers
    raised: '#141416',      // Elevated elements
    edge: '#1a1a1e',        // Borders
  },
  
  // Bone and ash from the skulls/dead
  bone: {
    light: '#e8e6e1',       // Primary text
    medium: '#b8b6b1',      // Secondary text
    dark: '#6b6b6e',        // Tertiary, disabled
    ash: '#3a3a3c',         // Subtle elements
  },
  
  // Warning states from the "war" aesthetic
  war: {
    ember: '#cc5500',       // Caution, dimmed
    blood: '#8b0000',       // Critical, guarding
    rust: '#8b4513',        // Degraded hardware
  },
  
  // The twin gargoyle symmetry
  symmetry: {
    left: 'linear-gradient(90deg, #00d4aa 0%, transparent 100%)',
    right: 'linear-gradient(270deg, #00d4aa 0%, transparent 100%)',
    both: 'radial-gradient(circle, #00d4aa 0%, #006b55 50%, transparent 100%)',
  },
};
