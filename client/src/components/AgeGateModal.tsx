import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
        className="sm:max-w-3xl border-0 p-0 overflow-hidden"
        style={{
          backgroundImage: 'url(/age-gate-custom.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        hideClose
      >
        <VisuallyHidden>
          <DialogTitle>Age Verification</DialogTitle>
        </VisuallyHidden>
        
        <div className="relative min-h-[700px] flex flex-col items-center justify-end pb-16 pt-80">
          {/* Age Verification Content - positioned to align with the box in the image */}
          <div className="max-w-md w-full px-8">
            <h2 className="text-3xl font-bold text-yellow-300 mb-4 text-center drop-shadow-lg">
              Age Verification
            </h2>
            
            <p className="text-white text-center mb-6 text-lg leading-relaxed drop-shadow-md font-medium">
              You must be 18 years or older to enter this casino gameroom.
            </p>

            {/* Checkbox */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-black/40 rounded-xl border border-yellow-400/30 backdrop-blur-sm">
              <Checkbox 
                id="age-confirm" 
                checked={isChecked}
                onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                className="w-6 h-6 border-2 border-yellow-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-500"
              />
              <label 
                htmlFor="age-confirm" 
                className="text-white text-base cursor-pointer select-none drop-shadow-md font-medium"
              >
                I confirm that I am 18 years or older
              </label>
            </div>

            {/* Enter Button */}
            <Button
              onClick={handleEnter}
              disabled={!isChecked}
              className="w-full py-6 text-xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-600 text-black shadow-lg shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              ENTER GAMEROOM
            </Button>

            {/* Legal Text */}
            <p className="text-white/80 text-xs text-center mt-4 leading-relaxed drop-shadow-md">
              By entering, you agree that you meet the legal age requirement
              and accept our terms of service.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
