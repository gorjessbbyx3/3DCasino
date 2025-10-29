import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/stores/useUser";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

export function CashierModal() {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleOpenCashier = () => {
      setOpen(true);
    };

    window.addEventListener("openCashier", handleOpenCashier);
    return () => window.removeEventListener("openCashier", handleOpenCashier);
  }, []);

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

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-6 shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-2"
              onClick={() => alert("Deposit feature coming soon!")}
            >
              <TrendingUp className="w-6 h-6" />
              <span>Deposit</span>
            </Button>

            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-6 shadow-lg shadow-purple-500/20 flex flex-col items-center gap-2"
              onClick={() => alert("Withdraw feature coming soon!")}
            >
              <TrendingDown className="w-6 h-6" />
              <span>Withdraw</span>
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 italic text-center">
              "Ahoy there! Captain Rex at yer service. Ready to make some waves with yer chips?" 🏴‍☠️
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
