import { CheckCircle, Clock } from "lucide-react";

export default function ParticipantsList({ participants, currentUserAddress }) {
  return (
    <div className="space-y-2">
      {participants.length === 0 ? (
        <p className="text-white/70">No participants yet.</p>
      ) : (
        participants.map((participant) => (
          <div 
            key={participant.address} 
            className={`flex items-center justify-between p-3 rounded-lg ${
              participant.address.toLowerCase() === currentUserAddress?.toLowerCase() 
                ? 'bg-blue-900/30 border border-blue-500/30' 
                : 'bg-white/10'
            }`}
          >
            <div>
              <div className="font-medium text-white">
                {participant.name}
                {participant.address.toLowerCase() === currentUserAddress?.toLowerCase() && (
                  <span className="ml-2 text-blue-300 text-xs">(You)</span>
                )}
              </div>
              <div className="text-xs text-white/70 truncate max-w-[200px]">
                {participant.address}
              </div>
            </div>
            
            <div className="flex items-center">
              {participant.hasSubmitted ? (
                <div className="flex items-center text-emerald-400">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm">Submitted</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-400">
                  <Clock size={16} className="mr-1" />
                  <span className="text-sm">Pending</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
} 