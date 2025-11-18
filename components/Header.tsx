import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  gameTime: string;
  setGameTime: (time: string) => void;
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme, gameTime, setGameTime, isOnline }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-800 to-emerald-600 dark:from-emerald-950 dark:to-emerald-900 text-white p-6 shadow-lg mb-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
              <path d="M2 12h20"></path>
            </svg>
            <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-emerald-800 ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} title={isOnline ? "Online e Sincronizado" : "Modo Local (Offline)"}></span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Futsal Balancer</h1>
            <div className="flex items-center gap-2">
              <p className="text-emerald-100 text-sm font-medium">Equilíbrio Dinâmico com Gemini 3 Pro</p>
              {isOnline && <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-100 border border-emerald-500/30">AO VIVO</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Game Time Input */}
          <div className="flex flex-col items-end">
            <label htmlFor="gameTime" className="text-xs text-emerald-100 mb-0.5 font-medium">
              Horário do Jogo
            </label>
            <input 
              type="time" 
              id="gameTime"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              className="bg-emerald-900/50 border border-emerald-500/50 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 bg-emerald-900/30 rounded-full hover:bg-emerald-900/50 transition-colors border border-emerald-500/30 text-emerald-100"
            title={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {darkMode ? (
              // Sun Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon Icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;