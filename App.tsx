
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PredictionState, Match } from './types';
import { getDailyPredictions } from './services/gemini';
import Header from './components/Header';
import MatchCard from './components/MatchCard';

const App: React.FC = () => {
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const [state, setState] = useState<PredictionState>({
    matches: [],
    loading: true,
    error: null,
    date: getLocalDate(),
    groundingSources: []
  });

  // Ref para evitar chamadas duplicadas acidentais
  const isFetching = useRef(false);

  const fetchPredictions = useCallback(async (selectedDate: string) => {
    if (isFetching.current) return;
    
    isFetching.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, sources } = await getDailyPredictions(selectedDate);
      
      const groundingLinks = sources.map((chunk: any) => ({
        web: {
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || 'Fonte de Dados'
        }
      })).filter(s => s.web.uri);

      setState(prev => ({
        ...prev,
        matches: data.matches || [],
        loading: false,
        groundingSources: groundingLinks,
        error: data.matches.length === 0 ? "Nenhum jogo encontrado para esta data. Tente outro dia." : null
      }));
    } catch (err: any) {
      console.error("Erro ao carregar palpites:", err);
      let errorMsg = "Ocorreu um erro inesperado ao processar os dados de futebol.";
      
      if (err.message === "API_KEY_MISSING") {
        errorMsg = "Configuração Incompleta: A API_KEY não foi encontrada. Configure-a no painel do Netlify.";
      } else if (err.message === "API_KEY_INVALID") {
        errorMsg = "A chave de API configurada no Netlify parece ser inválida.";
      } else if (err.message === "SAFETY_BLOCK") {
        errorMsg = "A análise foi interrompida pelos filtros de segurança. Tente uma data diferente.";
      } else if (err.message === "EMPTY_RESPONSE") {
        errorMsg = "A IA não conseguiu gerar os dados. Por favor, tente atualizar novamente.";
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg
      }));
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPredictions(state.date);
  }, []);

  const handleDateChange = (newDate: string) => {
    setState(prev => ({ ...prev, date: newDate }));
    fetchPredictions(newDate);
  };

  const handleRefresh = () => {
    fetchPredictions(state.date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a]">
      <Header 
        onRefresh={handleRefresh} 
        loading={state.loading} 
        date={state.date}
        onDateChange={handleDateChange}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full inline-block"></span>
              <span>13 Seleções Diárias</span>
            </h2>
            <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Status: <span className="animate-pulse">{state.loading ? 'Analisando...' : 'Pronto'}</span>
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl">
            Nossa IA utiliza Google Search para analisar tendências globais, notícias de última hora e dados estatísticos para cada palpite.
          </p>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="glass-card h-80 rounded-2xl animate-pulse bg-white/5 border border-white/10"></div>
            ))}
          </div>
        ) : state.error ? (
          <div className="glass-card border-red-500/30 p-10 text-center rounded-2xl max-w-lg mx-auto mt-10 shadow-2xl shadow-red-500/5">
            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">A Análise Falhou</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {state.error}
            </p>
            <button 
              onClick={handleRefresh}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Tentar Novamente Agora
            </button>
            <p className="mt-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
              Dica: Verifique sua conexão ou tente uma data diferente.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {state.matches.map((match, index) => (
                <MatchCard key={match.id || `match-${index}`} match={match} index={index} />
              ))}
            </div>

            {state.groundingSources.length > 0 && (
              <div className="mt-16 bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Fontes de Dados (Google Search)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.groundingSources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 px-3 py-1.5 rounded-full transition-all truncate max-w-[200px]"
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

      <footer className="mt-auto border-t border-white/10 py-10 bg-slate-900/80">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">IA Predictive Engine v2.5</p>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
          <p className="text-gray-500 text-[10px] max-w-md mx-auto leading-relaxed">
            As previsões geradas são baseadas em algoritmos de probabilidade e dados históricos. O futebol é imprevisível. Use estas informações como ferramenta de apoio, nunca como garantia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
