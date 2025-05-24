"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleCreateGame = () => {
    if (isConnected) {
      router.push("/games/create");
    } else {
      // Let the NavBar handle wallet connection
      document.querySelector(".wallet-connect-button")?.click();
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            <span className="block">Who's the Wealthiest?</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-white/80 mb-12">
            Compare wealth confidentially using encrypted computation. Only the 
            winner is revealed, not the actual amounts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateGame}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Create a Game
            </button>
            
            <Link
              href="/games"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Browse Games
            </Link>
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-blue-300 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Confidential Comparison</h3>
            <p className="text-white/70">
              Compare wealth values without revealing actual amounts to anyone.
            </p>
          </div>
          
          {/* Add 2 more feature boxes here if desired */}
        </div>
      </div>
    </div>
  );
}
