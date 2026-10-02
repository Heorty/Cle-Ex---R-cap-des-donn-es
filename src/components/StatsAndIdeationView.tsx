import React, { useState } from 'react';
import { 
  BarChart3, Sparkles, Search, Hammer, Users, 
  Presentation, Clock, ThumbsUp, ThumbsDown, Star,
  TrendingUp, Award, Layers, Trophy, Hourglass
} from 'lucide-react';
import { computeStats } from '../data/analytics';
import { ExportMenu } from './ExportMenu';
import { PowerPointSlideModal } from './PowerPointSlideModal';
import { Top5KeysModal } from './Top5KeysModal';

interface StatsAndIdeationViewProps {
  stats: ReturnType<typeof computeStats>;
}

export const StatsAndIdeationView: React.FC<StatsAndIdeationViewProps> = ({ stats }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [ideaSearch, setIdeaSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('all');
  const [onlyMotivss, setOnlyMotivss] = useState(false);
  const [showPowerPointModal, setShowPowerPointModal] = useState(false);
  const [showTop5Modal, setShowTop5Modal] = useState(false);

  const { questionsMap, qualitativeClusters, activeBuilders, total, formAnalytics, keyRankings } = stats;
  const { 
    targetAudience, participationRate,
    overallCompletedRequiredRate,
    part1, part2, swipeMetrics, timeMetrics 
  } = formAnalytics;

  const allTextAnswers: {
    questionId: string;
    questionLabel: string;
    buque: string;
    famss: string;
    text: string;
    activeBuilder: boolean;
  }[] = [];

  const questionLabels: Record<string, string> = {
    pre_representation: "Symbolique",
    pre_representation_promss: "Identité Cl225",
    post_originalite: "Secrets & Originalités",
    post_boite_a_idees: "Boîte à idées",
  };

  ['pre_representation', 'pre_representation_promss', 'post_originalite', 'post_boite_a_idees'].forEach((qid) => {
    const q = questionsMap[qid];
    if (q && q.textAnswers) {
      q.textAnswers.forEach((ans) => {
        allTextAnswers.push({
          questionId: qid,
          questionLabel: questionLabels[qid] || q.title,
          buque: ans.buque,
          famss: ans.famss,
          text: ans.text,
          activeBuilder: ans.activeBuilder
        });
      });
    }
  });

  const filteredAnswers = allTextAnswers.filter((item) => {
    if (selectedQuestion !== 'all' && item.questionId !== selectedQuestion) return false;
    if (onlyMotivss && !item.activeBuilder) return false;

    if (selectedTag) {
      const cluster = qualitativeClusters.find(c => c.tag === selectedTag);
      if (cluster) {
        const matches = cluster.examples.some(ex => ex.buque === item.buque && ex.text === item.text);
        if (!matches) return false;
      }
    }

    if (ideaSearch.trim() !== '') {
      const q = ideaSearch.toLowerCase();
      const inText = item.text.toLowerCase().includes(q);
      const inBuque = item.buque.toLowerCase().includes(q);
      const inFamss = item.famss.toLowerCase().includes(q);
      if (!inText && !inBuque && !inFamss) return false;
    }

    return true;
  });

  const renderStatGroup = (qId: string, title: string) => {
    const qData = questionsMap[qId];
    if (!qData) return null;

    return (
      <div className="p-3.5 sm:p-4 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-stone-100 text-xs sm:text-sm">{title}</h4>
          <span className="text-xs text-stone-400 font-mono-numbers">
            {qData.totalAnswered} réponses
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {qData.optionsStats.map((opt) => (
            <div key={opt.value} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 truncate pr-2 font-sans">{opt.label}</span>
                <span className="font-mono-numbers text-amber-300 font-semibold shrink-0">
                  {opt.percentage}% <span className="text-stone-500 font-normal text-[10px]">({opt.count})</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-stone-950/80 rounded-full overflow-hidden border border-stone-800/40">
                <div
                  className={`h-full rounded-full transition-all ${
                    opt.percentage >= 50
                      ? 'bg-amber-400'
                      : opt.percentage >= 25
                      ? 'bg-amber-500'
                      : 'bg-stone-600'
                  }`}
                  style={{ width: `${Math.min(100, opt.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* TOP HEADER CONTROLS WITH GLASSMORPHIC CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/50 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-stone-800/80 shadow-xl">
        <div className="min-w-0">
          <h2 className="font-serif-cluny text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="truncate">Tableau de Bord Statistique</span>
          </h2>
          <p className="text-xs text-stone-400 font-mono-numbers mt-0.5 truncate">
            {total} réponses sur {targetAudience} ({participationRate}%) · {activeBuilders.length} Motiv'ss
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowTop5Modal(true)}
            className="flex-1 sm:flex-initial justify-center px-3 py-2 rounded-xl bg-stone-950/60 hover:bg-stone-900/80 text-amber-300 border border-amber-600/50 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer backdrop-blur-sm hover:border-amber-500"
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Affiche Top 5</span>
          </button>

          <button
            onClick={() => setShowPowerPointModal(true)}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer"
          >
            <Presentation className="w-4 h-4 shrink-0 text-stone-950" />
            <span>Slide PowerPoint</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PARTICIPATION ET COMPLÉTION DU FORMULAIRE */}
      <div
        id="card-participation-completion"
        className="p-4 sm:p-5 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 gap-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 min-w-0 font-serif-cluny">
            <Users className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="truncate">Participation Promo & Complétion</span>
          </h3>

          <ExportMenu
            targetElementId="card-participation-completion"
            filenamePrefix="stats_participation_completion_cl225"
          />
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 font-mono-numbers">
          {/* Participation sur 163 */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-1 shadow-inner">
            <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block truncate">
              Participation Promo
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-300">
              {participationRate}%
            </div>
            <div className="text-[11px] sm:text-xs text-stone-300 truncate">
              <strong className="text-stone-100">{total}</strong> / {targetAudience} personnes
            </div>
            <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden mt-1.5 border border-stone-800/50">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, participationRate)}%` }} />
            </div>
          </div>

          {/* Complétion globale */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-1 shadow-inner">
            <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block truncate">
              Complétion Globale
            </span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {overallCompletedRequiredRate}%
            </div>
            <div className="text-[11px] sm:text-xs text-stone-300 truncate">
              {formAnalytics.overallCompletedRequired} terminés (P1 + Swipes + P2)
            </div>
            <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden mt-1.5 border border-stone-800/50">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overallCompletedRequiredRate}%` }} />
            </div>
          </div>

          {/* Complétion Partie 1 */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-1 shadow-inner">
            <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block truncate">
              1ère Partie (Préliminaire)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              {part1.answeredRequiredRate}%
            </div>
            <div className="text-[11px] sm:text-xs text-stone-300 truncate">
              Moyenne : {part1.avgQuestionsAnswered} / 4 questions
            </div>
            <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden mt-1.5 border border-stone-800/50">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${part1.answeredRequiredRate}%` }} />
            </div>
          </div>

          {/* Complétion Partie 2 */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-1 shadow-inner">
            <span className="text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-wider block truncate">
              2nde Partie (Post-Swipe)
            </span>
            <div className="text-xl sm:text-2xl font-bold text-stone-100">
              {part2.answeredRequiredRate}%
            </div>
            <div className="text-[11px] sm:text-xs text-stone-300 truncate">
              Moyenne : {part2.avgQuestionsAnswered} / 7 questions
            </div>
            <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden mt-1.5 border border-stone-800/50">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${part2.answeredRequiredRate}%` }} />
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Row with TOTAL DE MINUTES CUMULÉES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 text-xs">
          {/* Total Minutes */}
          <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Temps de participation cumulé</span>
              <Hourglass className="w-4 h-4 text-amber-400 shrink-0" />
            </div>

            <div className="mt-1">
              <strong className="text-amber-300 text-lg font-mono-numbers">
                {timeMetrics.timeFormatted}
              </strong>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-mono-numbers">
                {timeMetrics.totalMinutes} min au total · Médiane : {timeMetrics.medianMinutes} min/pers
              </span>
            </div>
          </div>

          {/* Mobilisation Motiv'ss */}
          <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-stone-400 block">Mobilisation Motiv'ss</span>
              <strong className="text-amber-300 text-sm font-mono-numbers">
                {activeBuilders.length} actifs ({total > 0 ? Math.round((activeBuilders.length / total) * 100) : 0}%)
              </strong>
              <span className="text-[10px] text-stone-500 block mt-0.5">Prêts pour la fabrication</span>
            </div>
            <Hammer className="w-5 h-5 text-amber-500 shrink-0" />
          </div>

          {/* Adhésion & Participation Swipe */}
          <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-stone-400 block">Adhésion Swipe</span>
              <strong className="text-emerald-400 text-sm font-mono-numbers">
                {swipeMetrics.usersWithSwipesRate}% ont voté ({swipeMetrics.usersWithSwipesCount} pers.)
              </strong>
              <span className="text-[10px] text-stone-500 block mt-0.5">{swipeMetrics.totalSwipes} votes au total</span>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* SECTION 2: GRAPHIQUE PAR TRANCHES DE 15 DU NOMBRE DE CLÉS SWIPÉES PAR UTILISATEUR */}
      <div
        id="card-swipe-distribution"
        className="p-4 sm:p-5 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 gap-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 min-w-0 font-serif-cluny">
            <Award className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="truncate">Clés Swipées par Utilisateur (Tranches de 15)</span>
          </h3>

          <ExportMenu
            targetElementId="card-swipe-distribution"
            filenamePrefix="distribution_swipes_par_15_cl225"
          />
        </div>

        {/* Swipe Metrics Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center font-mono-numbers">
          <div className="p-2.5 sm:p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
            <span className="text-[10px] uppercase text-stone-400 block">Moyenne</span>
            <div className="text-lg sm:text-xl font-bold text-amber-300 mt-0.5">{swipeMetrics.avgSwipesPerUser}</div>
            <span className="text-[10px] text-stone-500">clés / pers.</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
            <span className="text-[10px] uppercase text-stone-400 block">Médiane</span>
            <div className="text-lg sm:text-xl font-bold text-stone-100 mt-0.5">{swipeMetrics.medianSwipesPerUser}</div>
            <span className="text-[10px] text-stone-500">clés swipées</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
            <span className="text-[10px] uppercase text-stone-400 block">Total Votes</span>
            <div className="text-lg sm:text-xl font-bold text-stone-100 mt-0.5">{swipeMetrics.totalSwipes}</div>
            <span className="text-[10px] text-stone-500">interactions</span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
            <span className="text-[10px] uppercase text-stone-400 block">Ratio L/D</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">{swipeMetrics.globalRatio ? `${swipeMetrics.globalRatio}x` : '—'}</div>
            <span className="text-[10px] text-stone-500">{swipeMetrics.likeRate}% L / {swipeMetrics.dislikeRate}% D</span>
          </div>
        </div>

        {/* Visual Histogram Chart grouped by 15 */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold text-stone-200">Répartition par tranches de 15 clés</span>
            <span className="font-mono-numbers">{total} répondants</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {swipeMetrics.histogram.map((bin) => {
              const isMax = bin.count === Math.max(...swipeMetrics.histogram.map(b => b.count));
              return (
                <div key={bin.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium w-28 sm:w-40 shrink-0 truncate">{bin.label}</span>
                    <div className="font-mono-numbers text-stone-200 shrink-0">
                      <strong className={isMax ? 'text-amber-400 font-bold' : 'text-stone-200'}>
                        {bin.count}
                      </strong>
                      <span className="text-stone-500 ml-1">({bin.percentage}%)</span>
                    </div>
                  </div>

                  <div className="h-3.5 sm:h-4 w-full bg-stone-950 rounded-full overflow-hidden p-0.5 border border-stone-800/60">
                    <div
                      className={`h-full rounded-full transition-all ${
                        bin.range === '0'
                          ? 'bg-rose-500/70'
                          : isMax
                          ? 'bg-amber-400 shadow-sm shadow-amber-400/30'
                          : 'bg-amber-600/80'
                      }`}
                      style={{ width: `${Math.max(2, bin.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub-breakdown of vote nature */}
          <div className="pt-3 border-t border-stone-800/80 grid grid-cols-3 gap-1.5 sm:gap-2 text-xs font-mono-numbers">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
              <span className="text-emerald-400 flex items-center gap-1 font-medium text-[11px] sm:text-xs">
                <ThumbsUp className="w-3.5 h-3.5 shrink-0" /> Likes
              </span>
              <span className="font-bold text-stone-200 text-[11px] sm:text-xs">
                {swipeMetrics.totalLikes} <span className="text-stone-500 font-normal">({swipeMetrics.likeRate}%)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
              <span className="text-rose-400 flex items-center gap-1 font-medium text-[11px] sm:text-xs">
                <ThumbsDown className="w-3.5 h-3.5 shrink-0" /> Dislikes
              </span>
              <span className="font-bold text-stone-200 text-[11px] sm:text-xs">
                {swipeMetrics.totalDislikes} <span className="text-stone-500 font-normal">({swipeMetrics.dislikeRate}%)</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
              <span className="text-amber-400 flex items-center gap-1 font-medium text-[11px] sm:text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" /> Superlikes
              </span>
              <span className="font-bold text-stone-200 text-[11px] sm:text-xs">
                {swipeMetrics.totalSuperlikes} <span className="text-stone-500 font-normal">({swipeMetrics.superlikeRate}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DIRECTIVES TECHNIQUES ET ESTHÉTIQUES */}
      <div
        id="card-technical-directives"
        className="p-4 sm:p-5 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 gap-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 min-w-0 font-serif-cluny">
            <Layers className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="truncate">Directives Techniques & Spécifications</span>
          </h3>

          <ExportMenu
            targetElementId="card-technical-directives"
            filenamePrefix="directives_techniques_cle_dex_cl225"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {renderStatGroup('post_materiaux', 'Matériaux & Esthétique')}
          {renderStatGroup('post_taille_signification', 'Dimensions & Proportions')}
          {renderStatGroup('post_interet', 'Implication & Motiv\'ss')}
          {renderStatGroup('post_innovation', 'Innovation & Modernité')}
          {renderStatGroup('pre_importance', 'Échéance & Calendrier')}
          {renderStatGroup('post_elements_vus', 'Aspects séduisants des clés')}
        </div>
      </div>

      {/* SECTION 4: LE MUR D'IDÉES */}
      <div
        id="card-mur-idees"
        className="space-y-4 p-4 sm:p-5 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3 gap-2">
          <div className="min-w-0">
            <h2 className="font-serif-cluny text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="truncate">Mur d'Idées & Contributions</span>
            </h2>
            <span className="text-xs text-stone-400 font-mono-numbers block mt-0.5">
              {filteredAnswers.length} contributions
            </span>
          </div>

          <ExportMenu
            targetElementId="card-mur-idees"
            filenamePrefix="mur_idees_cle_dex_cl225"
          />
        </div>

        {/* Theme pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {qualitativeClusters.map((cluster) => {
            const isSelected = selectedTag === cluster.tag;
            return (
              <button
                key={cluster.tag}
                onClick={() => setSelectedTag(isSelected ? null : cluster.tag)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 font-semibold shadow-md shadow-amber-500/10'
                    : 'bg-stone-950/45 border-stone-800/80 text-stone-300 hover:border-amber-700/60'
                }`}
              >
                <span>{cluster.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-numbers ${
                  isSelected ? 'bg-amber-950 text-amber-200' : 'bg-stone-900 text-stone-400'
                }`}>
                  {cluster.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & filters with Glassmorphic styling */}
        <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-inner">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé, buque, fam'ss..."
              value={ideaSearch}
              onChange={(e) => setIdeaSearch(e.target.value)}
              className="w-full bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedQuestion}
              onChange={(e) => setSelectedQuestion(e.target.value)}
              className="bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 flex-1 sm:flex-initial"
            >
              <option value="all">Toutes questions ({allTextAnswers.length})</option>
              <option value="pre_representation">Symbolique</option>
              <option value="pre_representation_promss">Identité Cl225</option>
              <option value="post_originalite">Secrets & Originalités</option>
              <option value="post_boite_a_idees">Boîte à idées</option>
            </select>

            <button
              onClick={() => setOnlyMotivss(!onlyMotivss)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0 backdrop-blur-sm ${
                onlyMotivss
                  ? 'bg-amber-500/20 border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 font-semibold'
                  : 'bg-stone-950/60 text-stone-400 border-stone-800/80 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              <Hammer className="w-3 h-3 text-amber-400" />
              <span>Motiv'ss</span>
            </button>
          </div>
        </div>

        {/* Cards of ideas: Glassmorphic cards with AM amber accent */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAnswers.map((item, idx) => (
            <div
              key={idx}
              id={`idea-card-${idx}`}
              className="p-3.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 hover:border-amber-600/40 transition-all flex flex-col justify-between space-y-2.5 relative group min-w-0 shadow-inner"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-1.5 min-w-0">
                  <span className="font-semibold text-amber-300 truncate min-w-0 flex-1 font-mono-numbers">
                    {item.buque} <span className="text-stone-500 font-normal">({item.famss})</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded border border-stone-800 truncate max-w-[120px]">
                      {item.questionLabel}
                    </span>

                    <ExportMenu
                      targetElementId={`idea-card-${idx}`}
                      filenamePrefix={`idee_${item.buque.replace(/[^a-zA-Z0-9]/g, '_')}_${item.famss}`}
                    />
                  </div>
                </div>

                <p className="text-xs text-stone-200 leading-relaxed italic border-l-2 border-amber-500/60 pl-2.5 whitespace-pre-line font-sans">
                  « {item.text} »
                </p>
              </div>

              {item.activeBuilder && (
                <div className="pt-1.5 border-t border-stone-800/80 flex items-center gap-1 text-[11px] text-amber-400 font-medium font-mono-numbers">
                  <Hammer className="w-3 h-3" />
                  <span>Motiv'ss</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* POWERPOINT EXPORT MODAL */}
      {showPowerPointModal && (
        <PowerPointSlideModal
          stats={stats}
          onClose={() => setShowPowerPointModal(false)}
        />
      )}

      {/* TOP 5 KEYS MODAL */}
      {showTop5Modal && (
        <Top5KeysModal
          topKeys={keyRankings}
          onClose={() => setShowTop5Modal(false)}
        />
      )}
    </div>
  );
};
