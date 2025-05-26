import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorDisplay({ error, retry = null }) {
  return (
    <div className="bg-red-900/20 border border-red-500 text-red-300 p-6 rounded-lg flex flex-col items-center">
      <AlertTriangle className="w-8 h-8 mb-3" />
      <p className="text-center mb-2">{error}</p>
      
      {retry && (
        <button 
          onClick={retry}
          className="mt-3 flex items-center gap-2 bg-red-700/30 hover:bg-red-700/50 px-4 py-2 rounded-lg text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
} 