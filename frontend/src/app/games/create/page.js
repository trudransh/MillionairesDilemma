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
    console.log("Component mounted");
    setMounted(true);
  }, []);

  // Redirect if not connected
  useEffect(() => {
    console.log("Connection status:", { isConnected, mounted });
    if (mounted && !isConnected) {
      console.log("Redirecting to home - not connected");
      router.push('/');
    }
  }, [isConnected, mounted, router]);

  const addParticipant = () => {
    console.log("Adding new participant");
    setParticipants([...participants, { address: "", name: "" }]);
  };

  const removeParticipant = (index) => {
    console.log("Attempting to remove participant at index:", index);
    if (participants.length <= 2) {
      console.log("Cannot remove - minimum participants required");
      setError("At least 2 participants are required");
      return;
    }
    const updated = [...participants];
    updated.splice(index, 1);
    console.log("Updated participants after removal:", updated);
    setParticipants(updated);
  };

  const updateParticipant = (index, field, value) => {
    console.log("Updating participant:", { index, field, value });
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const validateForm = () => {
    console.log("Validating form:", { gameName, participants });
    
    if (!gameName.trim()) {
      console.log("Validation failed: Game name required");
      setError("Game name is required");
      return false;
    }

    if (participants.length < 2) {
      console.log("Validation failed: Insufficient participants");
      setError("At least 2 participants are required");
      return false;
    }

    for (const p of participants) {
      if (!p.address || !p.address.startsWith('0x')) {
        console.log("Validation failed: Invalid address format");
        setError("All participant addresses must be valid");
        return false;
      }
      if (!p.name.trim()) {
        console.log("Validation failed: Missing participant name");
        setError("All participants must have a name");
        return false;
      }
    }

    const addresses = participants.map(p => p.address.toLowerCase());
    if (new Set(addresses).size !== addresses.length) {
      console.log("Validation failed: Duplicate addresses found");
      setError("Duplicate participant addresses are not allowed");
      return false;
    }

    console.log("Form validation successful");
    return true;
  };

  const handleCreateGame = async () => {
    console.log("Starting game creation process");
    if (!validateForm()) return;

    setIsCreating(true);
    setError("");

    try {
      const addresses = participants.map(p => p.address);
      const names = participants.map(p => p.name);

      console.log("Calling contract with params:", {
        gameName,
        addresses,
        names,
        factoryAddress: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS
      });

      const hash = await writeContractAsync({
        address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
        abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
        functionName: "createGame",
        args: [gameName, addresses, names],
      });

      console.log("Transaction hash:", hash);

      console.log("Waiting for transaction receipt...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);

      const events = receipt.logs.map(log => {
        try {
          return publicClient.decodeEventLog({
            abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
        } catch (e) {
          console.log("Failed to decode event log:", e);
          return null;
        }
      }).filter(Boolean);

      console.log("Decoded events:", events);

      const gameCreatedEvent = events.find(event => event.eventName === 'GameCreated');
      console.log("GameCreated event:", gameCreatedEvent);
      
      if (gameCreatedEvent && gameCreatedEvent.args.gameAddress) {
        console.log("Redirecting to new game:", gameCreatedEvent.args.gameAddress);
        router.push(`/games/${gameCreatedEvent.args.gameAddress}`);
      } else {
        console.error("GameCreated event not found or missing game address");
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
    console.log("Rendering loading state:", { mounted, isConnected });
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