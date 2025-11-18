import React from 'react';
import { Player } from '../types';
import { IDEAL_TOTAL_PLAYERS } from '../constants';

interface PlayerListProps {
  players: Player[];
  onRemove: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, onRemove }) => {
  const getBadgeColor = (pos: string) => {
    switch (pos) {
      case 'Goleiro': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800';
      case 'Fixo': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800';
      case 'Pivô': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-400">Nenhum jogador confirmado ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Confirmados</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${players.length >= IDEAL_TOTAL_PLAYERS ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
          {players.length} Jogadores
        </span>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {players.map((player) => (
          <li key={player.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                {player.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{player.nome}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getBadgeColor(player.posicao_preferida)}`}>
                  {player.posicao_preferida}
                </span>
              </div>
            </div>
            <button 
              onClick={() => onRemove(player.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover jogador"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;