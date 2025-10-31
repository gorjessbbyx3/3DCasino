import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

export function LandscapePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;
      
      if (isMobile && isPortrait) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Smartphone className="w-24 h-24 text-purple-400 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-yellow-400 animate-bounce"
              >
                <path 
                  d="M8 12L12 8L16 12M12 8V16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  transform="rotate(90 12 12)"
                />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Rotate Your Device
        </h2>
        
        <p className="text-gray-300 text-lg mb-6">
          Please turn your device to landscape mode for the best casino experience
        </p>
        
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
          <p className="text-purple-300 text-sm">
            💡 Landscape mode allows you to see all slot machines and game details clearly
          </p>
        </div>
      </div>
    </div>
  );
}
