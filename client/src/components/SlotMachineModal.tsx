import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/stores/useUser";
import { Coins, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { playSound } from "@/components/AudioManager";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "7️⃣"];
const BET_AMOUNTS = [10, 25, 50, 100, 250];

interface SlotMachineModalProps {
  machineNumber?: number;
}

export function SlotMachineModal({ machineNumber = 1 }: SlotMachineModalProps) {
  const [open, setOpen] = useState(false);
  const [bet, setBet] = useState(BET_AMOUNTS[0]);
  const [reels, setReels] = useState<string[]>(["🍒", "🍒", "🍒"]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const { user, setUser } = useUser();

  useEffect(() => {
    const handleOpenSlotMachine = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.machineNumber === machineNumber) {
        setOpen(true);
      }
    };

    window.addEventListener("openSlotMachine", handleOpenSlotMachine);
    return () => window.removeEventListener("openSlotMachine", handleOpenSlotMachine);
  }, [machineNumber]);

  const calculateWin = (symbols: string[]): number => {
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      if (symbols[0] === "7️⃣") return bet * 100;
      if (symbols[0] === "💎") return bet * 50;
      if (symbols[0] === "⭐") return bet * 25;
      if (symbols[0] === "🍇") return bet * 15;
      if (symbols[0] === "🍊") return bet * 10;
      if (symbols[0] === "🍋") return bet * 8;
      if (symbols[0] === "🍒") return bet * 5;
    }
    
    if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) {
      return bet * 2;
    }
    
    return 0;
  };

  const spin = async () => {
    if (!user) return;
    
    if (user.balance < bet) {
      toast.error("Insufficient balance!");
      playSound("hit");
      return;
    }

    setSpinning(true);
    setLastWin(0);
    playSound("hit");

    try {
      const response = await fetch("/api/games/slot/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bet, machineNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Spin failed");
      }

      // Directly set the result symbols without animation
      setReels(data.symbols);
      setUser(data.user);
      setLastWin(data.winAmount);

      if (data.winAmount > 0) {
        playSound("success");
        toast.success(
          `🎰 Winner! You won $${data.winAmount.toLocaleString()}!`,
          { duration: 4000 }
        );
      } else {
        toast.info("Better luck next time!");
      }
    } catch (error: any) {
      toast.error(`Spin failed: ${error.message}`);
      playSound("hit");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900 via-purple-900/20 to-black border-2 border-yellow-500/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Slot Machine #{machineNumber}
          </DialogTitle>
          <p className="text-center text-sm text-gray-400 mt-2">
            Match 3 symbols to win big!
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-gradient-to-r from-yellow-900/30 to-purple-900/30 p-4 rounded-lg border border-yellow-500/30">
            <div className="text-sm text-gray-400 mb-1">Your Balance</div>
            <div className="text-3xl font-bold text-yellow-400">
              ${user?.balance?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-black/50 p-8 rounded-2xl border-4 border-yellow-500/50 shadow-2xl">
            <div className="flex justify-center items-center gap-4">
              {reels.map((symbol, i) => (
                <div
                  key={i}
                  className={`w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-4 border-yellow-500/50 flex items-center justify-center text-5xl shadow-lg ${
                    spinning ? "animate-pulse" : ""
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          {lastWin > 0 && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 rounded-lg border-2 border-green-500/50 animate-pulse">
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold text-2xl">
                <TrendingUp className="w-6 h-6" />
                WIN: ${lastWin.toLocaleString()}!
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Bet Amount</label>
              <div className="grid grid-cols-5 gap-2">
                {BET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBet(amount)}
                    variant={bet === amount ? "default" : "outline"}
                    size="sm"
                    disabled={spinning}
                    className={bet === amount 
                      ? "bg-yellow-600 hover:bg-yellow-500 text-white" 
                      : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                    }
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={spin}
              disabled={spinning || !user || user.balance < bet}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold text-xl py-6 shadow-lg shadow-yellow-500/20"
            >
              {spinning ? "🎰 SPINNING..." : "🎰 SPIN"}
            </Button>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">Payouts</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>7️⃣ 7️⃣ 7️⃣ = {bet * 100}x</div>
              <div>💎 💎 💎 = {bet * 50}x</div>
              <div>⭐ ⭐ ⭐ = {bet * 25}x</div>
              <div>🍇 🍇 🍇 = {bet * 15}x</div>
              <div>🍊 🍊 🍊 = {bet * 10}x</div>
              <div>🍋 🍋 🍋 = {bet * 8}x</div>
              <div>🍒 🍒 🍒 = {bet * 5}x</div>
              <div className="col-span-2">Any 2 match = {bet * 2}x</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function openSlotMachine(machineNumber: number) {
  window.dispatchEvent(
    new CustomEvent("openSlotMachine", { detail: { machineNumber } })
  );
}
