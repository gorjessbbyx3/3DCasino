import { useState } from "react";
import { useUser } from "@/lib/stores/useUser";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface UpgradeAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeAccountModal({ open, onOpenChange }: UpgradeAccountModalProps) {
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/auth/upgrade-demo", { username, password });
      const user = await res.json();
      
      setUser(user);
      onOpenChange(false);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to upgrade account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Upgrade Demo Account
          </DialogTitle>
          <p className="text-center text-sm text-gray-400 mt-2">
            Keep your balance and progress! Create your permanent account.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="new-username" className="text-gray-300">Choose Username</Label>
            <Input
              id="new-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-500"
              placeholder="Enter new username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-gray-300">Choose Password</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-500"
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-800 border-yellow-500/30 text-white focus:border-yellow-500"
              placeholder="Confirm your password"
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
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold py-3 shadow-lg shadow-yellow-500/20"
          >
            {loading ? "Upgrading..." : "Upgrade Account"}
          </Button>

          <p className="text-center text-xs text-gray-500 mt-2">
            Your current balance will be preserved
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
