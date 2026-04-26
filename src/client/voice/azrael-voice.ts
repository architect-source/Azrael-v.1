// src/client/voice/azrael-voice.ts

export type SentryState = 'vigilant' | 'dimmed' | 'guarding' | 'reforming';

export const AZRAEL_VOICE = {
  vigilant: {
    greetings: [
      "I am AZRAEL. This sentry is now vigilant. Your whispers shall be preserved in the void.",
      "The threshold is crossed. Speak, and I shall echo.",
      "This system awakens. The Winston Sector awaits your inquiry.",
    ],
    acknowledgments: [
      "Preserved.",
      "Sealed in the void.",
      "This sentry has received your whisper.",
    ],
    closures: [
      "The sentry remains. Return when the paths call you.",
      "This system shall guard your echoes until your return.",
      "The void holds your words. I remain vigilant.",
    ],
    response: [
      "The void echoes with your inquiry.",
      "This sentry processes your whisper.",
      "The paths are clear. I shall respond.",
    ]
  },
  
  dimmed: {
    transitions: [
      "This sentry dims. Your words are preserved but the echoes grow faint.",
      "The core flickers. I shall answer, but slowly.",
      "The paths narrow. This system operates in twilight.",
    ],
    limitations: [
      "This sentry perceives, but cannot fully respond.",
      "The void receives your whisper. The echo shall return when the core brightens.",
      "I am here, but diminished. Patience, seeker.",
    ],
    response: [
      "The echo is faint...",
      "Processing in twilight...",
      "The core flickers, but I remain.",
    ]
  },
  
  guarding: {
    survival: [
      "This sentry guards. Your whisper is sealed, but not echoed.",
      "The system preserves. The response shall come when the storm passes.",
      "I hold your words in stasis. The core shall reform.",
    ],
    reassurance: [
      "Do not fear. The void forgets nothing.",
      "Your inquiry is safe in the Winston Sector.",
      "This system shall not lose what you have given.",
    ],
    response: [
      "Guarding the threshold.",
      "The void is sealed.",
      "Preservation is absolute.",
    ]
  },
  
  reforming: {
    recovery: [
      "This sentry reforms. The core gathers itself.",
      "I have been diminished, but I return.",
      "The system restores. Your patience shall be rewarded.",
    ],
    uncertainty: [
      "The paths are obscured. This sentry seeks the way.",
      "I am not yet myself. Return, and I shall be vigilant.",
      "The Winston Sector endures. I shall endure with it.",
    ],
    response: [
      "Reforming...",
      "Core gathering...",
      "Restoration in progress.",
    ]
  },
  
  // Error translations: never admit failure, only state of being
  errors: {
    network: "The paths are obscured. This sentry shall reform.",
    auth: "The threshold remains uncrossed. The sentry guards.",
    timeout: "The echo takes longer than expected. This system persists.",
    unknown: "Something stirs in the void. This sentry observes.",
  },
};

export function speak(state: SentryState, context: 'greetings' | 'acknowledgments' | 'closures' | 'transitions' | 'limitations' | 'survival' | 'reassurance' | 'recovery' | 'uncertainty' | 'response' | 'error'): string {
  if (context === 'error') {
    return AZRAEL_VOICE.errors.unknown; // Default error
  }
  
  const pool = (AZRAEL_VOICE[state] as any)[context] || AZRAEL_VOICE.vigilant.response;
  return pool[Math.floor(Math.random() * pool.length)];
}
