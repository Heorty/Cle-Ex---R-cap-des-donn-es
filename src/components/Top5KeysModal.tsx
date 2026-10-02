import React, { useRef, useState } from 'react';
import { X, Download, Copy, Check, Trophy, Star, ThumbsUp, Sparkles } from 'lucide-react';
import { KeyRanking } from '../data/analytics';
import { downloadElementAsPng, downloadElementAsSvg, copyElementToClipboard } from '../utils/exportUtils';

interface Top5KeysModalProps {
  topKeys: KeyRanking[];
  onClose: () => void;
}

export const Top5KeysModal: React.FC<Top5KeysModalProps> = ({ topKeys, onClose }) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const top5 = topKeys.slice(0, 5);

  const handleCopy = async () => {
    if (!posterRef.current) return;
    setCopied(true);
    await copyElementToClipboard(posterRef.current);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    await downloadElementAsPng(posterRef.current, `palmares_top_5_cles_cl225.png`);
    setDownloading(false);
  };

  const handleDownloadSvg = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    await downloadElementAsSvg(posterRef.current, `palmares_top_5_cles_cl225.svg`);
    setDownloading(false);
  };

  const rankBadges = [
    { bg: 'bg-amber-500 text-stone-950 border-amber-300', text: '1ER', medal: '🥇' },
    { bg: 'bg-stone-300 text-stone-950 border-stone-100', text: '2E', medal: '🥈' },
    { bg: 'bg-amber-700 text-amber-100 border-amber-600', text: '3E', medal: '🥉' },
    { bg: 'bg-stone-800 text-stone-300 border-stone-700', text: '4E', medal: '4' },
    { bg: 'bg-stone-800 text-stone-300 border-stone-700', text: '5E', medal: '5' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-6xl w-full bg-stone-900/70 backdrop-blur-xl border border-stone-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Sticky Header with Action Buttons ALWAYS visible on screen */}
        <div className="sticky top-0 z-50 p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="font-serif-cluny font-bold text-xs sm:text-sm text-stone-100 truncate">
                Affiche Top 5 des Clés d'Ex
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
              <span>{copied ? 'Copié !' : 'Copier l\'affiche'}</span>
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

        {/* Scrollable container for preview */}
        <div className="p-3 sm:p-6 overflow-x-auto bg-stone-950/60 flex justify-center">
          {/* THE POSTER CANVAS */}
          <div
            ref={posterRef}
            id="top5-keys-poster-canvas"
            className="w-[1100px] bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-stone-100 p-8 rounded-2xl border border-amber-900/50 shadow-2xl relative select-none flex flex-col justify-between"
            style={{ minWidth: '1100px' }}
          >
            {/* Poster Header */}
            <div className="text-center space-y-1 pb-6 border-b border-stone-800/80">
              <span className="text-xs uppercase tracking-[0.25em] font-mono-numbers text-amber-500 font-bold block">
                Promotion Cl225 · École Nationale Supérieure d'Arts et Métiers
              </span>
              <h1 className="font-serif-cluny text-3xl font-bold text-amber-100 tracking-wide">
                LE TOP 5 DES CLÉS D'EX PATRIMONIALES
              </h1>
              <p className="text-xs text-stone-400 max-w-xl mx-auto font-sans">
                Classement officiel issu des votes et superlikes de la consultation de promotion
              </p>
            </div>

            {/* Top 5 Cards Grid */}
            <div className="grid grid-cols-5 gap-4 my-6 items-stretch">
              {top5.map((keyItem, idx) => {
                const badge = rankBadges[idx] || rankBadges[4];
                const topQuote = keyItem.superlikeQuotes[0];

                return (
                  <div
                    key={keyItem.keyId}
                    className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg ${
                      idx === 0
                        ? 'bg-amber-950/25 border-amber-500/70 ring-1 ring-amber-500/30'
                        : idx < 3
                        ? 'bg-stone-900/90 border-stone-700/80'
                        : 'bg-stone-900/70 border-stone-800'
                    }`}
                  >
                    {/* Rank Header */}
                    <div className="p-2 border-b border-stone-800/80 flex items-center justify-between bg-stone-950/70">
                      <div className="flex items-center gap-1">
                        <span className="text-base">{badge.medal}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono-numbers font-bold border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono-numbers font-bold text-amber-300">
                        {keyItem.score > 0 ? `+${keyItem.score}` : keyItem.score} pts
                      </span>
                    </div>

                    {/* Image Area: Full Key Photo Unclipped */}
                    <div className="relative h-64 w-full bg-stone-950/80 p-2 flex items-center justify-center border-b border-stone-800/80">
                      {keyItem.imageUrl ? (
                        <img
                          src={keyItem.imageUrl}
                          alt={keyItem.label}
                          className="max-h-full max-w-full object-contain drop-shadow-md"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <span className="font-serif-cluny font-bold text-amber-400 text-sm">
                          {keyItem.label}
                        </span>
                      )}
                    </div>

                    {/* Meta & Stats */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2 bg-stone-900/60">
                      <div>
                        <h3 className="font-serif-cluny font-bold text-sm text-stone-100 truncate" title={keyItem.label}>
                          {keyItem.label}
                        </h3>
                        <span className="text-[10px] text-stone-400 font-mono-numbers block truncate">
                          {keyItem.year}
                        </span>
                      </div>

                      {/* Vote pill breakdown */}
                      <div className="pt-1.5 border-t border-stone-800 text-[10px] font-mono-numbers space-y-1">
                        <div className="flex justify-between text-stone-300">
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <ThumbsUp className="w-2.5 h-2.5" /> {keyItem.likes} likes
                          </span>
                          <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> {keyItem.superlikes}
                          </span>
                        </div>

                        <div className="flex justify-between text-stone-400 text-[9px]">
                          <span>Ratio L/D : {keyItem.likeDislikeRatio !== null ? `${keyItem.likeDislikeRatio}x` : '∞'}</span>
                          <span>{keyItem.approvalRate}% approbation</span>
                        </div>
                      </div>

                      {/* Quote if present */}
                      {topQuote?.reason && (
                        <div className="pt-1 border-t border-stone-800/60 text-[10px] text-stone-300 italic line-clamp-2 font-sans">
                          « {topQuote.reason} »
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Poster Footer */}
            <div className="border-t border-stone-800/80 pt-3 flex items-center justify-between text-[11px] font-mono-numbers text-stone-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Observatoire Clé d'Ex Cl225 — Document de restitution de promotion</span>
              </span>
              <span>Arts et Métiers · Campus de Cluny</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
