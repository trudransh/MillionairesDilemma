import { useEffect } from "react";
import { Trophy } from "lucide-react";

export default function GameResultModal({ isOpen, onClose, winner, participants }) {
  useEffect(() => {
    if (isOpen && winner) {
      // Add confetti animation here if you want
      // You can use a library like canvas-confetti
    }
  }, [isOpen, winner]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-indigo-900/90 to-violet-900/90 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-yellow-300 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-white">Game Results</h2>
        </div>
        
        {winner ? (
          <div className="text-center mb-8">
            <div className="bg-white/10 rounded-xl p-6 mb-4">
              <h3 className="text-xl font-semibold text-white mb-1">The Wealthiest Is</h3>
              <p className="text-2xl font-bold text-yellow-300 mb-2">{winner.name}</p>
              <p className="text-sm text-white/70 break-all">{winner.address}</p>
            </div>
            <p className="text-white/80">
              Congratulations! The winner is the participant with the highest encrypted wealth value.
            </p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <p className="text-white/80">No winner has been determined yet.</p>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 