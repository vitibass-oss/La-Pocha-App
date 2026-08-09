import React, { useEffect } from 'react';
import { PlayerStats } from '../types';
import confetti from 'canvas-confetti';
import { Trophy, Share2, Copy, Check, RotateCcw, X, Sparkles, Award } from 'lucide-react';

interface GameSummaryModalProps {
  isOpen: boolean;
  stats: PlayerStats[];
  onClose: () => void;
  onNewGame: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  isOpen,
  stats,
  onClose,
  onNewGame,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen || stats.length === 0) return null;

  const winner = stats[0];
  const second = stats[1];
  const third = stats[2];

  // Generate WhatsApp / Copyable text summary
  const generateShareText = () => {
    let text = `🎴 *RESULTADO PARTIDA DE LA POCHA* 🎴\n\n`;
    stats.forEach((st, idx) => {
      const medal = idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
      text += `${medal} *${st.player.name}*: ${st.totalPoints} pts (${st.hitPercentage}% aciertos)\n`;
    });
    text += `\nAnotado con Anotador y Analizador de La Pocha 🃏`;
    return text;
  };

  const handleCopy = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-6 text-slate-950 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 transition text-slate-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 mx-auto bg-slate-950/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl mb-2">
            🏆
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">¡Fin de la Partida!</h2>
          <p className="text-xs sm:text-sm font-bold text-slate-950/80 mt-1">
            Enhorabuena a <span className="underline">{winner?.player.name}</span> por la victoria
          </p>
        </div>

        {/* Podium Section */}
        <div className="p-6 overflow-y-auto space-y-6 text-white flex-1">
          <div className="grid grid-cols-3 gap-3 items-end pt-4 pb-2">
            {/* 2nd Place */}
            {second && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-center flex flex-col items-center">
                <span className="text-2xl mb-1">🥈</span>
                <span className="text-xs font-bold text-slate-400">2º Puesto</span>
                <span className="font-extrabold text-sm text-white truncate max-w-full">
                  {second.player.name}
                </span>
                <span className="text-sm font-black text-slate-300 mt-1">
                  {second.totalPoints} pts
                </span>
              </div>
            )}

            {/* 1st Place Winner */}
            {winner && (
              <div className="bg-gradient-to-b from-amber-500/20 to-slate-800 border-2 border-amber-500 rounded-2xl p-4 text-center flex flex-col items-center shadow-xl scale-105">
                <span className="text-3xl mb-1 animate-bounce">👑</span>
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  ¡CAMPEÓN!
                </span>
                <span className="font-black text-base text-amber-200 truncate max-w-full">
                  {winner.player.name}
                </span>
                <span className="text-xl font-black text-amber-300 mt-1">
                  {winner.totalPoints} pts
                </span>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                  {winner.hitPercentage}% Aciertos
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {third && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-center flex flex-col items-center">
                <span className="text-2xl mb-1">🥉</span>
                <span className="text-xs font-bold text-slate-400">3º Puesto</span>
                <span className="font-extrabold text-sm text-white truncate max-w-full">
                  {third.player.name}
                </span>
                <span className="text-sm font-black text-slate-300 mt-1">
                  {third.totalPoints} pts
                </span>
              </div>
            )}
          </div>

          {/* Full Classification List */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Clasificación Completa:
            </h4>
            {stats.map((st, idx) => (
              <div
                key={st.player.id}
                className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-400 w-6 text-center">{st.rank}º</span>
                  <span>{st.player.avatar}</span>
                  <span className="font-bold text-white">{st.player.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{st.hitPercentage}% aciertos</span>
                  <span className="font-black text-amber-300 text-sm">{st.totalPoints} pts</span>
                </div>
              </div>
            ))}
          </div>

          {/* Share Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Resumen para WhatsApp'}</span>
            </button>

            <button
              onClick={onNewGame}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-3 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Empezar Nueva Partida</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
