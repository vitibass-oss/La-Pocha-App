import React from 'react';
import { HelpCircle, X, Shield, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-5 text-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-6 h-6 fill-slate-950" />
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Normas y Sistema de Puntuación</h3>
              <p className="text-xs font-semibold text-slate-900/80">
                Reglamento Oficial de La Pocha (4 a 8 Jugadores)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 transition text-slate-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm flex-1">
          {/* Section 1: Regla de Puntuación */}
          <section className="space-y-3">
            <h4 className="font-extrabold text-amber-400 text-base flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>1. Sistema de Puntuación Básica</span>
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <p>
                En cada ronda, antes de jugar las cartas, cada jugador declara las bazas que cree
                que va a ganar (Subasta). Al finalizar la ronda:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 font-medium">
                <li>
                  <strong className="text-emerald-400">Si ACERTAS exactamente:</strong> +10 puntos por
                  acertar + 5 puntos por cada baza hecha.
                </li>
                <li>
                  <strong className="text-rose-400">Si FALLAS (por arriba o por abajo):</strong> -10 puntos
                  por fallar - 5 puntos por cada baza de diferencia con la que pediste.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Regla de Pocha (Doble del Doble) */}
          <section className="space-y-3">
            <h4 className="font-extrabold text-amber-400 text-base flex items-center space-x-2">
              <span>🔥</span>
              <span>2. Regla de "Pocha" (Doble del Doble)</span>
            </h4>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-amber-200">
              <p className="font-semibold">
                Cuando un jugador logra ganar <strong>TODAS LAS BAZAS</strong> de una mano de 4 o más cartas, se considera <strong>POCHA</strong> y la puntuación es el <em>Doble del Doble (x4)</em>.
              </p>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20 text-xs text-slate-300">
                <span className="font-bold text-amber-400 block mb-1">
                  Ejemplo en Mano de 5 Cartas:
                </span>
                5 puntos por 5 bazas = 25. El doble = 50. ¡Y el doble por hacer Pocha = <strong>100 Puntos</strong>!
              </div>
            </div>
          </section>

          {/* Section 3: Regla de Oros Doble */}
          <section className="space-y-3">
            <h4 className="font-extrabold text-amber-300 text-base flex items-center space-x-2">
              <span>🪙</span>
              <span>3. Puntuación Especial para Triunfo de Oros</span>
            </h4>
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3 text-amber-200">
              <p className="font-semibold">
                Cuando el palo de triunfo de la mano es <strong>OROS</strong>, ¡toda la puntuación
                de la ronda se multiplica por dos!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20">
                  <span className="font-bold text-emerald-400 block mb-1">
                    Ejemplo Acierto en Oros:
                  </span>
                  Si un jugador pide 2 bazas y las acierta en Oros:
                  <br />
                  10 pts/baza (20) + 20 por acertar = <strong>40 Puntos</strong>.
                </div>
                <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/20">
                  <span className="font-bold text-rose-400 block mb-1">
                    Ejemplo Fallo en Oros:
                  </span>
                  Si un jugador pide 2 bazas y no las acierta (falla por 2):
                  <br />
                  -10 pts/baza (-20) - 20 por fallar = <strong>-40 Puntos</strong>.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Prohibición del Repartidor */}
          <section className="space-y-3">
            <h4 className="font-extrabold text-slate-200 text-base flex items-center space-x-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>4. Regla del Repartidor (Prohibido Empatar)</span>
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <p>
                El repartidor (Dealer) es el último en decir sus bazas pedidas. La suma total de
                las bazas pedidas por todos los jugadores{' '}
                <strong className="text-rose-400">NO puede ser igual</strong> al número total de
                cartas repartidas en esa mano.
              </p>
              <p className="text-xs text-slate-400 italic">
                Esto garantiza que siempre haya al menos un jugador que falle en cada mano.
              </p>
            </div>
          </section>

          {/* Section 5: Progresión de las Rondas y Subastado */}
          <section className="space-y-3">
            <h4 className="font-extrabold text-slate-200 text-base flex items-center space-x-2">
              <span>🃏</span>
              <span>5. Estructura de la Partida y Subastado</span>
            </h4>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <ol className="list-decimal list-inside space-y-1.5 font-medium">
                <li>
                  <strong>Elección de Triunfo:</strong> Al inicio de la partida o rondas, la baraja se corta para elegir un triunfo aleatorio extraído por un jugador.
                </li>
                <li>
                  <strong>Subida:</strong> Se reparten 1, 2, 3... subiendo hasta el número máximo de cartas posible.
                </li>
                <li>
                  <strong className="text-purple-300">Ronda de Subastado:</strong> Mano con cartas máximas donde NO hay triunfo prefijado. El jugador que pida mayor número de bazas elegirá el palo de triunfo.
                </li>
                <li>
                  <strong className="text-blue-300">Ronda de Triunfo Visible:</strong> Se juega con cartas máximas con el triunfo ya visible boca arriba en la mesa.
                </li>
                <li>
                  <strong>Bajada:</strong> Descendiendo progresivamente hasta volver a 1 carta.
                </li>
              </ol>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition cursor-pointer"
          >
            Entendido, volver al juego
          </button>
        </div>
      </div>
    </div>
  );
};
