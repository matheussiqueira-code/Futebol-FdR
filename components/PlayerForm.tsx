import React, { useState } from 'react';
import { POSITIONS } from '../constants';
import { PlayerInput, Position } from '../types';

interface PlayerFormProps {
  onAddPlayer: (player: PlayerInput) => void;
  disabled: boolean;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ onAddPlayer, disabled }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<Position>('Ala Direito');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlayer: PlayerInput = {
      nome: name.trim(),
      posicao_preferida: position,
      timestamp_registro: new Date().toISOString(),
    };

    onAddPlayer(newPlayer);
    setName('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border-l-4 border-emerald-500 transition-colors duration-300">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
        Nova Inscrição
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Jogador</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            placeholder="Ex: João Silva"
            required
            disabled={disabled}
          />
        </div>
        <div className="w-full md:w-64">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Posição Preferida</label>
          <select
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            disabled={disabled}
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={disabled || !name.trim()}
          className="w-full md:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>Confirmar</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </button>
      </form>
    </div>
  );
};

export default PlayerForm;