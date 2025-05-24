"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { Wallet, LogOut, User, Trophy } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle the disconnect action
  const handleDisconnect = () => {
    try {
      disconnect();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  // Handler for the connect button
  const handleConnect = () => {
    try {
      console.log("Connecting wallet...");
      open();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  if (!mounted)
    return (
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen">
      <header className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-300" />
            Millionaire's Dilemma
          </h1>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg p-2 rounded-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <User className="text-white w-5 h-5" />
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {address?.substring(0, 6)}...
                    {address?.substring(address.length - 4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600/80 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 border border-white/20"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 mt-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Who's the Wealthiest?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Compare wealth confidentially using encrypted computation. Only the winner is revealed, not the actual amounts.
          </p>
        </div>

        {isConnected ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/games/create">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-blue-300 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Create New Game</h3>
                <p className="text-white/70">
                  Start a new comparison game and invite participants
                </p>
              </div>
            </Link>
            
            <Link href="/games">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-center hover:bg-white/20 transition-all transform hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-purple-300 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Join Existing Game</h3>
                <p className="text-white/70">
                  Participate in an ongoing wealth comparison game
                </p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-10 text-center max-w-md mx-auto">
            <Wallet className="mx-auto mb-4 w-12 h-12 text-white/70" />
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-6">
              Connect your wallet to create or join wealth comparison games
            </p>
            <button
              onClick={handleConnect}
              className="bg-blue-600/80 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
