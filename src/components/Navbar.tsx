import React from 'react';
import { Trophy, BarChart3, RotateCcw, PlusCircle, HelpCircle, Download, FolderArchive } from 'lucide-react';

interface NavbarProps {
  appName: string;
  onNewGame: () => void;
  onShowStats: () => void;
  onShowRules: () => void;
  onShowHistory?: () => void;
  onShowDownload?: () => void;
  onResetRound: () => void;
  isGameActive: boolean;
  currentRoundNum?: number;
  totalRoundsNum?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  appName,
  onNewGame,
  onShowStats,
  onShowRules,
  onShowHistory,
  onShowDownload,
  onResetRound,
  isGameActive,
  currentRoundNum,
  totalRoundsNum,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/20">
            🎴
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
              {appName}
            </h1>
            <p className="text-xs text-amber-400/80 font-medium hidden sm:block">
              La Pocha • Contador & Analizador
            </p>
          </div>
        </div>

        {/* Round Progress Badge */}
        {isGameActive && currentRoundNum && totalRoundsNum && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Ronda <span className="text-amber-400 font-bold">{currentRoundNum}</span> de {totalRoundsNum}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isGameActive && (
            <>
              <button
                onClick={onShowStats}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition border border-amber-500/30 hover:border-amber-500/60 shadow-sm cursor-pointer"
                title="Ver Estadísticas y Análisis"
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Estadísticas</span>
              </button>

              <button
                onClick={onResetRound}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition border border-slate-700 cursor-pointer"
                title="Reiniciar o Corregir Ronda"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span className="hidden md:inline">Reiniciar Ronda</span>
              </button>
            </>
          )}

          {onShowHistory && (
            <button
              onClick={onShowHistory}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition border border-slate-700 cursor-pointer"
              title="Ver Almacén de Partidas Guardadas e Histórico de Ganadores"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Histórico</span>
            </button>
          )}

          {onShowDownload && (
            <button
              onClick={onShowDownload}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition border border-amber-500/30 cursor-pointer"
              title="Instalar App Offline (Windows, Mac, Android)"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Instalar App</span>
            </button>
          )}

          <button
            onClick={onShowRules}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Normas y Puntuaciones"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={onNewGame}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs sm:text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isGameActive ? 'Nueva Partida' : 'Crear Partida'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
