// Fait parler les partenaires avec les voix de l'iPad (`expo-speech`), gratuites et
// incluses dans Expo Go. On ne suppose jamais qu'une voix précise est installée : on
// demande juste une LANGUE à l'OS, qui choisit lui-même une voix installée dans cette
// langue. En cas d'échec malgré tout (langue absente de l'appareil), on retombe sur
// l'anglais sans accent plutôt que de rester silencieux.

import * as Speech from "expo-speech";

import type { Accent } from "@/data/partners";
import type { VoiceSpeed } from "@/state/profile";

const ACCENT_LANGUAGE: Record<Accent, string> = { uk: "en-GB", us: "en-US" };

const SPEED_RATE: Record<VoiceSpeed, number> = { lente: 0.8, normale: 1.0, rapide: 1.2 };

export function speak(text: string, accent: Accent, speed: VoiceSpeed, onDone: () => void) {
  Speech.stop();
  const rate = SPEED_RATE[speed];
  Speech.speak(text, {
    language: ACCENT_LANGUAGE[accent],
    rate,
    onDone,
    onStopped: onDone,
    onError: () => {
      // Repli : l'appareil n'a peut-être pas cette langue installée.
      Speech.speak(text, { rate, onDone, onStopped: onDone, onError: onDone });
    },
  });
}

export function stopSpeaking() {
  Speech.stop();
}
