import { useState } from "react";
import { useUser } from "@/lib/stores/useUser";
import { Coins, LogOut, Lock, User, BarChart3 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { openStats } from "./StatsModal";
import { openDailyCheckIn } from "./DailyCheckInModal";
import { openSpinWheel } from "./SpinWheelModal";

export function Navigation() {
  const { user, setUser } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDailyCheckIn = () => {
    openDailyCheckIn();
  };

  const handleFreeCredits = () => {
    openSpinWheel();
  };

  if (!user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-start justify-between p-2 sm:p-4 gap-2 sm:gap-4">
        {/* Left side - Icons */}
        <div className="flex gap-2 sm:gap-3 pointer-events-auto">
          <button
            onClick={handleDailyCheckIn}
            className="group relative hover:scale-110 transition-transform duration-200"
            title="Daily Check-in"
          >
            <img 
              src="/daily-checkin-icon.png" 
              alt="Daily Check-in" 
              className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg"
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden sm:block">
              Daily Check-in
            </div>
          </button>

          <button
            onClick={handleFreeCredits}
            className="group relative hover:scale-110 transition-transform duration-200"
            title="Free Credits"
          >
            <img 
              src="/free-credits-icon.png" 
              alt="Free Credits" 
              className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg"
            />
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap hidden sm:block">
              Free Credits
            </div>
          </button>
        </div>

        {/* Right side - User info and balance */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Credit Balance */}
          <div className="bg-black/40 backdrop-blur-md px-2 py-1 sm:px-4 sm:py-2 rounded-full border border-yellow-400/30 shadow-lg">
            <div className="flex items-center gap-1 sm:gap-2">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm sm:text-lg">
                ${user.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* User Avatar/Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-black/40 backdrop-blur-md p-1 sm:p-2 rounded-full border border-emerald-400/30 hover:border-emerald-400/60 transition-all shadow-lg hover:scale-105"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-md rounded-lg border border-emerald-400/30 shadow-xl z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-emerald-400/20">
                    <div className="text-emerald-300 text-sm font-medium">
                      {user.username}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Balance: ${user.balance.toLocaleString()}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openStats();
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-blue-400/20 flex items-center gap-2 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Stats
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-emerald-400/20 flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-400/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="bg-gray-900 rounded-lg border border-emerald-400/30 p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-600 rounded text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-600 rounded text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-black/40 border border-gray-600 rounded text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement password change
                  setShowPasswordModal(false);
                }}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
