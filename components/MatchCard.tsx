
import React from 'react';
import { Match } from '../types';

interface MatchCardProps {
  match: Match;
  index: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, index }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden">
      {/* Elemento decorativo de fundo */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
          {match.league}
        </span>
        <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Seleção</span>
            <span className="text-gray-300 text-xs font-black bg-white/5 w-6 h-6 flex items-center justify-center rounded">
                {index + 1}
            </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex-1 text-center">
          <p className="font-extrabold text-base text-white mb-0.5 line-clamp-1">{match.homeTeam}</p>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Casa</span>
        </div>
        
        <div className="px-3 flex flex-col items-center">
          <div className="text-emerald-500 font-black text-xs italic opacity-40">VS</div>
        </div>

        <div className="flex-1 text-center">
          <p className="font-extrabold text-base text-white mb-0.5 line-clamp-1">{match.awayTeam}</p>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Fora</span>
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 group-hover:bg-emerald-500/20 transition-colors">
          <div className="flex-1">
             <div className="flex items-center space-x-2 mb-3">
                <div className="h-[2px] w-4 bg-emerald-500"></div>
                <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">Combo CustomBet</span>
             </div>
             
             <div className="space-y-3">
                <div className="flex items-start space-x-3">
                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-900 font-bold">1</div>
                    <p className="text-sm font-bold text-white leading-tight">{match.market1}</p>
                </div>
                
                <div className="flex items-center px-7">
                    <div className="text-emerald-500 font-black text-xs">+</div>
                </div>

                <div className="flex items-start space-x-3">
                    <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-900 font-bold">2</div>
                    <p className="text-sm font-bold text-white leading-tight">{match.market2}</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Confiança</span>
            </div>
            <span className="text-sm font-black text-emerald-400 italic">{match.confidence}%</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
        <p className="text-[11px] text-gray-400 leading-relaxed italic">
          &ldquo;{match.reasoning}&rdquo;
        </p>
      </div>
    </div>
  );
};

export default MatchCard;
