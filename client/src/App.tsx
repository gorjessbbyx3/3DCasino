import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CasinoScene } from "./components/CasinoScene";
import { AuthModal } from "./components/AuthModal";
import { CashierModal } from "./components/CashierModal";
import { useUser } from "./lib/stores/useUser";
import { Coins, LogOut } from "lucide-react";
import { Button } from "./components/ui/button";
import { apiRequest } from "./lib/queryClient";
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
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
              Jade Royale
            </h1>
            {user && (
              <div className="flex items-center gap-2 bg-emerald-900/30 px-4 py-2 rounded-lg border border-emerald-500/30">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-emerald-400 font-semibold">
                  ${user.balance.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-white">Welcome, <span className="text-emerald-400 font-semibold">{user.username}</span></span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 hover:bg-emerald-900/30 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="text-gray-400 text-sm">
                Click on any game or the cashier to get started
              </div>
            )}
          </div>
        </div>
      </div>

      <CasinoScene />
      <AuthModal />
      <CashierModal />

      <div className="absolute bottom-4 left-0 right-0 z-10 text-center">
        <p className="text-gray-400 text-sm bg-black/60 inline-block px-4 py-2 rounded-lg">
          {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) 
            ? "Touch left side to move • Touch right side to look • Tap games to play" 
            : "WASD to move • Mouse to look • Click on games to play"}
        </p>
      </div>
    </div>
  );
}

export default App;
