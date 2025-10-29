import { useState } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AudioControls() {
  const { musicEnabled, sfxEnabled, toggleMusic, toggleSfx } = useAudio();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute top-24 right-6 z-20">
      <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/50">
        {!expanded ? (
          <Button
            onClick={() => setExpanded(true)}
            variant="ghost"
            size="lg"
            className="text-gray-300 hover:text-white hover:bg-gray-800/50 p-4"
            title="Audio Controls"
          >
            {musicEnabled || sfxEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </Button>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-gray-700">
              <span className="text-sm font-semibold text-gray-300">Audio Controls</span>
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              <Button
                onClick={toggleMusic}
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-3 ${
                  musicEnabled 
                    ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20" 
                    : "text-gray-500 hover:text-gray-400 hover:bg-gray-800/50"
                }`}
              >
                {musicEnabled ? (
                  <Music className="w-5 h-5" />
                ) : (
                  <Music2 className="w-5 h-5" />
                )}
                <span className="text-sm">
                  Background Music {musicEnabled ? "On" : "Off"}
                </span>
              </Button>

              <Button
                onClick={toggleSfx}
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-3 ${
                  sfxEnabled 
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20" 
                    : "text-gray-500 hover:text-gray-400 hover:bg-gray-800/50"
                }`}
              >
                {sfxEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
                <span className="text-sm">
                  Sound Effects {sfxEnabled ? "On" : "Off"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
