"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { 
  MILLIONAIRES_DILEMMA_FACTORY_ADDRESS, 
  MILLIONAIRES_DILEMMA_FACTORY_ABI,
  MILLIONAIRES_DILEMMA_ABI
} from "@/utils/contract";

export default function GamesList() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/');
    }
  }, [isConnected, mounted, router]);

  // Get the count of games from the factory
  const { data: gameCount } = useReadContract({
    address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
    abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
    functionName: "getDeployedGamesCount",
    watch: true,
  });

  // Fetch game data
  useEffect(() => {
    const fetchGames = async () => {
      if (!gameCount || gameCount === 0) {
        setGames([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const gamePromises = [];

        // Create an array of indices from 0 to gameCount-1
        const indices = Array.from({ length: Number(gameCount) }, (_, i) => i);

        // For each index, get the game address and then fetch game details
        for (const index of indices) {
          gamePromises.push(
            useReadContract.fetchData({
              address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
              abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
              functionName: "getGameAddress",
              args: [index],
            }).then(async (gameAddress) => {
              if (!gameAddress) return null;

              // Get participant count for this game
              const participantCount = await useReadContract.fetchData({
                address: gameAddress,
                abi: MILLIONAIRES_DILEMMA_ABI,
                functionName: "getParticipantCount",
              });

              // Check if comparison is done (to show status)
              const comparisonDone = await useReadContract.fetchData({
                address: gameAddress,
                abi: MILLIONAIRES_DILEMMA_ABI,
                functionName: "comparisonDone",
              });

              // If comparison is done, get the winner
              let winner = "";
              if (comparisonDone) {
                try {
                  winner = await useReadContract.fetchData({
                    address: gameAddress,
                    abi: MILLIONAIRES_DILEMMA_ABI,
                    functionName: "getWinner",
                  });
                } catch (e) {
                  // Ignore errors here, winner might not be set yet
                }
              }

              return {
                address: gameAddress,
                participantCount: Number(participantCount || 0),
                status: comparisonDone ? "Completed" : "In Progress",
                winner,
                index
              };
            })
          );
        }

        const results = await Promise.all(gamePromises);
        setGames(results.filter(Boolean));
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load games");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [gameCount]);

  if (!mounted || !isConnected) {
    return (
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/" className="text-white flex items-center hover:underline">
            <ArrowLeft className="mr-2" /> Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
          <Trophy className="mr-3 text-yellow-300" />
          Available Games
        </h1>

        {isLoading ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading games...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-6 rounded-lg">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20">
            <p className="text-white mb-4">No games have been created yet.</p>
            <Link href="/games/create">
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
                Create First Game
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Link href={`/games/${game.address}`} key={game.address}>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all transform hover:scale-[1.01] cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-white">Game #{game.index + 1}</h2>
                    <div className="flex items-center">
                      {game.status === "Completed" ? (
                        <span className="flex items-center text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" /> In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-white/70">
                      <Users className="mr-1 w-4 h-4" />
                      <span className="text-sm">{game.participantCount} Participants</span>
                    </div>
                    
                    {game.winner && (
                      <div className="text-white flex items-center bg-emerald-900/30 px-3 py-1 rounded-full text-sm">
                        <Trophy className="w-3 h-3 mr-1 text-yellow-300" />
                        Winner: {game.winner}
                      </div>
                    )}
                    
                    <div className="text-blue-300 flex items-center text-sm">
                      View Game <ExternalLink className="ml-1 w-3 h-3" />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-white/50 text-xs truncate">
                    {game.address}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 