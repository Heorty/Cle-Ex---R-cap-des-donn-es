import React, { useState, useRef } from 'react';
import { X, Download, Copy, Check, Presentation } from 'lucide-react';
import { computeStats } from '../data/analytics';
import { downloadElementAsPng, downloadElementAsSvg, copyElementToClipboard } from '../utils/exportUtils';

interface PowerPointSlideModalProps {
  stats: ReturnType<typeof computeStats>;
  onClose: () => void;
}

export const PowerPointSlideModal: React.FC<PowerPointSlideModalProps> = ({ stats, onClose }) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { formAnalytics, questionsMap, activeBuilders, total, targetAudience, participationRate } = stats;
  const { swipeMetrics, part1, part2 } = formAnalytics;

  const topMaterial = questionsMap['post_materiaux']?.optionsStats?.[0];
  const secondMaterial = questionsMap['post_materiaux']?.optionsStats?.[1];
  const topDimension = questionsMap['post_taille_signification']?.optionsStats?.[0];
  const topTiming = questionsMap['pre_importance']?.optionsStats?.[0];

  const handleCopy = async () => {
    if (!slideRef.current) return;
    setCopied(true);
    await copyElementToClipboard(slideRef.current);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    if (!slideRef.current) return;
    setDownloading(true);
    await downloadElementAsPng(slideRef.current, `slide_synthese_cle_dex_cl225.png`);
    setDownloading(false);
  };

  const handleDownloadSvg = async () => {
    if (!slideRef.current) return;
    setDownloading(true);
    await downloadElementAsSvg(slideRef.current, `slide_synthese_cle_dex_cl225.svg`);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-5xl w-full bg-stone-900/70 backdrop-blur-xl border border-stone-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Sticky Header with Action Buttons ALWAYS visible on screen */}
        <div className="sticky top-0 z-50 p-3 sm:p-4 border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-stone-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Presentation className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="font-serif-cluny font-bold text-xs sm:text-sm text-stone-100 truncate">
                Slide PowerPoint (Format 16:9 HD)
              </span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-sm ${
                copied
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : 'bg-stone-950/60 hover:bg-stone-900 text-stone-200 border-stone-800/80'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copied ? 'Copié !' : 'Copier l\'image'}</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={downloading}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG HD</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              disabled={downloading}
              className="px-2.5 py-1.5 rounded-xl border bg-stone-950/60 hover:bg-stone-900 text-stone-400 border-stone-800/80 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 shrink-0 backdrop-blur-sm"
            >
              SVG
            </button>

            {/* Desktop close button */}
            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Preview Container */}
        <div className="p-3 sm:p-6 overflow-x-auto bg-stone-950/60 flex justify-center">
          {/* THE 16:9 SLIDE CANVAS */}
          <div
            ref={slideRef}
            id="powerpoint-slide-canvas"
            className="w-[960px] aspect-video bg-stone-950 text-stone-100 p-8 flex flex-col justify-between border border-stone-800 shadow-2xl relative select-none"
            style={{ minWidth: '960px' }}
          >
            {/* Slide Header */}
            <div className="flex items-start justify-between border-b border-stone-800/80 pb-4">
              <div>
                <span className="text-[11px] font-mono-numbers tracking-widest text-amber-500 uppercase font-semibold">
                  Consultation Promotion Cl225 · École Nationale Supérieure d'Arts et Métiers
                </span>
                <h1 className="font-serif-cluny text-2xl font-bold text-stone-100 tracking-wide mt-0.5">
                  Projet Clé d'Ex — Synthèse des Réponses & Directives
                </h1>
              </div>

              <div className="text-right font-mono-numbers text-xs">
                <span className="text-stone-400 block">Échantillon :</span>
                <strong className="text-amber-300 text-sm">
                  {total} répondants / {targetAudience} ({participationRate}%)
                </strong>
              </div>
            </div>

            {/* 3 Columns Layout */}
            <div className="grid grid-cols-3 gap-5 my-4 flex-1 items-stretch">
              {/* Column 1: Participation & Complétion */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800/90 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2 border-b border-stone-800 pb-1 font-serif-cluny">
                    1. Participation & Adhésion
                  </h3>
                  
                  <div className="space-y-2.5 text-xs font-mono-numbers">
                    <div>
                      <div className="flex justify-between text-stone-300 mb-1">
                        <span>Taux de participation</span>
                        <strong className="text-stone-100">{total} / {targetAudience} ({participationRate}%)</strong>
                      </div>
                      <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${participationRate}%` }} />
                      </div>
                    </div>

                    <div className="p-2 rounded bg-stone-950 border border-stone-800 flex justify-between items-center">
                      <span className="text-stone-400">Motiv'ss (actifs) :</span>
                      <strong className="text-amber-300 text-sm">{activeBuilders.length} ({total > 0 ? Math.round((activeBuilders.length / total) * 100) : 0}%)</strong>
                    </div>

                    <div className="p-2 rounded bg-stone-950 border border-stone-800 flex justify-between items-center">
                      <span className="text-stone-400">Temps cumulé promo :</span>
                      <strong className="text-stone-100 text-xs">{formAnalytics.timeMetrics.timeFormatted} ({formAnalytics.timeMetrics.totalMinutes} min)</strong>
                    </div>

                    <div className="space-y-1 pt-1 text-[11px] text-stone-400">
                      <div className="flex justify-between">
                        <span>Complétion Partie 1 :</span>
                        <span className="text-stone-200 font-semibold">{part1.answeredRequiredRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complétion Partie 2 :</span>
                        <span className="text-stone-200 font-semibold">{part2.answeredRequiredRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Questionnaire complet 100% :</span>
                        <span className="text-stone-200 font-semibold">{formAnalytics.overallCompletedRequiredRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-800">
                  Reste {formAnalytics.quorum50Remaining} voix pour dépasser 50% de la promo.
                </div>
              </div>

              {/* Column 2: Directives Techniques Consensuelles */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800/90 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2 border-b border-stone-800 pb-1 font-serif-cluny">
                    2. Consensus & Spécifications
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block font-mono-numbers">Matériaux plébiscités :</span>
                      <strong className="text-stone-100 block text-sm mt-0.5">{topMaterial?.label || 'Bimatériau'}</strong>
                      <span className="text-amber-300 font-mono-numbers text-[11px]">{topMaterial?.percentage}% des suffrages</span>
                      {secondMaterial && (
                        <div className="text-stone-400 text-[10px] mt-0.5">
                          Suivi de : {secondMaterial.label} ({secondMaterial.percentage}%)
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-800/80">
                      <span className="text-[10px] uppercase text-stone-400 block font-mono-numbers">Dimensions :</span>
                      <strong className="text-stone-100 block text-sm mt-0.5">{topDimension?.label || '225 cm (symbole Cl225)'}</strong>
                      <span className="text-amber-300 font-mono-numbers text-[11px]">{topDimension?.percentage}% des suffrages</span>
                    </div>

                    <div className="pt-2 border-t border-stone-800/80">
                      <span className="text-[10px] uppercase text-stone-400 block font-mono-numbers">Échéance souhaitée :</span>
                      <strong className="text-stone-200 block text-xs mt-0.5">{topTiming?.label || 'Pour Ex = 0'}</strong>
                      <span className="text-stone-400 font-mono-numbers text-[10px]">{topTiming?.percentage}% des réponses</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-800">
                  Orientation : tradition noble alliée à une mécanique moderne.
                </div>
              </div>

              {/* Column 3: Analyse des Swipes */}
              <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800/90 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-400 mb-2 border-b border-stone-800 pb-1 font-serif-cluny">
                    3. Engagement & Swipes
                  </h3>

                  <div className="space-y-2 text-xs font-mono-numbers">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded bg-stone-950 border border-stone-800">
                        <span className="text-[10px] text-stone-500 block">Total Swipes</span>
                        <strong className="text-stone-100 text-sm">{swipeMetrics.totalSwipes}</strong>
                      </div>
                      <div className="p-2 rounded bg-stone-950 border border-stone-800">
                        <span className="text-[10px] text-stone-500 block">Moyenne / pers.</span>
                        <strong className="text-amber-300 text-sm">{swipeMetrics.avgSwipesPerUser} clés</strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase text-stone-400 block mb-1">
                        Distribution de participation au swipe :
                      </span>
                      <div className="space-y-1">
                        {swipeMetrics.histogram.map((bin) => (
                          <div key={bin.range} className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400 truncate">{bin.label}</span>
                            <span className="font-semibold text-stone-200">
                              {bin.count} ({bin.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">{swipeMetrics.likeRate}% Likes</span>
                      <span className="text-rose-400 font-semibold">{swipeMetrics.dislikeRate}% Dislikes</span>
                      <span className="text-amber-400 font-semibold">{swipeMetrics.superlikeRate}% Superlikes</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-500 pt-2 border-t border-stone-800">
                  {swipeMetrics.usersWithSuperlikeCount} répondants ont déposé au moins un Superlike motivé.
                </div>
              </div>
            </div>

            {/* Slide Footer */}
            <div className="border-t border-stone-800/80 pt-3 flex items-center justify-between text-[10px] font-mono-numbers text-stone-500">
              <span>Observatoire Clé d'Ex Cl225 · Données brutes issues du questionnaire officiel</span>
              <span>Document prêt pour présentation PowerPoint</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
