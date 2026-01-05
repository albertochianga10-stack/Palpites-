
import React, { useState, useEffect, useCallback } from 'react';
import { PredictionState, Match } from './types';
import { getDailyPredictions } from './services/gemini';
import Header from './components/Header';
import MatchCard from './components/MatchCard';

const App: React.FC = () => {
  const [state, setState] = useState<PredictionState>({
    matches: [],
    loading: true,
    error: null,
    date: new Date().toISOString().split('T')[0],
    groundingSources: []
  });

  const fetchPredictions = useCallback(async (selectedDate: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, sources } = await getDailyPredictions(selectedDate);
      
      const groundingLinks = sources.map((chunk: any) => ({
        web: {
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || 'Fonte Externa'
        }
      })).filter(s => s.web.uri);

      setState(prev => ({
        ...prev,
        matches: data.matches || [],
        loading: false,
        groundingSources: groundingLinks
      }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Não foi possível recuperar os dados de futebol em tempo real. Verifique sua conexão e tente novamente."
      }));
    }
  }, []);

  useEffect(() => {
    fetchPredictions(state.date);
  }, []);

  const handleDateChange = (newDate: string) => {
    setState(prev => ({ ...prev, date: newDate }));
    fetchPredictions(newDate);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onRefresh={() => fetchPredictions(state.date)} 
        loading={state.loading} 
        date={state.date}
        onDateChange={handleDateChange}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
              <span>13 Seleções Diárias</span>
            </h2>
            <p className="text-sm text-gray-400">
              Gerado para: <span className="text-emerald-400 font-mono">{state.date}</span>
            </p>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Nossa IA analisa tendências ao vivo, notícias das equipes e dados históricos de plataformas como BeSoccer e Sofascore para fornecer estas probabilidades calculadas.
          </p>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="glass-card h-64 rounded-xl opacity-50"></div>
            ))}
          </div>
        ) : state.error ? (
          <div className="glass-card border-red-500/30 p-10 text-center rounded-2xl max-w-lg mx-auto mt-20">
            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">A Análise Falhou</h3>
            <p className="text-gray-400 text-sm mb-6">{state.error}</p>
            <button 
              onClick={() => fetchPredictions(state.date)}
              className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {state.matches.map((match, index) => (
                <MatchCard key={match.id || index} match={match} index={index} />
              ))}
            </div>

            {state.groundingSources.length > 0 && (
              <div className="mt-16 bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Fontes de Dados em Tempo Real
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.groundingSources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 px-3 py-1.5 rounded-full transition-all"
                    >
                      {source.web.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-white/10 py-8 bg-slate-900/80">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-xs mb-2">
            Aviso Legal: Os palpites são gerados por IA apenas para fins informativos. Recomendamos o jogo responsável.
          </p>
          <p className="text-emerald-500/50 text-[10px] font-bold tracking-widest uppercase">
            &copy; 2024 CUSTOMBET AI - PREVISÕES POTENCIALIZADAS POR IA
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
