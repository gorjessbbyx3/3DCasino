import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/stores/useUser";
import { Calendar, Check, Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import { playSound } from "@/components/AudioManager";

interface CheckInStatus {
  claimedDays: number[];
  currentDay: number;
  weekStartDate: string;
}

const DAYS_OF_WEEK = [
  { name: "Mon", day: 1, reward: 300 },
  { name: "Tue", day: 2, reward: 400 },
  { name: "Wed", day: 3, reward: 500 },
  { name: "Thu", day: 4, reward: 600 },
  { name: "Fri", day: 5, reward: 700 },
  { name: "Sat", day: 6, reward: 800 },
  { name: "Sun", day: 0, reward: 900 },
];

export function DailyCheckInModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<CheckInStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    const handleOpenDailyCheckIn = () => {
      setOpen(true);
      fetchCheckInStatus();
    };

    window.addEventListener("openDailyCheckIn", handleOpenDailyCheckIn);
    return () => window.removeEventListener("openDailyCheckIn", handleOpenDailyCheckIn);
  }, []);

  const fetchCheckInStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("/api/daily-checkin/status", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCheckInStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch check-in status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleClaimReward = async () => {
    if (!checkInStatus) return;

    setLoading(true);
    try {
      const response = await fetch("/api/daily-checkin/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to claim reward");
      }

      setUser(data.user);
      playSound("success");
      toast.success(`Daily check-in complete! +$${data.reward.toLocaleString()} credits`);
      fetchCheckInStatus();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const canClaimToday = checkInStatus && !checkInStatus.claimedDays.includes(checkInStatus.currentDay);
  const todayReward = DAYS_OF_WEEK.find(d => d.day === checkInStatus?.currentDay)?.reward || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900 border-2 border-emerald-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl text-white">
            <Calendar className="w-8 h-8 text-emerald-400" />
            Daily Check-In Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {loadingStatus ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-400 border-t-transparent"></div>
              <p className="text-gray-400 mt-4">Loading calendar...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-300 text-lg">
                  Check in every day to earn free credits!
                </p>
                <p className="text-emerald-400 text-sm mt-1">
                  Rewards increase by $100 each day
                </p>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-6">
                {DAYS_OF_WEEK.map((day) => {
                  const isClaimed = checkInStatus?.claimedDays.includes(day.day);
                  const isToday = checkInStatus?.currentDay === day.day;

                  return (
                    <div
                      key={day.day}
                      className={`
                        relative flex flex-col items-center p-4 rounded-xl border-2 transition-all
                        ${isClaimed 
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20' 
                          : isToday 
                            ? 'bg-yellow-500/10 border-yellow-400 shadow-lg shadow-yellow-500/20 animate-pulse'
                            : 'bg-gray-800/50 border-gray-600'
                        }
                      `}
                    >
                      {isClaimed && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div className={`text-sm font-bold mb-2 ${isToday ? 'text-yellow-400' : 'text-gray-300'}`}>
                        {day.name}
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <Coins className={`w-4 h-4 ${isClaimed ? 'text-emerald-400' : isToday ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <span className={`font-bold ${isClaimed ? 'text-emerald-400' : isToday ? 'text-yellow-400' : 'text-gray-400'}`}>
                          ${day.reward}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-emerald-500/10 via-yellow-500/10 to-emerald-500/10 rounded-xl p-6 border border-emerald-400/30">
                {canClaimToday ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <Gift className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Today's Reward
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Coins className="w-6 h-6 text-yellow-400" />
                      <span className="text-3xl font-bold text-yellow-400">
                        ${todayReward.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={handleClaimReward}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-emerald-500/50"
                    >
                      {loading ? "Claiming..." : "Claim Reward"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      <Check className="w-16 h-16 text-emerald-400 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                      Already Claimed Today!
                    </h3>
                    <p className="text-gray-300">
                      Come back tomorrow for your next reward
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                Week resets every Monday
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function openDailyCheckIn() {
  window.dispatchEvent(new Event("openDailyCheckIn"));
}
