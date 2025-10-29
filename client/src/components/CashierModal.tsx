import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/stores/useUser";
import { Coins, TrendingUp, TrendingDown, History } from "lucide-react";
import { toast } from "sonner";

export function CashierModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "deposit" | "withdraw">("menu");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    const handleOpenCashier = () => {
      setOpen(true);
      setMode("menu");
      setAmount("");
    };

    window.addEventListener("openCashier", handleOpenCashier);
    return () => window.removeEventListener("openCashier", handleOpenCashier);
  }, []);

  const handleDeposit = async () => {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cashier/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amountNum }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Deposit failed");
      }

      setUser(data.user);
      toast.success(`Deposit successful! $${amountNum.toLocaleString()} added to your balance`);
      setMode("menu");
      setAmount("");
    } catch (error: any) {
      toast.error(`Deposit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cashier/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: amountNum }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Withdrawal failed");
      }

      setUser(data.user);
      toast.success(`Withdrawal successful! $${amountNum.toLocaleString()} withdrawn`);
      setMode("menu");
      setAmount("");
    } catch (error: any) {
      toast.error(`Withdrawal failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-emerald-900/20 to-black border-2 border-emerald-500/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-yellow-400" />
            Cashier
          </DialogTitle>
          <p className="text-center text-sm text-gray-400 mt-2">
            Managed by Captain <span className="text-emerald-400 font-semibold">Rex</span>, your trusty pitbull pirate
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-gradient-to-r from-emerald-900/30 to-yellow-900/30 p-4 rounded-lg border border-emerald-500/30">
            <div className="text-sm text-gray-400 mb-1">Current Balance</div>
            <div className="text-3xl font-bold text-emerald-400">
              ${user?.balance?.toLocaleString() || 0}
            </div>
          </div>

          {mode === "menu" && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-6 shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-2"
                onClick={() => setMode("deposit")}
              >
                <TrendingUp className="w-6 h-6" />
                <span>Deposit</span>
              </Button>

              <Button
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-6 shadow-lg shadow-purple-500/20 flex flex-col items-center gap-2"
                onClick={() => setMode("withdraw")}
              >
                <TrendingDown className="w-6 h-6" />
                <span>Withdraw</span>
              </Button>
            </div>
          )}

          {mode === "deposit" && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Amount to Deposit</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="mt-2 bg-gray-800 border-emerald-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeposit}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                >
                  {loading ? "Processing..." : "Confirm Deposit"}
                </Button>
                <Button
                  onClick={() => {
                    setMode("menu");
                    setAmount("");
                  }}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {mode === "withdraw" && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Amount to Withdraw</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="mt-2 bg-gray-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                    disabled={user && user.balance < amt}
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-500"
                >
                  {loading ? "Processing..." : "Confirm Withdrawal"}
                </Button>
                <Button
                  onClick={() => {
                    setMode("menu");
                    setAmount("");
                  }}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 italic text-center">
              {mode === "menu" && '"Ahoy there! Captain Rex at yer service. Ready to make some waves with yer chips?" 🏴‍☠️'}
              {mode === "deposit" && '"Puttin\' some gold in the chest, eh? Wise choice, matey!"'}
              {mode === "withdraw" && '"Cashin\' out yer treasure? Fair winds to ye!"'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
