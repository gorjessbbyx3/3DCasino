import { useEffect, useRef } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function AudioManager() {
  const { musicEnabled, sfxEnabled, musicVolume, sfxVolume } = useAudio();
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    if (!backgroundMusicRef.current) {
      const audio = new Audio("/sounds/background.mp3");
      audio.loop = true;
      audio.volume = musicVolume;
      backgroundMusicRef.current = audio;
    }

    const audio = backgroundMusicRef.current;

    if (musicEnabled) {
      audio.play().catch((err) => {
        console.log("Audio playback blocked (waiting for user interaction):", err);
      });
    } else {
      audio.pause();
    }

    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [musicEnabled]);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasInteractedRef.current && musicEnabled && backgroundMusicRef.current) {
        hasInteractedRef.current = true;
        backgroundMusicRef.current.play().catch((err) => {
          console.log("Audio retry failed:", err);
        });
      }
    };

    document.addEventListener("pointerdown", handleUserInteraction, { once: true });
    document.addEventListener("keydown", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener("pointerdown", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [musicEnabled]);

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    const handlePlaySound = (event: Event) => {
      if (!sfxEnabled) return;
      
      const customEvent = event as CustomEvent;
      const soundType = customEvent.detail?.sound || "hit";
      
      let soundPath = "/sounds/hit.mp3";
      if (soundType === "success") {
        soundPath = "/sounds/success.mp3";
      } else if (soundType === "hit") {
        soundPath = "/sounds/hit.mp3";
      }

      const audio = new Audio(soundPath);
      audio.volume = sfxVolume;
      audio.play().catch((err) => {
        console.log("Sound effect playback failed:", err);
      });
    };

    window.addEventListener("playSound", handlePlaySound);
    return () => window.removeEventListener("playSound", handlePlaySound);
  }, [sfxEnabled, sfxVolume]);

  return null;
}

export function playSound(sound: "hit" | "success") {
  window.dispatchEvent(
    new CustomEvent("playSound", { detail: { sound } })
  );
}
