import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/stores/useUser";
import { Coins, TrendingUp, TrendingDown, History, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";
import { playSound } from "@/components/AudioManager";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

export function CashierModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "deposit" | "withdraw" | "history">("menu");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
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

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await fetch("/api/transactions?limit=20", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (open && mode === "history") {
      fetchTransactions();
    }
  }, [open, mode]);

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
      playSound("success");
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
      playSound("success");
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
            <>
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

              <Button
                variant="outline"
                className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center gap-2 py-4"
                onClick={() => setMode("history")}
              >
                <History className="w-5 h-5" />
                <span>Transaction History</span>
              </Button>
            </>
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
                    disabled={!!(user && user.balance < amt)}
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

          {mode === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Recent Transactions</h3>
                <Button
                  onClick={() => setMode("menu")}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  Back
                </Button>
              </div>
              
              {loadingTransactions ? (
                <div className="text-center text-gray-400 py-8">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No transactions yet</div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {txn.type === "deposit" ? (
                            <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                          ) : txn.type === "withdraw" ? (
                            <ArrowDownCircle className="w-5 h-5 text-purple-400" />
                          ) : txn.type === "win" ? (
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-200 capitalize">{txn.type}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            txn.type === "deposit" || txn.type === "win" ? "text-emerald-400" : "text-purple-400"
                          }`}>
                            {txn.type === "deposit" || txn.type === "win" ? "+" : "-"}
                            ${txn.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Balance: ${txn.balanceAfter.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {txn.description && (
                        <div className="mt-2 text-xs text-gray-400 italic">{txn.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 italic text-center">
              {mode === "menu" && '"Ahoy there! Captain Rex at yer service. Ready to make some waves with yer chips?" 🏴‍☠️'}
              {mode === "deposit" && '"Puttin\' some gold in the chest, eh? Wise choice, matey!"'}
              {mode === "withdraw" && '"Cashin\' out yer treasure? Fair winds to ye!"'}
              {mode === "history" && '"Let me show ye the logbook of yer treasure moves, matey!"'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
