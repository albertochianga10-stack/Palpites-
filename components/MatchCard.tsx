
import React from 'react';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  index: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, index }) => {
  const getPredictionColor = (pred: string) => {
    switch (pred) {
      case '1': return 'bg-green-600';
      case 'X': return 'bg-yellow-600';
      case '2': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getPredictionLabel = (pred: string) => {
    switch (pred) {
      case '1': return 'Home Win';
      case 'X': return 'Draw';
      case '2': return 'Away Win';
      default: return 'N/A';
    }
  };

  return (
    <div className="glass-card rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded">
          {match.league}
        </span>
        <span className="text-gray-400 text-xs font-medium">#{index + 1}</span>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 text-center">
          <p className="font-bold text-lg text-white mb-1">{match.homeTeam}</p>
          <span className="text-[10px] text-gray-400 uppercase">Home</span>
        </div>
        
        <div className="px-4">
          <div className="text-emerald-500 font-black text-xl italic">VS</div>
        </div>

        <div className="flex-1 text-center">
          <p className="font-bold text-lg text-white mb-1">{match.awayTeam}</p>
          <span className="text-[10px] text-gray-400 uppercase">Away</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          <div className={`${getPredictionColor(match.prediction)} w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg`}>
            {match.prediction}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Prediction</p>
            <p className="text-sm font-bold text-white">{getPredictionLabel(match.prediction)}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Confidence</p>
          <p className="text-sm font-bold text-emerald-400">{match.confidence}%</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-gray-300 leading-relaxed italic">
          "{match.reasoning}"
        </p>
      </div>
    </div>
  );
};

export default MatchCard;
