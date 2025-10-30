import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function AgeGateModal() {
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const hasVerified = localStorage.getItem("jadeRoyaleAgeVerified");
    if (!hasVerified) {
      setShowAgeGate(true);
    }
  }, []);

  const handleEnter = () => {
    if (isChecked) {
      localStorage.setItem("jadeRoyaleAgeVerified", "true");
      setShowAgeGate(false);
    }
  };

  return (
    <Dialog open={showAgeGate} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-2xl border-0 p-0 overflow-hidden"
        style={{
          backgroundImage: 'url(/age-gate-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        hideClose
      >
        <div className="relative min-h-[600px] flex flex-col items-center justify-center p-12 bg-black/40 backdrop-blur-sm">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 mb-4 drop-shadow-2xl tracking-wide">
              Jade Royale
            </h1>
            <div className="h-1 w-48 mx-auto bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
          </div>

          {/* Age Verification Box */}
          <div className="bg-black/60 backdrop-blur-md border-2 border-yellow-400/50 rounded-2xl p-10 shadow-2xl shadow-yellow-500/20 max-w-md w-full">
            <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center">
              Age Verification
            </h2>
            
            <p className="text-gray-200 text-center mb-8 text-lg leading-relaxed">
              You must be 18 years or older to enter this casino gameroom.
            </p>

            {/* Checkbox */}
            <div className="flex items-center space-x-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <Checkbox 
                id="age-confirm" 
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                className="w-6 h-6 border-2 border-yellow-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-500"
              />
              <label 
                htmlFor="age-confirm" 
                className="text-white text-lg cursor-pointer select-none"
              >
                I confirm that I am 18 years or older
              </label>
            </div>

            {/* Enter Button */}
            <Button
              onClick={handleEnter}
              disabled={!isChecked}
              className="w-full py-6 text-xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-600 text-black shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              ENTER GAMEROOM
            </Button>

            {/* Legal Text */}
            <p className="text-gray-400 text-xs text-center mt-6 leading-relaxed">
              By entering, you agree that you meet the legal age requirement
              and accept our terms of service.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-yellow-400/30 rounded-tl-2xl"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-yellow-400/30 rounded-tr-2xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-yellow-400/30 rounded-bl-2xl"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-yellow-400/30 rounded-br-2xl"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
