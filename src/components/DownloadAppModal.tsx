import React, { useState } from 'react';
import { Monitor, Smartphone, Download, X, Laptop, CheckCircle2, Copy, Sparkles } from 'lucide-react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 p-5 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-950/20 rounded-xl">
              <Download className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-tight">Instalar La Podrida (Offline)</h3>
              <p className="text-xs font-bold text-slate-950/80">
                Guía de Instalación para Windows 10/11, macOS Monterey y Android
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

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-200 overflow-y-auto max-h-[75vh]">
          {/* Top Recommendation Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Instalación Instantánea como App Nativa (PWA Offline)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La forma más rápida y recomendada de tener la app en el escritorio sin necesidad de simuladores es agregándola como <strong>PWA (Progressive Web App)</strong>. Funciona sin internet (offline) tanto en PC como en móviles.
            </p>
          </div>

          {/* CRITICAL NOTE FOR CHROME / AI STUDIO IFRAME */}
          <div className="bg-blue-950/40 border border-blue-500/30 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span>¿Dónde está exactamente el icono de instalación en Chrome?</span>
            </h4>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                ⚠️ PASO PREVIO OBLIGATORIO: Si estás viendo la app dentro del panel de AI Studio, Chrome NO muestra el botón de instalar en marcos (iframes). Primero haz clic en el botón <strong>"Abrir en nueva pestaña" (↗️)</strong> en la esquina superior derecha del navegador para abrir la app a pantalla completa.
              </p>
              <p className="pt-1 font-medium">Una vez abierta en su propia pestaña en Chrome, tienes 2 formas de encontrar el icono:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-300">
                <li>
                  <strong>Opción A (Barra de direcciones):</strong> En la barra superior donde escribes las webs (a la derecha, justo al lado de la estrella de favoritos ⭐), verás un pequeño icono con forma de <strong>pantalla con flecha hacia abajo (💻⬇️)</strong> o una miniatura que dice <em>"Instalar La Pocha"</em>.
                </li>
                <li>
                  <strong>Opción B (Menú de Chrome):</strong> Haz clic en los <strong>3 puntos verticales (⋮)</strong> en la esquina superior derecha de Chrome &gt; ve a <strong>"Guardar y compartir"</strong> &gt; selecciona <strong>"Instalar Anotador de La Pocha..."</strong>.
                </li>
              </ul>
            </div>
          </div>

          {/* OS-Specific Guides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Windows 10 / 11 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs mb-1.5">
                  <Monitor className="w-4 h-4 shrink-0" />
                  <span>PC Windows (.exe)</span>
                </div>
                <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre la app en Chrome o Microsoft Edge.</li>
                  <li>Haz clic en el icono <strong>Instalar La Pocha</strong> en la barra de direcciones (arriba a la derecha).</li>
                  <li>Se genera un acceso directo ejecutable en el Escritorio. Funciona sin internet.</li>
                </ol>
              </div>
            </div>

            {/* macOS Monterey */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs mb-1.5">
                  <Laptop className="w-4 h-4 shrink-0" />
                  <span>Mac macOS (.dmg)</span>
                </div>
                <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre en Safari o Chrome en tu Mac.</li>
                  <li>En Safari: Haz clic en <strong>Archivo &gt; Añadir al Dock</strong>.</li>
                  <li>En Chrome: icono de instalar app en la barra superior.</li>
                  <li>Se guarda en Aplicaciones/Dock como app independiente offline.</li>
                </ol>
              </div>
            </div>

            {/* iPhone / iOS */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs mb-1.5">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>iPhone / iPad (iOS)</span>
                </div>
                <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre esta dirección en Safari en tu iPhone.</li>
                  <li>Pulsa el botón <strong>Compartir</strong> (cuadrado con flecha hacia arriba).</li>
                  <li>Selecciona <strong>Añadir a la pantalla de inicio</strong>.</li>
                  <li>Tendrás el icono nativo a pantalla completa sin internet.</li>
                </ol>
              </div>
            </div>

            {/* Android */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-1.5">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Android</span>
                </div>
                <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abre la web en Chrome en tu móvil.</li>
                  <li>Pulsa el menú de 3 puntos (⋮).</li>
                  <li>Elige <strong>Añadir a la pantalla de inicio</strong> o <strong>Instalar Aplicación</strong>.</li>
                  <li>Acceso directo listo en tu pantalla de inicio.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Exporting full source / local build for EXE and DMG */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
              <Laptop className="w-4 h-4 text-amber-400" />
              <span>Compilar instaladores binarios (.exe / .dmg / .apk)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si deseas generar instaladores <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">.exe</code> para Windows, <code className="bg-slate-800 px-1 py-0.5 rounded text-purple-300">.dmg</code> para macOS Monterey o <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">.apk</code> para Android:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
              <p>1. Ve al menú de AI Studio &gt; pestaña <strong>Share</strong> (para publicar o copiar enlace) o pestaña <strong>Git Hub</strong> para descargar o sincronizar el código fuente.</p>
              <p>2. Abre la terminal en tu ordenador y ejecuta: <span className="text-amber-300">npm install &amp;&amp; npm run build</span></p>
              <p>3. Para crear <strong>.exe</strong> o <strong>.dmg</strong> con Electron/Nativefier: <span className="text-emerald-400">npx nativefier --name "LaPocha" dist/</span></p>
              <p>4. O abre el archivo estático <span className="text-cyan-300">dist/index.html</span> directamente en cualquier navegador de forma 100% offline.</p>
            </div>
          </div>

          {/* Share / Copy link */}
          <div className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
            <div className="truncate pr-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Enlace directo de la App:</p>
              <p className="text-xs font-mono text-amber-300 truncate">{currentUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Enlace Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-950" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
