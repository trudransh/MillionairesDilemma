"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import Link from "next/link";
import { ArrowLeft, Users, Trophy, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { encryptValue } from "@/utils/inco-lite";
import {
  MILLIONAIRES_DILEMMA_ABI,
  MILLIONAIRES_DILEMMA_FACTORY_ABI,
  MILLIONAIRES_DILEMMA_FACTORY_ADDRESS
} from "@/utils/contract";
import SubmitWealthModal from "@/components/modals/SubmitWealthModal";
import GameResultModal from "@/components/modals/GameResultModal";
import ParticipantsList from "@/components/game/ParticipantsList";

export default function GamePage() {
  const { address: gameAddress } = useParams();
  const router = useRouter();
  const { address: userAddress, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [comparisonDone, setComparisonDone] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
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

  // Enhanced error handling in useEffect
  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameAddress || !isConnected) return;

      try {
        setIsLoading(true);
        setError("");

        // First check if the game is created by our factory
        const isValid = await useReadContract.fetchData({
          address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
          abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
          functionName: "isGameCreatedByFactory",
          args: [gameAddress],
        });

        if (!isValid) {
          setError("This game was not created by the factory contract");
          setIsLoading(false);
          return;
        }

        // Fetch other game data...
        
      } catch (err) {
        console.error("Error fetching game data:", err);
        setError(err.message || "Failed to load game data");
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [gameAddress, isConnected, userAddress]);
  
  // Verify game is created by factory
  const { data: isValidGame } = useReadContract({
    address: MILLIONAIRES_DILEMMA_FACTORY_ADDRESS,
    abi: MILLIONAIRES_DILEMMA_FACTORY_ABI,
    functionName: "isGameCreatedByFactory",
    args: [gameAddress],
    watch: true,
  });
  
  // Game owner check
  const { data: gameOwner } = useReadContract({
    address: gameAddress,
    abi: MILLIONAIRES_DILEMMA_ABI,
    functionName: "owner",
    enabled: isValidGame === true,
    watch: true,
  });

  // Comparison done check
  const { data: gameComparisonDone } = useReadContract({
    address: gameAddress,
    abi: MILLIONAIRES_DILEMMA_ABI,
    functionName: "comparisonDone",
    enabled: isValidGame === true,
    watch: true,
  });

  // Fetch game data
  const fetchGameData = useCallback(async () => {
    if (!gameAddress || !isValidGame) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // Get participant count
      const participantCount = await useReadContract.fetchData({
        address: gameAddress,
        abi: MILLIONAIRES_DILEMMA_ABI,
        functionName: "getParticipantCount",
      });
      
      // Get all participants
      const participantsPromises = [];
      for (let i = 0; i < Number(participantCount); i++) {
        participantsPromises.push(
          useReadContract.fetchData({
            address: gameAddress,
            abi: MILLIONAIRES_DILEMMA_ABI,
            functionName: "participants",
            args: [i],
          }).then(async (participantAddress) => {
            // Get participant name
            const name = await useReadContract.fetchData({
              address: gameAddress,
              abi: MILLIONAIRES_DILEMMA_ABI,
              functionName: "getParticipantName",
              args: [participantAddress],
            });
            
            // Check if participant has submitted
            const hasSubmitted = await useReadContract.fetchData({
              address: gameAddress,
              abi: MILLIONAIRES_DILEMMA_ABI,
              functionName: "hasParticipantSubmitted",
              args: [participantAddress],
            });
            
            return {
              address: participantAddress,
              name,
              hasSubmitted
            };
          })
        );
      }
      
      const participants = await Promise.all(participantsPromises);
      
      // Check if current user is a participant
      const userIsParticipant = participants.some(p => 
        p.address.toLowerCase() === userAddress?.toLowerCase()
      );
      setIsParticipant(userIsParticipant);
      
      // Check if current user has submitted
      if (userIsParticipant) {
        const userParticipant = participants.find(p => 
          p.address.toLowerCase() === userAddress?.toLowerCase()
        );
        setHasSubmitted(userParticipant?.hasSubmitted || false);
      }
      
      // Check if current user is the owner
      setIsOwner(gameOwner?.toLowerCase() === userAddress?.toLowerCase());
      
      // Check if comparison is done
      setComparisonDone(gameComparisonDone || false);
      
      // If comparison is done, get the winner
      if (gameComparisonDone) {
        try {
          const winnerName = await useReadContract.fetchData({
            address: gameAddress,
            abi: MILLIONAIRES_DILEMMA_ABI,
            functionName: "getWinner",
          });
          
          const winnerAddress = await useReadContract.fetchData({
            address: gameAddress,
            abi: MILLIONAIRES_DILEMMA_ABI,
            functionName: "winnerAddress",
          });
          
          setWinner({
            name: winnerName,
            address: winnerAddress
          });
        } catch (e) {
          console.error("Error fetching winner:", e);
        }
      }
      
      setGameData({
        address: gameAddress,
        owner: gameOwner,
        participants,
        comparisonDone: gameComparisonDone
      });
      
    } catch (err) {
      console.error("Error fetching game data:", err);
      setError("Failed to load game data");
    } finally {
      setIsLoading(false);
    }
  }, [gameAddress, isValidGame, gameOwner, gameComparisonDone, userAddress]);
  
  // Fetch game data when dependencies change
  useEffect(() => {
    if (isValidGame) {
      fetchGameData();
    }
  }, [fetchGameData, isValidGame, gameComparisonDone]);
  
  // Show result modal when winner is determined
  useEffect(() => {
    if (comparisonDone && winner) {
      setShowResultModal(true);
    }
  }, [comparisonDone, winner]);
  
  // Submit wealth handler
  const submitWealth = async (value) => {
    if (!gameAddress || !userAddress) return;
    
    try {
      // Convert to Wei and encrypt
      const weiValue = BigInt(value) * BigInt(10**18);
      
      // Encrypt the value
      const encryptedData = await encryptValue({
        value: weiValue,
        address: userAddress,
        contractAddress: gameAddress,
      });
      
      // Submit to contract
      const hash = await writeContractAsync({
        address: gameAddress,
        abi: MILLIONAIRES_DILEMMA_ABI,
        functionName: "submitWealth",
        args: [encryptedData],
      });
      
      // Wait for transaction receipt
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh game data
      fetchGameData();
      
    } catch (err) {
      console.error("Error submitting wealth:", err);
      throw new Error(err.message || "Failed to submit wealth");
    }
  };
  
  // Compare wealth handler (for owner)
  const compareWealth = async () => {
    if (!gameAddress || !isOwner) return;
    
    try {
      const hash = await writeContractAsync({
        address: gameAddress,
        abi: MILLIONAIRES_DILEMMA_ABI,
        functionName: "compareWealth",
      });
      
      // Wait for transaction receipt
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh game data
      fetchGameData();
      
    } catch (err) {
      console.error("Error comparing wealth:", err);
      setError(err.message || "Failed to compare wealth");
    }
  };

  // Add a share button functionality
  const shareGameLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Millionaire\'s Dilemma Game',
        text: 'Join this confidential wealth comparison game!',
        url: window.location.href,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Game link copied to clipboard! Share it with participants.');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Enhanced UI to show a "Compare Now" button when all participants have submitted
  const allSubmitted = gameData?.participants?.every(p => p.hasSubmitted) || false;
  
  if (!mounted || !isConnected) {
    return (
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (isValidGame === false) {
    return (
      <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <Link href="/games" className="text-white flex items-center hover:underline">
              <ArrowLeft className="mr-2" /> Back to Games
            </Link>
          </div>
          
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-8 rounded-lg text-center">
            <AlertCircle className="mx-auto mb-4 w-12 h-12" />
            <h2 className="text-2xl font-bold mb-2">Invalid Game</h2>
            <p>This game address was not created by the official factory contract.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-500 via-indigo-600 to-blue-700 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games" className="text-white flex items-center hover:underline">
            <ArrowLeft className="mr-2" /> Back to Games
          </Link>
          
          <button
            onClick={shareGameLink}
            className="bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
          >
            Share Game Link
          </button>
        </div>
        
        {isLoading ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center border border-white/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading game data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-300 p-6 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Trophy className="mr-3 text-yellow-300" />
                  Millionaire's Dilemma
                </h1>
                
                <div className="flex items-center">
                  {comparisonDone ? (
                    <span className="flex items-center text-green-400 text-sm bg-green-900/30 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-400 text-sm bg-amber-900/30 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-1" /> In Progress
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                  <Users className="mr-2 text-blue-300" />
                  Participants
                </h2>
                
                <ParticipantsList 
                  participants={gameData?.participants || []} 
                  currentUserAddress={userAddress}
                />
              </div>
              
              <div className="flex justify-center mt-8">
                {isParticipant && !hasSubmitted && !comparisonDone && (
                  <button 
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center"
                    onClick={() => setShowSubmitModal(true)}
                  >
                    <DollarSign className="mr-2" />
                    Submit Your Wealth
                  </button>
                )}
                
                {isParticipant && hasSubmitted && !comparisonDone && (
                  <button disabled className="bg-gray-500/50 text-white px-6 py-2.5 rounded-lg flex items-center cursor-not-allowed">
                    <CheckCircle className="mr-2" />
                    Wealth Submitted
                  </button>
                )}
                
                {isParticipant && allSubmitted && !comparisonDone && !isOwner && (
                  <button 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center ml-4"
                    onClick={compareWealth}
                  >
                    <Trophy className="mr-2" />
                    Compare Wealth
                  </button>
                )}
                
                {isOwner && !comparisonDone && (
                  <button 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center ml-4"
                    onClick={compareWealth}
                  >
                    <Trophy className="mr-2" />
                    Compare Wealth
                  </button>
                )}
                
                {comparisonDone && (
                  <button 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center"
                    onClick={() => setShowResultModal(true)}
                  >
                    <Trophy className="mr-2" />
                    View Results
                  </button>
                )}
              </div>
            </div>
            
            {/* Game info card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-white/70 text-sm mb-2">Game Address</h3>
              <p className="text-white/90 font-mono text-sm break-all">{gameAddress}</p>
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      <SubmitWealthModal 
        isOpen={showSubmitModal} 
        onClose={() => setShowSubmitModal(false)}
        onSubmit={submitWealth}
      />
      
      <GameResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        winner={winner}
        participants={gameData?.participants || []}
      />
    </div>
  );
} 