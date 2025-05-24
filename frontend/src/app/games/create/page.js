"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { ArrowLeft, UserPlus, X, Trophy } from "lucide-react";
import Link from "next/link";
import { MILLIONAIRES_DILEMMA_FACTORY_ADDRESS, MILLIONAIRES_DILEMMA_FACTORY_ABI } from "@/utils/contract";

export default function CreateGame() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [gameName, setGameName] = useState("");
  const [participants, setParticipants] = useState([
    { address: "", name: "" },
    { address: "", name: "" }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/');
    }
  }, [isConnected, mounted, router]);

  const addParticipant = () => {
    setParticipants([...participants, { address: "", name: "" }]);
  };

  const removeParticipant = (index) => {
    if (participants.length <= 2) {
      setError("At least 2 participants are required");
      return;
    }
    const updated = [...participants];
    updated.splice(index, 1);
    setParticipants(updated);
  };

  const updateParticipant = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const validateForm = () => {
    if (!gameName.trim()) {
      setError("Game name is required");
      return false;
    }

    if (participants.length < 2) {
      setError("At least 2 participants are required");
      return false;
    }

    for (const p of participants) {
      if (!p.address || !p.address.startsWith('0x')) {
        setError("All participant addresses must be valid");
        return false;
      }
      if (!p.name.trim()) {
        setError("All participants must have a name");
        return false;
      }
    }

    // Check for duplicate addresses
    const addresses = participants.map(p => p.address.toLowerCase());
    if (new Set(addresses).size !== addresses.length) {
      setError("Duplicate participant addresses are not allowed");
      return false;
    }

    return true;
  };

  const handleCreateGame = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    setError("");

    try {
      // Prepare arrays for contract call
      const addresses = participants.map(p => p.address);
      const names = participants.map(p => p.name);

      // Call the factory contract to create a new game
      const hash = await writeContractAsync({
        address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
        abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
        functionName: "createGame",
        args: [gameName, addresses, names],
      });

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // Find GameCreated event to get the deployed game address
      const events = receipt.logs.map(log => {
        try {
          return publicClient.decodeEventLog({
            abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      const gameCreatedEvent = events.find(event => event.eventName === 'GameCreated');
      
      if (gameCreatedEvent && gameCreatedEvent.args.gameAddress) {
        // Redirect to the new game
        router.push(`/games/${gameCreatedEvent.args.gameAddress}`);
      } else {
        throw new Error("Failed to get new game address");
      }
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err.message || "Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  if (!mounted || !isConnected) {
    return (
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/" className="text-white flex items-center hover:underline">
            <ArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="text-yellow-300 mr-3 w-8 h-8" />
            <h1 className="text-3xl font-bold text-white">Create New Game</h1>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">Game Name</label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter a name for this game"
                className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/40"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white">Participants</label>
                <button
                  onClick={addParticipant}
                  className="text-blue-300 hover:text-blue-200 flex items-center"
                >
                  <UserPlus className="mr-1 w-4 h-4" /> Add Participant
                </button>
              </div>

              <div className="space-y-3">
                {participants.map((participant, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={participant.address}
                      onChange={(e) => updateParticipant(index, 'address', e.target.value)}
                      placeholder="Wallet Address (0x...)"
                      className="flex-1 p-3 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/40"
                    />
                    <input
                      type="text"
                      value={participant.name}
                      onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                      placeholder="Display Name"
                      className="flex-1 p-3 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/40"
                    />
                    <button
                      onClick={() => removeParticipant(index)}
                      className="p-3 text-red-400 hover:text-red-300 bg-white/5 rounded-lg border border-white/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-300 p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Create Game"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 