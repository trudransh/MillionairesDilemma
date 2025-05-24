import { useState } from "react";
import { DollarSign } from "lucide-react";

export default function SubmitWealthModal({ isOpen, onClose, onSubmit }) {
  const [wealthValue, setWealthValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    if (!wealthValue || Number(wealthValue) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await onSubmit(wealthValue);
      onClose();
    } catch (err) {
      console.error("Error submitting wealth:", err);
      setError(err.message || "Failed to submit wealth");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-indigo-900/90 to-violet-900/90 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="text-blue-300 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Submit Your Wealth</h2>
          <p className="text-white/70 mt-1">
            This value will be encrypted. No one will see the actual amount.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 mb-1 text-sm">Wealth Amount (ETH)</label>
            <input
              type="number"
              value={wealthValue}
              onChange={(e) => setWealthValue(e.target.value)}
              placeholder="Enter amount in ETH"
              className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/40"
            />
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!wealthValue || Number(wealthValue) <= 0 || isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Submit Securely"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 