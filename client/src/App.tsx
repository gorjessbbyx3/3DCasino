import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CasinoScene } from "./components/CasinoScene";
import { AuthModal } from "./components/AuthModal";
import { CashierModal } from "./components/CashierModal";
import { SlotMachineModal } from "./components/SlotMachineModal";
import { StatsModal } from "./components/StatsModal";
import { AgeGateModal } from "./components/AgeGateModal";
import { DailyCheckInModal } from "./components/DailyCheckInModal";
import { SpinWheelModal } from "./components/SpinWheelModal";
import { LandscapePrompt } from "./components/LandscapePrompt";
import { AudioManager } from "./components/AudioManager";
import { AudioControls } from "./components/AudioControls";
import { Navigation } from "./components/Navigation";
import { useUser } from "./lib/stores/useUser";
import { Toaster } from "sonner";
import "@fontsource/inter";

function App() {
  const { user, setUser, setLoading } = useUser();

  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!isLoading) {
      if (userData && !isError) {
        setUser(userData as any);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [userData, isLoading, isError, setUser, setLoading]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <LandscapePrompt />
      <AgeGateModal />
      <Navigation />
      <CasinoScene />
      <AuthModal />
      <CashierModal />
      <StatsModal />
      <DailyCheckInModal />
      <SpinWheelModal />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <SlotMachineModal key={num} machineNumber={num} />
      ))}
      <AudioManager />
      <AudioControls />
      <Toaster position="top-right" richColors />

      <div className="absolute bottom-8 left-0 right-0 z-10 text-center opacity-60">
        <div className="inline-flex items-center gap-3 glass-morphism px-4 py-2 rounded-xl border border-purple-400/30 shadow-lg shadow-purple-500/20">
          <p className="text-gradient-casino text-xs font-medium tracking-wide">
            🖱️ Click floor to move • Drag to look around • 🎮 Click games to play
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;