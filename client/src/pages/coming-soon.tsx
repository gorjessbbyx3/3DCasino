import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-900/20 to-black">
      <div className="text-center px-4 max-w-2xl">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Sparkles className="w-24 h-24 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 blur-xl bg-emerald-400/30 animate-pulse" />
          </div>
        </div>

        <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent mb-4">
          Coming Soon
        </h1>
        
        <h2 className="text-3xl font-semibold text-white mb-6">
          Jade Royale Casino
        </h2>

        <p className="text-xl text-gray-300 mb-8">
          This game is currently under development. Our team is working hard to bring you an amazing gaming experience!
        </p>

        <div className="bg-gradient-to-r from-emerald-900/30 to-purple-900/30 p-6 rounded-lg border border-emerald-500/30 mb-8">
          <p className="text-gray-400 italic">
            "Set sail for adventure! The treasures await, matey!" - Captain Rex
          </p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-6 px-8 text-lg shadow-lg shadow-emerald-500/20"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return to Casino Floor
        </Button>
      </div>
    </div>
  );
}
