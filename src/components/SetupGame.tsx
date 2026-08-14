import React, { useState, useRef, useEffect } from 'react';
import { GameRules, Player } from '../types';
import { PLAYER_AVATARS, PLAYER_COLORS, getDefaultDeckForPlayers, TARGET_ROUNDS_FOR_PLAYERS } from '../utils/pocha';
import { RecentWinner } from '../utils/history';
import { RecentWinnersBoard } from './RecentWinnersBoard';
import { Users, Settings, Play, Sparkles, Check, HelpCircle, Mic, MicOff, FolderArchive } from 'lucide-react';

interface SetupGameProps {
  onStartGame: (players: Player[], rules: GameRules) => void;
  initialPlayers?: Player[];
  initialRules?: GameRules;
  recentWinners?: RecentWinner[];
  onOpenSavedGamesModal?: () => void;
}

export const SetupGame: React.FC<SetupGameProps> = ({
  onStartGame,
  initialPlayers,
  initialRules,
  recentWinners = [],
  onOpenSavedGamesModal,
}) => {
  const [numPlayers, setNumPlayers] = useState<number>(initialPlayers?.length || 5);

  const defaultNames = ['Carlos', 'María', 'Pedro', 'Ana', 'Luis', 'Sofia', 'David', 'Javier'];

  const [playerList, setPlayerList] = useState<Array<{ name: string; color: string; avatar: string }>>(() => {
    if (initialPlayers && initialPlayers.length >= 4) {
      return initialPlayers.map((p) => ({
        name: p.name,
        color: p.color,
        avatar: p.avatar,
      }));
    }
    return Array.from({ length: 8 }).map((_, idx) => ({
      name: defaultNames[idx] || `Jugador ${idx + 1}`,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
      avatar: PLAYER_AVATARS[idx % PLAYER_AVATARS.length],
    }));
  });

  const [rules, setRules] = useState<GameRules>(() => {
    const initNum = initialPlayers?.length || 5;
    const autoDeck = getDefaultDeckForPlayers(initNum);
    return initialRules || {
      forbiddenDealerBid: true,
      doubleOros: true,
      allowSinTriunfo: true,
      deckCards: autoDeck,
      pochaDoubleDouble: true,
      enableSubastado: true,
      singleMaxCardsRound: true,
      randomTrumpAfterSubastado: true,
      visibleTrumpAfterSubastado: false,
    };
  });

  const [voiceTargetIndex, setVoiceTargetIndex] = useState<number | 'all' | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceSpokenText, setVoiceSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef<boolean>(false);

  const deckCards = rules.deckCards || getDefaultDeckForPlayers(numPlayers);

  // Auto-switch deck cards when player count changes
  const handleNumPlayersChange = (count: number) => {
    setNumPlayers(count);
    const autoDeck = getDefaultDeckForPlayers(count);
    setRules((prev) => ({ ...prev, deckCards: autoDeck }));
  };

  // Voice recognition setup for Player Names
  const startVoiceForPlayer = (target: number | 'all') => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta micrófono de voz directo. Puedes escribir los nombres.');
      return;
    }

    if (isListeningVoice && voiceTargetIndex === target) {
      // Stop listening
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListeningVoice(false);
      setVoiceTargetIndex(null);
      return;
    }

    // Stop existing if any
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    setVoiceTargetIndex(target);
    setVoiceSpokenText('');
    shouldListenRef.current = true;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'es-ES';

    rec.onstart = () => {
      setIsListeningVoice(true);
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        try { rec.start(); } catch (e) { setIsListeningVoice(false); }
      } else {
        setIsListeningVoice(false);
        setVoiceTargetIndex(null);
      }
    };

    rec.onerror = (e: any) => {
      console.log('Voice error:', e);
      if (e.error === 'no-speech' && shouldListenRef.current) {
        try { rec.start(); } catch (err) {}
      } else {
        setIsListeningVoice(false);
      }
    };

    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      const cleaned = transcript.trim();
      setVoiceSpokenText(cleaned);

      if (target === 'all') {
        // Split names by comma, 'y', 'con', spaces or 'jugador'
        const rawNames = cleaned
          .replace(/jugador \d+/gi, '')
          .split(/[,;\n\t]|(?:\s+y\s+)|(?:\s+e\s+)/i)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (rawNames.length > 0) {
          setPlayerList((prev) => {
            const copy = [...prev];
            rawNames.forEach((name, i) => {
              if (i < numPlayers) {
                const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                copy[i].name = formattedName;
              }
            });
            return copy;
          });
        }
      } else if (typeof target === 'number') {
        if (cleaned) {
          const formattedName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          setPlayerList((prev) => {
            const copy = [...prev];
            copy[target].name = formattedName;
            return copy;
          });
        }
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error('Rec start error:', err);
    }
  };

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleDeckCardsChange = (cardsCount: number) => {
    setRules((prev) => ({ ...prev, deckCards: cardsCount }));
  };

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerList];
    updated[index].name = name;
    setPlayerList(updated);
  };

  const handleColorChange = (index: number, color: string) => {
    const updated = [...playerList];
    updated[index].color = color;
    setPlayerList(updated);
  };

  const handleAvatarChange = (index: number, avatar: string) => {
    const updated = [...playerList];
    updated[index].avatar = avatar;
    setPlayerList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlayers: Player[] = playerList.slice(0, numPlayers).map((p, idx) => ({
      id: `player_${idx + 1}`,
      name: p.name.trim() || `Jugador ${idx + 1}`,
      color: p.color,
      avatar: p.avatar,
    }));
    onStartGame(finalPlayers, rules);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 🏆 Persistent History: Last 5 Winners Board */}
      <RecentWinnersBoard
        winners={recentWinners}
        onOpenHistoryModal={onOpenSavedGamesModal}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Bento Header Banner */}
        <div className="bg-slate-950 p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)] animate-pulse" />
                <span className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest">
                  Partida Personalizada
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
                Pocha <span className="text-yellow-500 underline decoration-4 underline-offset-4">Tracker</span>
              </h1>
              <p className="text-slate-400 text-sm font-mono mt-1">
                Configura jugadores, mazo de cartas y normas de puntuación
              </p>
            </div>

            <div className="flex items-center gap-3">
              {onOpenSavedGamesModal && (
                <button
                  type="button"
                  onClick={onOpenSavedGamesModal}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-xl text-center text-xs font-bold text-slate-300 hover:text-amber-400 transition flex items-center space-x-1.5 cursor-pointer"
                  title="Abrir almacén de partidas guardadas"
                >
                  <FolderArchive className="w-4 h-4 text-amber-400" />
                  <span>Histórico</span>
                </button>
              )}

              <div className="bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-center min-w-[120px]">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cartas en Mazo</p>
                <p className="text-2xl font-black text-yellow-500">{deckCards}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 text-white">
          {/* 1. Selector de Jugadores & Cartas del Mazo (Bento Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jugadores */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-yellow-500 font-bold">
                <Users className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  1. Número de Jugadores
                </h3>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[4, 5, 6, 7, 8].map((count) => {
                  const isSelected = numPlayers === count;
                  const roundsCount = TARGET_ROUNDS_FOR_PLAYERS[count] || 32;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleNumPlayersChange(count)}
                      className={`py-2.5 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-lg font-black">{count}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                        Jug.
                      </span>
                      <span className={`text-[8px] font-black px-1 rounded mt-0.5 ${
                        isSelected ? 'bg-slate-950/20 text-slate-950' : 'text-amber-400/90'
                      }`}>
                        {roundsCount}R
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Cartas de la Baraja */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-yellow-500 font-bold">
                  <span className="text-lg">🎴</span>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    2. Cartas en la Baraja
                  </h3>
                </div>
                <span className="text-xs font-mono text-yellow-500 font-bold">
                  Max: {Math.floor(deckCards / numPlayers)} cartas/mano
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[40, 48, 49, 50, 52].map((cardCount) => {
                  const isSelected = deckCards === cardCount;
                  return (
                    <button
                      key={cardCount}
                      type="button"
                      onClick={() => handleDeckCardsChange(cardCount)}
                      className={`py-3 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-yellow-500 text-slate-950 border-yellow-400 font-black shadow-[0_0_12px_rgba(234,179,8,0.4)] scale-105'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-xl font-black">{cardCount}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                        Cartas
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Deck Card Input Option */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Personalizar número exacto:</span>
                <input
                  type="number"
                  min={12}
                  max={100}
                  value={deckCards}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      handleDeckCardsChange(val);
                    }
                  }}
                  className="w-20 bg-slate-900 border border-slate-700 focus:border-yellow-500 text-yellow-400 font-black rounded-lg px-2 py-1 text-center text-sm outline-none"
                />
              </div>
            </section>
          </div>

          {/* 3. Lista de Jugadores */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-yellow-500 font-bold">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  3. Nombres de los Jugadores
                </h3>
              </div>

              {/* Dictar Todos por Voz */}
              <button
                type="button"
                onClick={() => startVoiceForPlayer('all')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                  isListeningVoice && voiceTargetIndex === 'all'
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isListeningVoice && voiceTargetIndex === 'all'
                    ? 'Escuchando nombres... (Clic para parar)'
                    : '🎙️ Dictar Todos los Nombres por Voz'}
                </span>
              </button>
            </div>

            {voiceSpokenText && (
              <p className="text-xs text-amber-300 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                Oído: "{voiceSpokenText}"
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {playerList.slice(0, numPlayers).map((p, idx) => {
                const isThisPlayerMicActive = isListeningVoice && voiceTargetIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`bg-slate-900/60 border rounded-xl p-3.5 flex items-center space-x-3 transition ${
                      isThisPlayerMicActive ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const nextAvatarIdx =
                          (PLAYER_AVATARS.indexOf(p.avatar) + 1) % PLAYER_AVATARS.length;
                        handleAvatarChange(idx, PLAYER_AVATARS[nextAvatarIdx]);
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700 cursor-pointer shrink-0"
                      title="Cambiar avatar"
                    >
                      {p.avatar}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Jugador {idx + 1}
                        </label>
                        {/* Mic per player */}
                        <button
                          type="button"
                          onClick={() => startVoiceForPlayer(idx)}
                          className={`p-1 rounded transition text-xs flex items-center space-x-1 ${
                            isThisPlayerMicActive
                              ? 'text-rose-400 bg-rose-500/20 animate-pulse font-bold'
                              : 'text-slate-400 hover:text-amber-400'
                          }`}
                          title="Dictar nombre para este jugador"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span className="text-[9px]">{isThisPlayerMicActive ? 'Habla...' : 'Dictar'}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        placeholder={`Jugador ${idx + 1}`}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500 rounded-lg px-3 py-1.5 text-sm font-bold text-white placeholder-slate-600 outline-none transition"
                        required
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 w-12 justify-end shrink-0">
                      {PLAYER_COLORS.slice(0, 4).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorChange(idx, c)}
                          className={`w-4 h-4 rounded-full transition cursor-pointer ${
                            p.color === c ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Normas y Opciones */}
          <section className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-2 text-yellow-500 font-bold">
              <Settings className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                4. Reglas de Puntuación
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regla Pocha Doble del Doble */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.pochaDoubleDouble !== false}
                  onChange={(e) => setRules({ ...rules, pochaDoubleDouble: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🔥</span>
                    <span className="font-bold text-sm text-yellow-400">
                      Hacer Pocha (Doble del Doble)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Si se piden todas las bazas en manos de 4+ cartas (Pocha): acierto = +(5×cartas + 10)×2 (o ×4 en Oros). Ej. 8c en Oros: +200 / -200 ptos (8×5=40 + 10=50, ×2 Oros = 100, ×2 Pocha = 200).
                  </p>
                </div>
              </label>

              {/* Regla Ronda Única de Todas las Cartas vs Vuelta Completa */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.singleMaxCardsRound !== false}
                  onChange={(e) => setRules({ ...rules, singleMaxCardsRound: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🃏</span>
                    <span className="font-bold text-sm text-emerald-400">
                      1 Sola Ronda de Todas las Cartas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {rules.singleMaxCardsRound !== false
                      ? 'Se juega exactamente 1 sola mano en la cima con todas las cartas, pasando directamente a la bajada.'
                      : 'Se juega 1 vuelta completa de todas las cartas (1 mano repartida por cada jugador).'}
                  </p>
                </div>
              </label>

              {/* Regla Ronda de Subastado */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.enableSubastado !== false}
                  onChange={(e) => setRules({ ...rules, enableSubastado: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">👑</span>
                    <span className="font-bold text-sm text-purple-300">
                      Subastado en Todas las Cartas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    En la ronda de todas las cartas, el jugador que pida más bazas elige el palo de triunfo.
                  </p>
                </div>
              </label>

              {/* Regla Triunfo Aleatorio si no es Subastado */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.randomTrumpAfterSubastado !== false}
                  onChange={(e) => setRules({ ...rules, randomTrumpAfterSubastado: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🎲</span>
                    <span className="font-bold text-sm text-cyan-300">
                      Triunfo Aleatorio por Repartidor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Si no se juega subastado, en la vuelta de cartas máximas cada repartidor saca una carta al azar de la baraja para definir su triunfo.
                  </p>
                </div>
              </label>

              {/* Regla de Oros Doble */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.doubleOros}
                  onChange={(e) => setRules({ ...rules, doubleOros: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🪙</span>
                    <span className="font-bold text-sm text-yellow-400">
                      Oros Puntea Doble
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Si el triunfo es Oros: +20 por acertar (+10/baza) y -20 por fallar (-10/baza fallada).
                  </p>
                </div>
              </label>

              {/* Regla Prohibido Empatar Repartidor */}
              <label className="bg-slate-900/40 border border-slate-800 hover:border-yellow-500/40 rounded-xl p-4 flex items-start space-x-3 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={rules.forbiddenDealerBid}
                  onChange={(e) => setRules({ ...rules, forbiddenDealerBid: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-yellow-500 bg-slate-950 border-slate-800"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🚫</span>
                    <span className="font-bold text-sm text-yellow-400">
                      Prohibido Igualar el Repartidor
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    La suma de bazas pedidas por todos los jugadores no puede coincidir con el total de cartas de la mano.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-4 px-6 rounded-xl text-lg uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition cursor-pointer flex items-center justify-center space-x-3"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>¡Comenzar Partida ({deckCards} cartas)!</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
