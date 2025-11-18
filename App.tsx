import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import TeamDisplay from './components/TeamDisplay';
import { Player, PlayerInput, TeamResult } from './types';
import { balanceTeams } from './services/geminiService';
import { initFirebase, subscribeToPlayers, addPlayerRemote, removePlayerRemote, clearPlayersRemote, isOnline } from './services/firebase';
import { IDEAL_TOTAL_PLAYERS } from './constants';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineMode, setOnlineMode] = useState(false);

  // --- Theme State ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- Notification & Game Time State ---
  const [gameTime, setGameTime] = useState<string>("");
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Initialize Firebase & Subscription
  useEffect(() => {
    const connected = initFirebase();
    setOnlineMode(connected);

    if (connected) {
      // Subscribe to realtime updates
      const unsubscribe = subscribeToPlayers((syncedPlayers) => {
        setPlayers(syncedPlayers);
      });
      return () => unsubscribe(); // Cleanup listener
    }
    // If not connected, we just use local state (initialized as empty array above)
  }, []);

  // Apply Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        setNotificationPermission(perm);
      });
    }
  }, []);

  // Reminder Scheduler Effect
  useEffect(() => {
    if (!gameTime || notificationPermission !== 'granted') return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = gameTime.split(':').map(Number);
      const gameDate = new Date();
      gameDate.setHours(hours, minutes, 0, 0);

      const diffMs = gameDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes === 60) {
        new Notification("Futsal Balancer ⏰", {
          body: `Lembrete: O jogo começa em 1 hora (${gameTime})!`,
          icon: "/favicon.ico"
        });
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [gameTime, notificationPermission]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  const handleAddPlayer = async (input: PlayerInput) => {
    if (onlineMode) {
      try {
        await addPlayerRemote(input);
      } catch (e) {
        setError("Erro ao sincronizar jogador. Verifique sua conexão.");
      }
    } else {
      // Fallback Local
      const newPlayer: Player = {
        ...input,
        id: crypto.randomUUID(), 
      };
      setPlayers((prev) => [...prev, newPlayer]);
    }
  };

  const handleRemovePlayer = async (id: string) => {
    if (onlineMode) {
      try {
        await removePlayerRemote(id);
      } catch (e) {
        setError("Erro ao remover jogador remoto.");
      }
    } else {
      // Fallback Local
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleGenerateTeams = async () => {
    if (players.length < 4) { 
      setError("Adicione pelo menos jogadores suficientes para um mini-jogo (mínimo 4).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiPayload: PlayerInput[] = players.map(({ id, ...rest }) => rest);
      
      const result = await balanceTeams(apiPayload);
      setTeams(result);

      if (notificationPermission === 'granted') {
        new Notification("Times Gerados! ⚽", {
          body: "O Gemini 3 Pro finalizou o balanceamento dos times. Confira agora.",
        });
      }

    } catch (err) {
      console.error(err);
      setError("Falha ao gerar times. Verifique se a chave de API está configurada ou tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm("Tem certeza? Isso apagará todos os dados da lista.")) {
      if (onlineMode) {
        await clearPlayersRemote();
      } else {
        setPlayers([]);
      }
      setTeams(null);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
        gameTime={gameTime}
        setGameTime={setGameTime}
        isOnline={onlineMode}
      />
      
      <main className="max-w-4xl mx-auto px-4">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm flex justify-between items-center">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold">×</button>
          </div>
        )}

        {/* Online Config Check */}
        {!onlineMode && (
           <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-6 rounded">
            <p className="font-bold text-blue-700 dark:text-blue-400">Modo Local (Offline)</p>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Para ativar a sincronização em tempo real entre múltiplos dispositivos, configure as chaves do Firebase (FIREBASE_CONFIG ou variáveis REACT_APP_FIREBASE_*). 
              No momento, a lista está salva apenas no seu navegador.
            </p>
           </div>
        )}

        {/* API Key Check */}
        {!process.env.API_KEY && (
           <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <p className="font-bold text-yellow-700 dark:text-yellow-400">Aviso de IA</p>
            <p className="text-yellow-600 dark:text-yellow-300">Gemini API Key não detectada. O balanceamento não funcionará sem `process.env.API_KEY`.</p>
           </div>
        )}

        {teams ? (
          /* VIEW: Teams Generated */
          <TeamDisplay result={teams} onClear={handleClear} />
        ) : (
          /* VIEW: Registration */
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <PlayerForm onAddPlayer={handleAddPlayer} disabled={isLoading} />
              <PlayerList players={players} onRemove={handleRemovePlayer} />
            </div>

            <div className="md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Status do Jogo</h3>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Jogadores:</span>
                  <span className="font-mono font-bold text-2xl text-emerald-600 dark:text-emerald-400">{players.length}</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((players.length / IDEAL_TOTAL_PLAYERS) * 100, 100)}%` }}
                  ></div>
                </div>

                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex justify-between">
                    <span>Meta ideal:</span>
                    <span>{IDEAL_TOTAL_PLAYERS} jogadores</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goleiros:</span>
                    <span>{players.filter(p => p.posicao_preferida === 'Goleiro').length}</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateTeams}
                  disabled={isLoading || players.length < 2}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
                    ${isLoading 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait' 
                      : players.length >= IDEAL_TOTAL_PLAYERS
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse-slow ring-4 ring-emerald-200 dark:ring-emerald-900'
                        : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                      <span>Sortear Times</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                  Powered by Gemini 3 Pro
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;