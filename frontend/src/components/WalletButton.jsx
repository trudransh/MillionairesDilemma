"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useState } from "react";
import { Wallet, LogOut, ChevronDown } from "lucide-react";

export default function WalletButton() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    setIsMenuOpen(false);
  };

  // Handle switch account (opens wallet modal)
  const handleSwitchAccount = () => {
    open({ view: "Account" });
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      {isConnected ? (
        <>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <Wallet className="w-4 h-4" />
            <span>{formatAddress(address)}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-indigo-900/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-50">
              <div className="py-1">
                <button
                  onClick={handleSwitchAccount}
                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Switch Account
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-300 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => open()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  );
} 