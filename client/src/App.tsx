import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CasinoScene } from "./components/CasinoScene";
import { AuthModal } from "./components/AuthModal";
import { CashierModal } from "./components/CashierModal";
import { SlotMachineModal } from "./components/SlotMachineModal";
import { StatsModal, openStats } from "./components/StatsModal";
import { AudioManager } from "./components/AudioManager";
import { AudioControls } from "./components/AudioControls";
import { useUser } from "./lib/stores/useUser";
import { Coins, LogOut, BarChart3 } from "lucide-react";
import { Button } from "./components/ui/button";
import { apiRequest } from "./lib/queryClient";
import { Toaster } from "sonner";
import "@fontsource/inter";

function App() {
  const { user, setUser } = useUser();

  const { data: userData, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (userData && !isError) {
      setUser(userData as any);
    } else {
      setUser(null);
    }
  }, [userData, isError, setUser]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="absolute top-0 left-0 right-0 z-50 glass-morphism p-6 border-b border-emerald-500/30 animate-border-glow">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl font-bold text-gradient-casino drop-shadow-2xl animate-text-glow tracking-tight">
              💎 Jade Royale
            </h1>
            {user && (
              <div className="flex items-center gap-4 glass-morphism-light px-8 py-4 rounded-2xl border-2 border-yellow-400/70 shadow-2xl shadow-emerald-500/40 animate-glow">
                <div className="relative">
                  <Coins className="w-7 h-7 text-yellow-300 animate-bounce" />
                  <div className="absolute inset-0 animate-ripple bg-yellow-400/30 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-yellow-300/80 font-medium tracking-wider">BALANCE</span>
                  <span className="text-gradient-gold font-bold text-xl tracking-wide animate-shimmer">
                    ${user.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5">
            {user ? (
              <>
                <Button
                  onClick={openStats}
                  variant="outline"
                  size="default"
                  className="glass-morphism-light border-2 border-blue-400/60 hover:border-blue-300 text-blue-200 hover:text-blue-100 transition-all duration-500 shadow-xl hover:shadow-blue-500/40 animate-border-glow group"
                >
                  <BarChart3 className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Stats
                </Button>
                <div className="glass-morphism-light px-4 py-3 rounded-xl border border-emerald-400/30">
                  <div className="text-emerald-300/80 text-sm font-medium tracking-wide">Welcome back,</div>
                  <div className="text-gradient-emerald font-bold text-lg tracking-wide animate-text-glow">{user.username}</div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="default"
                  className="glass-morphism-light border-2 border-red-400/60 hover:border-red-300 text-red-200 hover:text-red-100 transition-all duration-500 shadow-xl hover:shadow-red-500/40 animate-border-glow group"
                >
                  <LogOut className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="glass-morphism px-6 py-3 rounded-2xl border border-emerald-400/40 animate-glow">
                <span className="text-emerald-200 text-base font-medium animate-shimmer">
                  ✨ Click on any game or the cashier to get started
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-0" style={{ width: '100%', height: '100%' }}>
        <CasinoScene />
      </div>
      <AuthModal />
      <CashierModal />
      <StatsModal />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <SlotMachineModal key={num} machineNumber={num} />
      ))}
      <AudioManager />
      <AudioControls />
      <Toaster position="top-right" richColors />

      <div className="absolute bottom-8 left-0 right-0 z-50 text-center">
        <div className="inline-flex items-center gap-6 glass-morphism px-10 py-5 rounded-3xl border-2 border-purple-400/50 shadow-2xl shadow-purple-500/30 animate-float animate-border-glow">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-emerald-400/50 rounded-full animate-sparkle"></div>
          </div>
          <p className="text-gradient-casino text-lg font-semibold tracking-wide animate-text-glow">
            {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
              ? "👆 Touch left side to move • Touch right side to look • Tap games to play" 
              : "⌨️ WASD to move • 🖱️ Mouse to look • 🎮 Click on games to play"}
          </p>
          <div className="relative">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-yellow-400/50 rounded-full animate-sparkle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
