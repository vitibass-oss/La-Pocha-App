import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerStats } from '../types';
import { PLAYER_AVATARS, PLAYER_COLORS } from '../utils/pocha';
import { UserPlus, Sparkles, Mic, X, Check, Award } from 'lucide-react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPlayers: Player[];
  stats: PlayerStats[];
  currentRoundIndex: number;
  onAddPlayer: (newPlayer: Player) => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  existingPlayers,
  stats,
  currentRoundIndex,
  onAddPlayer,
}) => {
  // Find player with lowest total points
  const minPoints = stats.length > 0 ? Math.min(...stats.map((s) => s.totalPoints)) : 0;
  const minPlayer = stats.find((s) => s.totalPoints === minPoints);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(
    PLAYER_AVATARS[(existingPlayers.length + 2) % PLAYER_AVATARS.length]
  );
  const [color, setColor] = useState(
    PLAYER_COLORS[existingPlayers.length % PLAYER_COLORS.length]
  );

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAvatar(PLAYER_AVATARS[(existingPlayers.length + 2) % PLAYER_AVATARS.length]);
      setColor(PLAYER_COLORS[existingPlayers.length % PLAYER_COLORS.length]);
    }
  }, [isOpen, existingPlayers.length]);

  if (!isOpen) return null;

  const handleVoiceDictate = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Dictado por voz no disponible en este navegador.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'es-ES';

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const cleaned = transcript.trim();
      if (cleaned) {
        const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        setName(formatted);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Jugador ${existingPlayers.length + 1}`;

    const newPlayer: Player = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: finalName,
      avatar,
      color,
      startingPoints: minPoints,
      joinedAtRoundIndex: currentRoundIndex,
    };

    onAddPlayer(newPlayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Añadir Jugador a Mitad de Partida</h3>
              <p className="text-xs text-slate-400">Incorpora un jugador durante la ronda en curso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule Banner: Starts with fewest points */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <Award className="w-4 h-4 shrink-0" />
            <span>Puntuación Inicial Automática</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Según las normas de La Pocha, el nuevo jugador entra a la partida asignándole los puntos del jugador con <strong className="text-amber-300">menos puntos</strong> actualmente.
          </p>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
            <span className="text-slate-400">Jugador con menos puntos:</span>
            <span className="font-extrabold text-amber-300">
              {minPlayer ? `${minPlayer.player.name} (${minPoints} pts)` : `${minPoints} pts`}
            </span>
          </div>
        </div>

        {/* Player Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Nombre del Nuevo Jugador
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Jugador ${existingPlayers.length + 1}`}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none transition"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={handleVoiceDictate}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                }`}
                title="Dictar nombre por voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAYER_AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition border cursor-pointer ${
                    avatar === a
                      ? 'bg-amber-500/20 border-amber-500 scale-110'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition cursor-pointer ${
                    color === c ? 'ring-4 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl transition text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Unir Jugador ({minPoints} pts)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
