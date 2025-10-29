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
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/95 via-purple-900/30 to-transparent p-6 backdrop-blur-md border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-yellow-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl animate-neon">
              💎 Jade Royale
            </h1>
            {user && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-900/60 to-yellow-900/40 px-6 py-3 rounded-xl border border-yellow-400/60 backdrop-blur-md shadow-xl shadow-emerald-500/30 animate-glow">
                <Coins className="w-6 h-6 text-yellow-300 animate-bounce animate-sparkle" />
                <span className="text-yellow-200 font-bold text-lg tracking-wide animate-shimmer">
                  ${user.balance.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  onClick={openStats}
                  variant="outline"
                  size="default"
                  className="border-blue-500/50 hover:bg-blue-900/30 hover:border-blue-400 text-blue-200 hover:text-blue-100 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stats
                </Button>
                <div className="text-right">
                  <div className="text-gray-300 text-sm">Welcome back,</div>
                  <div className="text-emerald-300 font-bold text-lg tracking-wide">{user.username}</div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="default"
                  className="border-red-500/50 hover:bg-red-900/30 hover:border-red-400 text-red-200 hover:text-red-100 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="text-gray-300 text-base bg-black/40 px-4 py-2 rounded-lg border border-gray-600/30 backdrop-blur-sm">
                ✨ Click on any game or the cashier to get started
              </div>
            )}
          </div>
        </div>
      </div>

      <CasinoScene />
      <AuthModal />
      <CashierModal />
      <StatsModal />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
        <SlotMachineModal key={num} machineNumber={num} />
      ))}
      <AudioManager />
      <AudioControls />
      <Toaster position="top-right" richColors />

      <div className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-900/80 via-black/90 to-blue-900/80 px-8 py-4 rounded-2xl border border-purple-400/40 backdrop-blur-md shadow-2xl animate-float">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse animate-sparkle"></div>
          <p className="text-purple-200 text-base font-medium bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
            {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
              ? "👆 Touch left side to move • Touch right side to look • Tap games to play" 
              : "⌨️ WASD to move • 🖱️ Mouse to look • 🎮 Click on games to play"}
          </p>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse animate-sparkle"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
