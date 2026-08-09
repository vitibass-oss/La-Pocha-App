import React, { useState } from 'react';
import { Player, PlayerStats, Round } from '../types';
import { SUITS } from '../utils/pocha';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { BarChart3, Trophy, Flame, AlertTriangle, Coins, Target, X, Sparkles, TrendingUp } from 'lucide-react';

interface StatisticsModalProps {
  isOpen: boolean;
  players: Player[];
  rounds: Round[];
  stats: PlayerStats[];
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  players,
  rounds,
  stats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'hits_misses' | 'oros'>('overview');

  if (!isOpen) return null;

  // Prepare line chart data: Score evolution round by round
  const completedRounds = rounds.filter((r) => r.phase === 'completed');

  const timelineData = completedRounds.map((round) => {
    const entry: Record<string, any> = {
      roundName: `R${round.roundNumber} (${round.cards}c)`,
    };
    players.forEach((p) => {
      entry[p.name] = round.scores[p.id]?.accumulatedPoints ?? 0;
    });
    return entry;
  });

  // Prepare bar chart data: Hits vs Misses
  const hitsMissesData = stats.map((st) => ({
    name: st.player.name,
    Aciertos: st.totalHits,
    Fallos: st.totalMisses,
    Porcentaje: st.hitPercentage,
  }));

  // Prepare Oros vs Normal data
  const orosData = stats.map((st) => ({
    name: st.player.name,
    Oros: st.orosPoints,
    OtrosPalos: st.normalPoints,
  }));

  // Key Highlights
  const bestHitPlayer = [...stats].sort((a, b) => b.hitPercentage - a.hitPercentage)[0];
  const bestOrosPlayer = [...stats].sort((a, b) => b.orosPoints - a.orosPoints)[0];
  const maxStreakPlayer = [...stats].sort((a, b) => b.maxStreak - a.maxStreak)[0];

  // Worst single round blunder across all players
  let biggestBlunder: { player: Player; points: number; roundNumber: number } | null = null;
  completedRounds.forEach((round) => {
    players.forEach((p) => {
      const s = round.scores[p.id];
      if (s && s.points < 0) {
        if (!biggestBlunder || s.points < biggestBlunder.points) {
          biggestBlunder = { player: p, points: s.points, roundNumber: round.roundNumber };
        }
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl leading-tight">
                Estadísticas y Análisis de la Partida
              </h3>
              <p className="text-xs text-slate-400">
                Análisis de aciertos, fallos, rendimiento en Oros y evolución de puntos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-5 flex space-x-2 overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Resumen & Destacados', icon: Sparkles },
            { id: 'timeline', label: 'Evolución de Puntos', icon: TrendingUp },
            { id: 'hits_misses', label: 'Aciertos vs Fallos', icon: Target },
            { id: 'oros', label: 'Impacto de Oros', icon: Coins },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-white flex-1">
          {/* Tab 1: Overview Highlights */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Highlight Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Mano de Hierro (% Aciertos) */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30 shrink-0">
                    🎯
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      Mayor Precisión
                    </span>
                    <span className="font-black text-white text-base truncate block">
                      {bestHitPlayer?.player.name || '-'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {bestHitPlayer?.hitPercentage || 0}% de aciertos
                    </span>
                  </div>
                </div>

                {/* 2. Rey de Oros */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30 shrink-0">
                    🪙
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      Rey del Oros
                    </span>
                    <span className="font-black text-white text-base truncate block">
                      {bestOrosPlayer?.player.name || '-'}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      +{bestOrosPlayer?.orosPoints || 0} pts en Oros
                    </span>
                  </div>
                </div>

                {/* 3. Mayor Racha */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl border border-orange-500/30 shrink-0">
                    🔥
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      Mejor Racha
                    </span>
                    <span className="font-black text-white text-base truncate block">
                      {maxStreakPlayer?.player.name || '-'}
                    </span>
                    <span className="text-xs font-bold text-orange-400">
                      {maxStreakPlayer?.maxStreak || 0} aciertos seguidos
                    </span>
                  </div>
                </div>

                {/* 4. Mayor Descalabro */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl border border-rose-500/30 shrink-0">
                    ⚠️
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                      Mayor Descalabro
                    </span>
                    <span className="font-black text-white text-base truncate block">
                      {biggestBlunder?.player.name || '-'}
                    </span>
                    <span className="text-xs font-bold text-rose-400">
                      {biggestBlunder?.points || 0} pts (Ronda {biggestBlunder?.roundNumber || 0})
                    </span>
                  </div>
                </div>
              </div>

              {/* Table of Detailed Player Stats */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 font-extrabold text-sm text-amber-300">
                  Desglose General de Jugadores
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="p-3">Pos</th>
                        <th className="p-3">Jugador</th>
                        <th className="p-3 text-center">Puntos Totales</th>
                        <th className="p-3 text-center">Aciertos</th>
                        <th className="p-3 text-center">Fallos</th>
                        <th className="p-3 text-center">% Precisión</th>
                        <th className="p-3 text-center">Puntos en Oros</th>
                        <th className="p-3 text-center">Margen Error Medio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {stats.map((st) => (
                        <tr key={st.player.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold text-amber-400">{st.rank}º</td>
                          <td className="p-3 flex items-center space-x-2">
                            <span>{st.player.avatar}</span>
                            <span className="font-bold text-white">{st.player.name}</span>
                          </td>
                          <td className="p-3 text-center font-black text-amber-300 text-sm">
                            {st.totalPoints}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-400">
                            {st.totalHits}
                          </td>
                          <td className="p-3 text-center font-bold text-rose-400">
                            {st.totalMisses}
                          </td>
                          <td className="p-3 text-center font-bold">{st.hitPercentage}%</td>
                          <td className="p-3 text-center font-bold text-amber-400">
                            {st.orosPoints}
                          </td>
                          <td className="p-3 text-center text-slate-400">{st.avgErrorMargin} bazas</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Timeline Line Chart */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-amber-300">
                Evolución de Puntuación Acumulada por Ronda
              </h4>
              <p className="text-xs text-slate-400">
                Muestra la progresión de puntos de cada jugador en cada ronda completada.
              </p>

              <div className="h-80 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="roundName" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#fff',
                        }}
                      />
                      <Legend />
                      {players.map((p) => (
                        <Line
                          key={p.id}
                          type="monotone"
                          dataKey={p.name}
                          stroke={p.color}
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Completa al menos 1 ronda para ver el gráfico de evolución.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Hits vs Misses Bar Chart */}
          {activeTab === 'hits_misses' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-amber-300">
                Aciertos vs Fallos por Jugador
              </h4>
              <p className="text-xs text-slate-400">
                Compara cuántas veces acertó exactamente sus bazas pedidas contra cuántas falló.
              </p>

              <div className="h-80 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hitsMissesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Aciertos" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Fallos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab 4: Oros Impact Bar Chart */}
          {activeTab === 'oros' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-base text-amber-300">
                Impacto de Rondas con Triunfo de Oros (🪙 Puntuación Doble)
              </h4>
              <p className="text-xs text-slate-400">
                Compara los puntos ganados o perdidos en rondas de Oros frente a otros palos.
              </p>

              <div className="h-80 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orosData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Oros" fill="#F59E0B" name="Puntos en Oros (x2)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="OtrosPalos" fill="#3B82F6" name="Puntos en Copas/Espadas/Bastos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
