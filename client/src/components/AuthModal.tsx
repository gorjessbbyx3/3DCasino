import { useState, useEffect } from "react";
import { useUser } from "@/lib/stores/useUser";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, setUser } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpenAuthModal = () => {
      setShowAuthModal(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, [setShowAuthModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await apiRequest("POST", endpoint, { username, password });
      const user = await res.json();
      
      setUser(user);
      setShowAuthModal(false);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/auth/demo", {});
      const user = await res.json();
      
      setUser(user);
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to create demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-emerald-500/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-yellow-400 bg-clip-text text-transparent">
            {isLogin ? "Sign In" : "Register"}
          </DialogTitle>
          <p className="text-center text-sm text-gray-400 mt-2">
            Welcome to <span className="text-emerald-400 font-semibold">Jade Royale Casino</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-300">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-gray-800 border-emerald-500/30 text-white focus:border-emerald-500"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-emerald-500/30 text-white focus:border-emerald-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3 shadow-lg shadow-emerald-500/20"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleDemoMode}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-3 shadow-lg shadow-yellow-500/20"
          >
            {loading ? "Please wait..." : "Try Demo Mode (2000 Free Credits)"}
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300 underline"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
