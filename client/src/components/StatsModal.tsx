import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/stores/useUser";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

interface GameStats {
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalWinAmount: number;
  totalBetAmount: number;
  netProfit: number;
  gamesPlayed: number;
  winRate: number;
  biggestWin: number;
}

export function StatsModal() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleOpenStats = () => {
      setOpen(true);
      fetchStats();
    };

    window.addEventListener("openStats", handleOpenStats);
    return () => window.removeEventListener("openStats", handleOpenStats);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stats", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-gray-900 via-blue-900/20 to-black border-2 border-blue-500/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Player Statistics
          </DialogTitle>
          <p className="text-center text-sm text-gray-400 mt-2">
            Track your gaming performance
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading statistics...</div>
          ) : stats ? (
            <>
              {/* Current Balance */}
              <div className="bg-gradient-to-r from-emerald-900/30 to-yellow-900/30 p-6 rounded-lg border border-emerald-500/30">
                <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                <div className="text-4xl font-bold text-emerald-400">
                  ${user?.balance?.toLocaleString() || 0}
                </div>
              </div>

              {/* Net Profit/Loss */}
              <div className={`p-6 rounded-lg border-2 ${
                stats.netProfit >= 0 
                  ? "bg-green-900/20 border-green-500/50" 
                  : "bg-red-900/20 border-red-500/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Net Profit/Loss</div>
                    <div className={`text-4xl font-bold ${
                      stats.netProfit >= 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      {stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toLocaleString()}
                    </div>
                  </div>
                  {stats.netProfit >= 0 ? (
                    <TrendingUp className="w-12 h-12 text-green-400" />
                  ) : (
                    <TrendingDown className="w-12 h-12 text-red-400" />
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    <div className="text-sm text-gray-400">Games Played</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {stats.gamesPlayed.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <div className="text-sm text-gray-400">Total Bets</div>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${stats.totalBetAmount.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-green-700">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <div className="text-sm text-gray-400">Total Wins</div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {stats.totalWins}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${stats.totalWinAmount.toLocaleString()} won
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-red-700">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                    <div className="text-sm text-gray-400">Total Losses</div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {stats.totalLosses}
                  </div>
                </div>
              </div>

              {/* Win Rate & Biggest Win */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/30">
                  <div className="text-sm text-gray-400 mb-2">Win Rate</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {stats.winRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
                  <div className="text-sm text-gray-400 mb-2">Biggest Win</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    ${stats.biggestWin.toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">No statistics available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function openStats() {
  window.dispatchEvent(new Event("openStats"));
}
