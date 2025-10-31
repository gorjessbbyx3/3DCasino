import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/stores/useUser";
import { Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { playSound } from "@/components/AudioManager";

interface SpinStatus {
  canSpin: boolean;
  timeUntilNextSpin: number;
}

const WHEEL_PRIZES = [
  { value: 250, color: "#10b981" },
  { value: 1500, color: "#f59e0b" },
  { value: 300, color: "#3b82f6" },
  { value: 1200, color: "#8b5cf6" },
  { value: 350, color: "#ec4899" },
  { value: 900, color: "#ef4444" },
  { value: 400, color: "#06b6d4" },
  { value: 800, color: "#f97316" },
  { value: 450, color: "#84cc16" },
  { value: 1000, color: "#14b8a6" },
  { value: 500, color: "#eab308" },
  { value: 1100, color: "#6366f1" },
  { value: 550, color: "#a855f7" },
  { value: 1300, color: "#f43f5e" },
  { value: 600, color: "#22d3ee" },
  { value: 1400, color: "#fb923c" },
  { value: 650, color: "#4ade80" },
  { value: 700, color: "#facc15" },
];

export function SpinWheelModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinStatus, setSpinStatus] = useState<SpinStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { user, setUser } = useUser();
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenSpinWheel = () => {
      setOpen(true);
      fetchSpinStatus();
    };

    window.addEventListener("openSpinWheel", handleOpenSpinWheel);
    return () => window.removeEventListener("openSpinWheel", handleOpenSpinWheel);
  }, []);

  useEffect(() => {
    if (spinStatus && !spinStatus.canSpin) {
      setTimeRemaining(spinStatus.timeUntilNextSpin);
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 1000);
          if (newTime === 0) {
            fetchSpinStatus();
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [spinStatus]);

  const fetchSpinStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("/api/spin-wheel/status", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSpinStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch spin status:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSpin = async () => {
    if (!spinStatus?.canSpin || spinning) return;

    setLoading(true);
    setSpinning(true);
    try {
      const response = await fetch("/api/spin-wheel/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to spin");
      }

      const prizeIndex = WHEEL_PRIZES.findIndex(p => p.value === data.prize);
      const segmentAngle = 360 / WHEEL_PRIZES.length;
      const targetAngle = prizeIndex * segmentAngle;
      const spins = 5;
      const finalRotation = (360 * spins) + (360 - targetAngle) + (segmentAngle / 2);

      setRotation(finalRotation);

      setTimeout(() => {
        setUser(data.user);
        playSound("success");
        toast.success(`Congratulations! You won $${data.prize.toLocaleString()} credits!`);
        setSpinning(false);
        fetchSpinStatus();
      }, 4000);
    } catch (error: any) {
      toast.error(error.message);
      setSpinning(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-400/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-3xl text-white">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            Spin the Wheel
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {loadingStatus ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-300 text-lg">
                  Spin for a chance to win free credits!
                </p>
                <p className="text-purple-400 text-sm mt-1">
                  Available once every 12 hours
                </p>
              </div>

              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                  <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-400 drop-shadow-lg"></div>
                </div>

                <div
                  ref={wheelRef}
                  className="relative w-80 h-80 rounded-full shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                  }}
                >
                  <svg width="320" height="320" viewBox="0 0 320 320" className="transform -rotate-90">
                    {WHEEL_PRIZES.map((prize, index) => {
                      const angle = (360 / WHEEL_PRIZES.length) * index;
                      const nextAngle = (360 / WHEEL_PRIZES.length) * (index + 1);
                      
                      const x1 = 160 + 160 * Math.cos((angle * Math.PI) / 180);
                      const y1 = 160 + 160 * Math.sin((angle * Math.PI) / 180);
                      const x2 = 160 + 160 * Math.cos((nextAngle * Math.PI) / 180);
                      const y2 = 160 + 160 * Math.sin((nextAngle * Math.PI) / 180);

                      const midAngle = (angle + nextAngle) / 2;
                      const textX = 160 + 120 * Math.cos((midAngle * Math.PI) / 180);
                      const textY = 160 + 120 * Math.sin((midAngle * Math.PI) / 180);

                      return (
                        <g key={index}>
                          <path
                            d={`M 160 160 L ${x1} ${y1} A 160 160 0 0 1 ${x2} ${y2} Z`}
                            fill={prize.color}
                            stroke="#fff"
                            strokeWidth="2"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize="18"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          >
                            ${prize.value}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="160" cy="160" r="30" fill="#1f2937" stroke="#fbbf24" strokeWidth="4" />
                  </svg>
                </div>
              </div>

              {spinStatus?.canSpin ? (
                <div className="text-center">
                  <Button
                    onClick={handleSpin}
                    disabled={loading || spinning}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-purple-500/50"
                  >
                    {spinning ? "Spinning..." : "SPIN NOW!"}
                  </Button>
                </div>
              ) : (
                <div className="text-center bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-300 mb-2">
                    Next Spin Available In
                  </h3>
                  <div className="text-3xl font-bold text-purple-400">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Come back later for another spin!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function openSpinWheel() {
  window.dispatchEvent(new Event("openSpinWheel"));
}
