import React, { useState } from 'react';
import { TeamResult, DesignatedPlayer } from '../types';

interface TeamDisplayProps {
  result: TeamResult;
  onClear: () => void;
}

const PlayerRow: React.FC<{ player: DesignatedPlayer; index: number }> = ({ player, index }) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
    <div className="flex items-center gap-3">
      <span className="text-gray-400 dark:text-gray-500 text-xs w-4">{index + 1}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200">{player.nome}</span>
    </div>
    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
      {player.posicao_designada}
    </span>
  </div>
);

const TeamDisplay: React.FC<TeamDisplayProps> = ({ result, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleShareNotification = () => {
    // Simulates notifying the group by creating a clipboard string
    const date = new Date().toLocaleDateString('pt-BR');
    let text = `⚽ *FUTSAL - Times Definidos (${date})* ⚽\n\n`;
    
    text += `🔵 *TIME A*\n`;
    result.Time_A.forEach(p => text += `• ${p.nome} (${p.posicao_designada})\n`);
    
    text += `\n🟠 *TIME B*\n`;
    result.Time_B.forEach(p => text += `• ${p.nome} (${p.posicao_designada})\n`);
    
    if(result.Reservas.length > 0) {
      text += `\n📋 *RESERVAS*\n`;
      result.Reservas.forEach(p => text += `• ${p.nome}\n`);
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Trigger local notification
      if (Notification.permission === "granted") {
        new Notification("Lista copiada!", {
          body: "Cole no WhatsApp do grupo para notificar os jogadores.",
          icon: "/favicon.ico" // Fallback
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex justify-end mb-2">
        <button 
          onClick={handleShareNotification}
          className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 px-3 py-1 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Copiado!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              Notificar Grupo (Copiar)
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Time A */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-t-4 border-blue-600 transition-colors duration-300">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold text-xl">Time A</h3>
            <div className="bg-blue-500 px-3 py-1 rounded-lg text-sm font-medium">
              {result.Time_A.length} Jogadores
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {result.Time_A.map((p, idx) => (
              <PlayerRow key={idx} player={p} index={idx} />
            ))}
          </div>
        </div>

        {/* Time B */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-t-4 border-orange-600 transition-colors duration-300">
          <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold text-xl">Time B</h3>
            <div className="bg-orange-500 px-3 py-1 rounded-lg text-sm font-medium">
              {result.Time_B.length} Jogadores
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {result.Time_B.map((p, idx) => (
              <PlayerRow key={idx} player={p} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {/* Reserves */}
      {result.Reservas.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto transition-colors duration-300">
          <div className="bg-gray-200 dark:bg-gray-800 p-3 border-b border-gray-300 dark:border-gray-700">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-center">Lista de Espera / Reservas</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {result.Reservas.map((p, idx) => (
                <span key={idx} className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-gray-700">
                  {p.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center pt-6">
        <button
          onClick={onClear}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 px-8 py-3 rounded-lg font-semibold shadow-sm transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpar e Iniciar Nova Lista
        </button>
      </div>

    </div>
  );
};

export default TeamDisplay;