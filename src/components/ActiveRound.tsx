import React, { useState, useEffect } from 'react';
import { GameRules, Player, Round, Suit } from '../types';
import { SUITS, getForbiddenDealerBid, getBiddingOrder, getHighestBidder } from '../utils/pocha';
import { CardDrawModal } from './CardDrawModal';
import { Mic, MessageSquare, CheckCircle, AlertCircle, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Flame, Crown, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveRoundProps {
  round: Round;
  players: Player[];
  rules: GameRules;
  totalRounds: number;
  onUpdateBids: (scores: Record<string, number>) => void;
  onUpdateActuals: (scores: Record<string, number>) => void;
  onChangeTrump: (trump: Suit) => void;
  onOpenVoiceModal: (mode: 'bids' | 'actuals') => void;
  onOpenAddPlayerModal?: () => void;
  onOpenEditRoundModal?: () => void;
}

export const ActiveRound: React.FC<ActiveRoundProps> = ({
  round,
  players,
  rules,
  totalRounds,
  onUpdateBids,
  onUpdateActuals,
  onChangeTrump,
  onOpenVoiceModal,
  onOpenAddPlayerModal,
  onOpenEditRoundModal,
}) => {
  const cards = round.cards;
  const dealer = players[round.dealerIndex] || players[0];
  const biddingOrder = getBiddingOrder(players, round.dealerIndex);

  // Local state for bids & actuals inputs before confirming
  const [bids, setBids] = useState<Record<string, number>>({});
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [showCardDrawModal, setShowCardDrawModal] = useState(false);

  // Sync state when round or phase changes
  useEffect(() => {
    const initialBids: Record<string, number> = {};
    const initialActuals: Record<string, number> = {};

    players.forEach((p) => {
      const s = round.scores[p.id];
      if (s?.bid !== undefined && s.bid !== null) {
        initialBids[p.id] = s.bid;
      } else {
        // Default bids to 0 directly so user doesn't need to tap + then - for 0
        initialBids[p.id] = 0;
      }

      if (s?.actual !== undefined && s.actual !== null) {
        initialActuals[p.id] = s.actual;
      } else {
        initialActuals[p.id] = 0;
      }
    });

    setBids(initialBids);
    setActuals(initialActuals);
  }, [round.id, round.phase, players]);

  // Forbidden bid for dealer calculation
  const forbiddenDealerBid = getForbiddenDealerBid(players, round.dealerIndex, {
    ...round,
    scores: Object.fromEntries(
      Object.entries(bids).map(([pId, b]) => [pId, { playerId: pId, bid: b, actual: null, points: 0, accumulatedPoints: 0, hit: null, difference: 0 }])
    )
  }, rules);

  const isDealerForbiddenViolated =
    round.phase === 'bidding' &&
    rules.forbiddenDealerBid &&
    forbiddenDealerBid !== null &&
    bids[dealer.id] === forbiddenDealerBid;

  // Total sums
  const totalBids = (Object.values(bids) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
  const totalActuals = (Object.values(actuals) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);

  const allBidsEntered = players.every((p) => bids[p.id] !== undefined && bids[p.id] !== null);
  const allActualsEntered = players.every((p) => actuals[p.id] !== undefined && actuals[p.id] !== null);

  const isBiddingPhase = round.phase === 'bidding';

  // Subastado: Find highest bidder from current bids
  const highestBidderInfo = getHighestBidder(players, {
    ...round,
    scores: Object.fromEntries(
      Object.entries(bids).map(([pId, b]) => [pId, { playerId: pId, bid: b, actual: null, points: 0, accumulatedPoints: 0, hit: null, difference: 0 }])
    ),
  });

  // Adjust bid for a player
  const handleBidChange = (playerId: string, delta: number) => {
    const current = bids[playerId] ?? 0;
    const nextVal = Math.max(0, Math.min(cards, current + delta));

    // If it's the dealer and it matches forbidden dealer bid
    if (playerId === dealer.id && rules.forbiddenDealerBid && nextVal === forbiddenDealerBid) {
      // Don't allow setting forbidden bid if user clicks button
      return;
    }

    setBids((prev) => ({ ...prev, [playerId]: nextVal }));
  };

  // Adjust actual tricks won for a player
  const handleActualChange = (playerId: string, delta: number) => {
    const current = actuals[playerId] ?? 0;
    const nextVal = Math.max(0, Math.min(cards, current + delta));
    setActuals((prev) => ({ ...prev, [playerId]: nextVal }));
  };

  // Auto balance actual tricks if only 1 player remains
  const handleAutoBalance = () => {
    const missingPlayer = players.find((p) => actuals[p.id] === undefined);
    if (missingPlayer) {
      const remaining = Math.max(0, cards - totalActuals);
      setActuals((prev) => ({ ...prev, [missingPlayer.id]: remaining }));
    } else {
      // Balance last player
      const lastPlayer = players[players.length - 1];
      const otherSum = Object.entries(actuals)
        .filter(([id]) => id !== lastPlayer.id)
        .reduce((sum: number, [, val]: [string, number]) => sum + val, 0);
      const remaining = Math.max(0, cards - otherSum);
      setActuals((prev) => ({ ...prev, [lastPlayer.id]: remaining }));
    }
  };

  const handleConfirmBids = () => {
    onUpdateBids(bids);
  };

  const handleConfirmActuals = () => {
    // Check if anyone got a Pocha to fire celebratory confetti
    const pochaPlayer = players.find((p) => {
      const b = bids[p.id];
      const a = actuals[p.id];
      return cards >= 4 && b === cards && a === cards;
    });

    if (pochaPlayer) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {
        // ignore
      }
    }

    onUpdateActuals(actuals);
  };

  const suitInfo = SUITS[round.trump];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all">
      {/* Active Round Header Banner */}
      <div className="bg-slate-950 p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Round & Card Count */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                Ronda {round.roundNumber} / {totalRounds}
              </span>
              {round.phaseName && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  round.isSubastado
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : round.isRandomTrumpMax
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : round.isVisibleTrumpMax
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {round.isSubastado && '👑 '}
                  {round.isRandomTrumpMax && '🎲 '}
                  {round.isVisibleTrumpMax && '👁️ '}
                  {round.phaseName}
                </span>
              )}

              {/* Quick Modals Triggers */}
              {onOpenEditRoundModal && (
                <button
                  type="button"
                  onClick={onOpenEditRoundModal}
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
                  title="Corregir un error en la puntuación de esta u otra ronda"
                >
                  <span>✏️ Corregir Ronda</span>
                </button>
              )}

              {onOpenAddPlayerModal && (
                <button
                  type="button"
                  onClick={onOpenAddPlayerModal}
                  className="text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md transition flex items-center space-x-1 cursor-pointer"
                  title="Añadir un nuevo jugador a mitad de partida"
                >
                  <span>➕ Unir Jugador</span>
                </button>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center space-x-3">
              <span>🃏 {cards} {cards === 1 ? 'Carta' : 'Cartas'}</span>
              {cards >= 4 && (
                <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pocha Posible ({cards} bazas = Doble del doble)</span>
                </span>
              )}
            </h3>

            {/* Dealer indicator */}
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span>Repartidor (Mano da la vuelta):</span>
              <span className="font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded text-xs">
                👑 {dealer.name}
              </span>
            </p>
          </div>

          {/* Right: Trump Suit Selector & Card Drawer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-start sm:items-end space-y-2">
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Triunfo en esta Ronda
              </span>
              <button
                onClick={() => setShowCardDrawModal(true)}
                className="text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center space-x-1 transition cursor-pointer"
                title="Sacar carta aleatoria de la baraja para definir triunfo"
              >
                <Shuffle className="w-3 h-3 text-amber-400" />
                <span>Sacar Carta Aleatoria</span>
              </button>
            </div>

            <div className="flex items-center space-x-1.5 flex-wrap">
              {(Object.keys(SUITS) as Suit[]).map((sKey) => {
                const s = SUITS[sKey];
                const isSelected = round.trump === sKey;
                return (
                  <button
                    key={sKey}
                    onClick={() => onChangeTrump(sKey)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer ${
                      isSelected
                        ? `${s.bgColor} ${s.color} ${s.borderColor} ring-2 ring-amber-400/50 scale-105 shadow-md`
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={`Cambiar a triunfo de ${s.name}`}
                  >
                    <span>{s.symbol}</span>
                    <span className="hidden md:inline">{s.name}</span>
                    {s.isDouble && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black ml-1">
                        x2
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {suitInfo.isDouble && (
              <span className="text-[11px] text-amber-400 font-bold mt-1 animate-pulse">
                ⚡ ¡Triunfo Oros! Puntuación DOBLE
              </span>
            )}
          </div>
        </div>

        {/* Banner for Subastado mode */}
        {round.isSubastado && (
          <div className="mt-4 bg-purple-950/60 border border-purple-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Crown className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-300">
                  Ronda de Subastado: El jugador que pida más bazas elige el triunfo
                </p>
                {highestBidderInfo ? (
                  <p className="text-xs text-purple-200 mt-0.5">
                    Mayor apuesta actual:{' '}
                    <strong className="text-amber-300 underline">{highestBidderInfo.player.name}</strong> con{' '}
                    <strong>{highestBidderInfo.bid} bazas</strong>. ¡Él/Ella debe poner el triunfo arriba!
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Realizad las apuestas para determinar quién fija el triunfo.
                  </p>
                )}
              </div>
            </div>

            {highestBidderInfo && (
              <span className="text-xs font-black bg-purple-500 text-slate-950 px-3 py-1 rounded-lg uppercase tracking-wider">
                Elige {highestBidderInfo.player.name}
              </span>
            )}
          </div>
        )}

        {/* Banner for Random Trump Max phase */}
        {round.isRandomTrumpMax && (
          <div className="mt-4 bg-cyan-950/60 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Shuffle className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-cyan-200">
                  Ronda de Cartas Máximas con Triunfo Aleatorio
                </p>
                <p className="text-xs text-cyan-300/80 mt-0.5">
                  Reparte <strong className="text-amber-300">{dealer.name}</strong>. Triunfo actual asignado al azar:{' '}
                  <strong className={`${suitInfo.color} font-black`}>
                    {suitInfo.name} {suitInfo.symbol}
                  </strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCardDrawModal(true)}
              className="text-xs font-black bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <Shuffle className="w-3.5 h-3.5 text-slate-950" />
              <span>Sacar Otra Carta</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Gameplay Controls */}
      <div className="p-5 sm:p-7 space-y-6">
        {/* Phase Indicator Tab Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isBiddingPhase ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <h4 className="text-lg font-extrabold text-white">
              {isBiddingPhase ? '1. Subasta (Pedir Bazas)' : '2. Resultado (Bazas Hechas)'}
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dictation options */}
            <button
              onClick={() => onOpenVoiceModal(isBiddingPhase ? 'bids' : 'actuals')}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-amber-500/30 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Dictar por Voz / Texto</span>
            </button>
          </div>
        </div>

        {/* Bidding or Actuals Input List (Ordered by Bidding Order starting from Mano) */}
        <div className="space-y-3">
          {biddingOrder.map((player, orderIdx) => {
            const isDealer = player.id === dealer.id;
            const currentBid = bids[player.id];
            const currentActual = actuals[player.id];
            const roundScore = round.scores[player.id];

            // Is bid forbidden for dealer?
            const isForbiddenForThisDealer =
              isBiddingPhase &&
              isDealer &&
              rules.forbiddenDealerBid &&
              forbiddenDealerBid !== null;

            // Is Pocha hit?
            const isPochaHit =
              !isBiddingPhase &&
              cards >= 4 &&
              currentBid === cards &&
              currentActual === cards;

            return (
              <div
                key={player.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPochaHit
                    ? 'bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-400/50'
                    : isDealer
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Player info & Order badge */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">
                    #{orderIdx + 1}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border border-slate-700 shadow-sm"
                    style={{ backgroundColor: `${player.color}20`, borderColor: player.color }}
                  >
                    {player.avatar}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{player.name}</span>
                      {isDealer && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Repartidor
                        </span>
                      )}
                      {round.isSubastado && highestBidderInfo?.player.id === player.id && (
                        <span className="bg-purple-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Pone Triunfo</span>
                        </span>
                      )}
                    </div>
                    {/* Secondary info showing previous round score or accumulated */}
                    <span className="text-xs text-slate-400">
                      Puntos acumulados:{' '}
                      <span className="text-amber-300 font-bold">
                        {roundScore?.accumulatedPoints ?? 0}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Counter Control depending on Phase */}
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  {isBiddingPhase ? (
                    /* Phase 1: Bids Control */
                    <div className="flex items-center space-x-3">
                      {isDealer && isForbiddenForThisDealer && (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg flex items-center space-x-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>No puedes pedir {forbiddenDealerBid}</span>
                        </span>
                      )}

                      <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                        <button
                          onClick={() => handleBidChange(player.id, -1)}
                          disabled={currentBid === undefined || currentBid <= 0}
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-black text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                          title="Restar 1 baza"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={cards}
                          value={currentBid !== undefined ? currentBid : 0}
                          onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) val = 0;
                            val = Math.max(0, Math.min(cards, val));
                            if (isDealer && rules.forbiddenDealerBid && val === forbiddenDealerBid) {
                              return;
                            }
                            setBids((prev) => ({ ...prev, [player.id]: val }));
                          }}
                          className="w-12 bg-transparent text-center text-xl font-black text-amber-300 focus:outline-none focus:bg-slate-800 rounded py-1 border-b border-dashed border-amber-500/40"
                          title="Puedes tocar para escribir el número directamente"
                        />
                        <button
                          onClick={() => handleBidChange(player.id, 1)}
                          disabled={
                            currentBid >= cards ||
                            (isDealer &&
                              rules.forbiddenDealerBid &&
                              (currentBid ?? 0) + 1 === forbiddenDealerBid)
                          }
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-black text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                          title="Sumar 1 baza"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Phase 2: Actuals Control */
                    <div className="flex items-center space-x-4">
                      {/* Show bid for comparison */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Pidió
                        </span>
                        <span className="text-sm font-bold text-amber-300">
                          {currentBid} {currentBid === 1 ? 'baza' : 'bazas'}
                        </span>
                      </div>

                      <div className="flex items-center bg-slate-900 rounded-xl border border-slate-700 p-1">
                        <button
                          onClick={() => handleActualChange(player.id, -1)}
                          disabled={currentActual === undefined || currentActual <= 0}
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-black text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                          title="Restar 1 baza hecha"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={cards}
                          value={currentActual !== undefined ? currentActual : 0}
                          onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) val = 0;
                            val = Math.max(0, Math.min(cards, val));
                            setActuals((prev) => ({ ...prev, [player.id]: val }));
                          }}
                          className="w-12 bg-transparent text-center text-xl font-black text-emerald-400 focus:outline-none focus:bg-slate-800 rounded py-1 border-b border-dashed border-emerald-500/40"
                          title="Puedes tocar para escribir el número directamente"
                        />
                        <button
                          onClick={() => handleActualChange(player.id, 1)}
                          disabled={currentActual >= cards}
                          className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-white font-black text-xl flex items-center justify-center transition cursor-pointer active:scale-95"
                          title="Sumar 1 baza hecha"
                        >
                          +
                        </button>
                      </div>

                      {/* Live Hit/Miss indicator & Pocha Badge */}
                      {currentActual !== undefined && currentBid !== undefined && (
                        <div className="w-24 text-center">
                          {isPochaHit ? (
                            <span className="text-xs font-black text-amber-950 bg-amber-400 px-2 py-1 rounded shadow flex items-center justify-center space-x-1 animate-bounce">
                              <Flame className="w-3.5 h-3.5 fill-amber-950" />
                              <span>POCHA! (+{5 * cards * 4} pts)</span>
                            </span>
                          ) : currentActual === currentBid ? (
                            <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                              ✓ Acierta
                            </span>
                          ) : (
                            <span className="text-xs font-extrabold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                              ✗ Falla ({Math.abs(currentBid - currentActual)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer & Validation Bar */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          {isBiddingPhase ? (
            /* Bidding Validation */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400">
                  Total Bazas Pedidas:{' '}
                  <span
                    className={`font-black text-sm ${
                      totalBids === cards ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  >
                    {totalBids} de {cards}
                  </span>
                </span>
                {rules.forbiddenDealerBid && forbiddenDealerBid !== null && (
                  <p className="text-xs text-rose-400 font-medium mt-0.5">
                    * El repartidor ({dealer.name}) no puede pedir{' '}
                    <strong className="underline font-bold">{forbiddenDealerBid}</strong> para no
                    empatar las {cards} cartas.
                  </p>
                )}
              </div>

              <button
                onClick={handleConfirmBids}
                disabled={!allBidsEntered || isDealerForbiddenViolated}
                title={
                  isDealerForbiddenViolated
                    ? `El repartidor no puede pedir ${forbiddenDealerBid} bazas`
                    : !allBidsEntered
                    ? 'Introduce las bazas de todos los jugadores'
                    : 'Confirmar apuestas y pasar a juego'
                }
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>Confirmar Bazas Pedidas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Actuals Validation */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div>
                  <span className="text-xs text-slate-400">
                    Total Bazas Hechas:{' '}
                    <span
                      className={`font-black text-sm ${
                        totalActuals === cards ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {totalActuals} / {cards}
                    </span>
                  </span>
                  {totalActuals !== cards && (
                    <p className="text-xs text-rose-400 font-bold mt-0.5 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Las bazas hechas deben sumar exactamente {cards} cartas.</span>
                    </p>
                  )}
                </div>

                {totalActuals !== cards && (
                  <button
                    onClick={handleAutoBalance}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Autocuadrar</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleConfirmActuals}
                disabled={!allActualsEntered || totalActuals !== cards}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-black px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle className="w-5 h-5 text-slate-950" />
                <span>Guardar Ronda y Puntuar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Draw Modal */}
      <CardDrawModal
        isOpen={showCardDrawModal}
        onClose={() => setShowCardDrawModal(false)}
        onSelectTrump={(s) => onChangeTrump(s)}
        title="Elección Aleatoria de Triunfo"
        subtitle="Corta la baraja para seleccionar el palo de triunfo de esta ronda"
      />
    </div>
  );
};
