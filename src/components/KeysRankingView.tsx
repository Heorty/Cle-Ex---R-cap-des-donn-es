import React, { useState } from 'react';
import { Award, ThumbsUp, ThumbsDown, Star, ZoomIn, X, LayoutGrid, Grid2X2, Users, Search, Hammer, Trophy } from 'lucide-react';
import { KeyRanking } from '../data/analytics';
import { Top5KeysModal } from './Top5KeysModal';

interface KeysRankingViewProps {
  keyRankings: KeyRanking[];
}

export const KeysRankingView: React.FC<KeysRankingViewProps> = ({ keyRankings }) => {
  const [selectedKeyForVotes, setSelectedKeyForVotes] = useState<{
    keyItem: KeyRanking;
    initialTab: 'all' | 'likes' | 'dislikes' | 'superlikes';
  } | null>(null);

  const [voteFilterTab, setVoteFilterTab] = useState<'all' | 'likes' | 'dislikes' | 'superlikes'>('all');
  const [voteSearch, setVoteSearch] = useState('');
  const [voteMotivssOnly, setVoteMotivssOnly] = useState(false);

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'likes' | 'dislikes' | 'superlikes' | 'ratio' | 'total'>('score');
  const [columns, setColumns] = useState<2 | 3>(3);
  const [showTop5Modal, setShowTop5Modal] = useState(false);

  const openVotesModal = (keyItem: KeyRanking, tab: 'all' | 'likes' | 'dislikes' | 'superlikes') => {
    setSelectedKeyForVotes({ keyItem, initialTab: tab });
    setVoteFilterTab(tab);
    setVoteSearch('');
    setVoteMotivssOnly(false);
  };

  const filteredRankings = [...keyRankings].filter((k) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      k.label.toLowerCase().includes(q) ||
      k.center.toLowerCase().includes(q) ||
      k.description.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'dislikes') return b.dislikes - a.dislikes;
    if (sortBy === 'superlikes') return b.superlikes - a.superlikes;
    if (sortBy === 'total') return b.totalInteractions - a.totalInteractions;
    if (sortBy === 'ratio') {
      const rA = a.likeDislikeRatio ?? (a.likes > 0 ? 999 : -1);
      const rB = b.likeDislikeRatio ?? (b.likes > 0 ? 999 : -1);
      return rB - rA;
    }
    return b.score - a.score;
  });

  // Prepare list of voters for modal
  const currentKey = selectedKeyForVotes?.keyItem;
  let allVotersList: {
    buque: string;
    famss: string;
    isMotivss: boolean;
    reaction: 'like' | 'dislike' | 'superlike';
    element?: string;
    reason?: string;
  }[] = [];

  if (currentKey) {
    currentKey.superlikedBy.forEach((s) => {
      allVotersList.push({
        buque: s.buque,
        famss: s.famss,
        isMotivss: s.isMotivss,
        reaction: 'superlike',
        element: s.element,
        reason: s.reason
      });
    });

    currentKey.likedBy.forEach((l) => {
      allVotersList.push({
        buque: l.buque,
        famss: l.famss,
        isMotivss: l.isMotivss,
        reaction: 'like'
      });
    });

    currentKey.dislikedBy.forEach((d) => {
      allVotersList.push({
        buque: d.buque,
        famss: d.famss,
        isMotivss: d.isMotivss,
        reaction: 'dislike'
      });
    });
  }

  const filteredVoters = allVotersList.filter((v) => {
    if (voteFilterTab === 'likes' && v.reaction !== 'like') return false;
    if (voteFilterTab === 'dislikes' && v.reaction !== 'dislike') return false;
    if (voteFilterTab === 'superlikes' && v.reaction !== 'superlike') return false;
    if (voteMotivssOnly && !v.isMotivss) return false;

    if (voteSearch.trim()) {
      const q = voteSearch.toLowerCase();
      return v.buque.toLowerCase().includes(q) || v.famss.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header controls - glassmorphic styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl">
        <div>
          <h2 className="font-serif-cluny text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Classement des Clés & Galerie</span>
          </h2>
          <span className="text-xs text-stone-400 font-mono-numbers block mt-0.5">
            {filteredRankings.length} clés évaluées
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search with glassmorphic style */}
          <input
            type="text"
            placeholder="Rechercher une clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 flex-1 sm:w-40 sm:flex-initial"
          />

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-xs text-stone-300 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 font-mono-numbers flex-1 sm:flex-initial"
          >
            <option value="score" className="bg-stone-900">Score Net (Superlike ×3 + Like - Dislike)</option>
            <option value="likes" className="bg-stone-900">Nb de Likes</option>
            <option value="dislikes" className="bg-stone-900">Nb de Dislikes</option>
            <option value="ratio" className="bg-stone-900">Ratio Like / Dislike</option>
            <option value="superlikes" className="bg-stone-900">Nb de Superlikes</option>
            <option value="total" className="bg-stone-900">Total Votes</option>
          </select>

          {/* Affiche Top 5 Button */}
          <button
            onClick={() => setShowTop5Modal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20 cursor-pointer w-full sm:w-auto"
            title="Exporter l'affiche du Top 5 des clés"
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Affiche Top 5</span>
          </button>

          {/* Layout Column Toggle (desktop / tablet) */}
          <div className="hidden sm:inline-flex p-0.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 shrink-0">
            <button
              onClick={() => setColumns(3)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                columns === 3 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Vue grille (3 colonnes)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setColumns(2)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                columns === 2 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Grande vue (2 colonnes)"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Cards with Glassmorphism */}
      <div className={`grid grid-cols-1 ${columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4 sm:gap-6`}>
        {filteredRankings.map((keyItem) => {
          return (
            <div
              key={keyItem.keyId}
              className="rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 hover:border-amber-500/60 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex flex-col justify-between overflow-hidden shadow-lg group"
            >
              {/* Full Image Container: Ample vertical room, object-contain */}
              <div className="relative min-h-[280px] sm:min-h-[340px] h-[300px] sm:h-[380px] w-full bg-stone-950/80 p-3 flex items-center justify-center border-b border-stone-800/80">
                {keyItem.imageUrl ? (
                  <img
                    src={keyItem.imageUrl}
                    alt={keyItem.label}
                    className="max-h-full max-w-full object-contain drop-shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => setPreviewImage({ url: keyItem.imageUrl!, title: keyItem.label })}
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center p-6">
                    <span className="font-serif-cluny font-bold text-amber-500/80 text-lg">
                      {keyItem.label}
                    </span>
                  </div>
                )}

                {/* Fullscreen Zoom Trigger */}
                {keyItem.imageUrl && (
                  <button
                    onClick={() => setPreviewImage({ url: keyItem.imageUrl!, title: keyItem.label })}
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-stone-950/80 text-stone-300 hover:text-white backdrop-blur-md border border-stone-800 transition-colors cursor-pointer"
                    title="Agrandir en plein écran"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                )}

                {/* Net Score Badge (Top Right) */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg text-[11px] font-mono-numbers font-bold bg-stone-950/85 backdrop-blur-md text-amber-300 border border-stone-800/80 shadow-md">
                  {keyItem.score > 0 ? `+${keyItem.score}` : keyItem.score} pts
                </div>
              </div>

              {/* Card Meta & Detailed Statistics */}
              <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-cluny font-bold text-base text-stone-100 group-hover:text-amber-200 transition-colors">
                    {keyItem.label}
                  </h3>
                  {keyItem.description && (
                    <p className="text-xs text-stone-400 line-clamp-2 mt-0.5 font-sans">
                      {keyItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-800/80 space-y-2">
                  {/* Detailed Clickable Counters */}
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono-numbers text-xs">
                    <button
                      onClick={() => openVotesModal(keyItem, 'likes')}
                      className="p-1.5 rounded-xl bg-stone-950/45 backdrop-blur-sm hover:bg-stone-900/70 border border-stone-800/80 hover:border-emerald-600/70 transition-all group/btn cursor-pointer shadow-inner"
                      title="Voir les likes"
                    >
                      <span className="text-[10px] text-stone-500 group-hover/btn:text-emerald-400 block">Likes</span>
                      <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {keyItem.likes}
                      </span>
                    </button>

                    <button
                      onClick={() => openVotesModal(keyItem, 'dislikes')}
                      className="p-1.5 rounded-xl bg-stone-950/45 backdrop-blur-sm hover:bg-stone-900/70 border border-stone-800/80 hover:border-rose-600/70 transition-all group/btn cursor-pointer shadow-inner"
                      title="Voir les dislikes"
                    >
                      <span className="text-[10px] text-stone-500 group-hover/btn:text-rose-400 block">Dislikes</span>
                      <span className="font-bold text-rose-400 flex items-center justify-center gap-1">
                        <ThumbsDown className="w-3 h-3" /> {keyItem.dislikes}
                      </span>
                    </button>

                    <button
                      onClick={() => openVotesModal(keyItem, 'superlikes')}
                      className="p-1.5 rounded-xl bg-stone-950/45 backdrop-blur-sm hover:bg-stone-900/70 border border-stone-800/80 hover:border-amber-500/70 transition-all group/btn cursor-pointer shadow-inner"
                      title="Voir les superlikes"
                    >
                      <span className="text-[10px] text-stone-500 group-hover/btn:text-amber-400 block">Superlikes</span>
                      <span className="font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {keyItem.superlikes}
                      </span>
                    </button>
                  </div>

                  {/* Ratios & Totals */}
                  <div className="flex items-center justify-between text-xs text-stone-400 font-mono-numbers px-0.5">
                    <span>
                      Total : <strong className="text-stone-200">{keyItem.totalInteractions}</strong>
                    </span>
                    <span>
                      Ratio L/D :{' '}
                      <strong className="text-amber-300">
                        {keyItem.likeDislikeRatio !== null ? `${keyItem.likeDislikeRatio}x` : '∞'}
                      </strong>
                    </span>
                  </div>

                  {/* Bouton détail complet des votants */}
                  <button
                    onClick={() => openVotesModal(keyItem, 'all')}
                    className="w-full mt-1 py-1.5 rounded-xl bg-stone-950/50 hover:bg-stone-900/80 text-stone-300 border border-stone-800/80 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-sm hover:border-amber-600/50"
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Détail des votes ({keyItem.totalInteractions})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Photo Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-zoom-out"
        >
          <div className="relative max-w-6xl max-h-[92vh] flex flex-col items-center">
            <div className="w-full flex justify-between items-center text-stone-200 mb-2 px-1">
              <span className="font-serif-cluny text-base sm:text-lg font-bold text-amber-300 truncate">
                {previewImage.title}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl border border-stone-800/80 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Voters List Modal with Glassmorphism */}
      {selectedKeyForVotes && currentKey && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-stone-900/70 backdrop-blur-xl border border-stone-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-stone-950/80 border-b border-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentKey.imageUrl ? (
                  <img
                    src={currentKey.imageUrl}
                    alt={currentKey.label}
                    className="w-10 h-10 object-contain bg-stone-900/90 rounded-lg border border-stone-800 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-stone-900/90 rounded-lg border border-stone-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 font-serif-cluny">
                    Clé
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif-cluny font-bold text-sm sm:text-base text-stone-100 truncate">
                    {currentKey.label}
                  </h3>
                  <span className="text-[11px] text-stone-400 font-mono-numbers block">
                    Score : <strong className="text-amber-300">{currentKey.score > 0 ? `+${currentKey.score}` : currentKey.score} pts</strong> · {currentKey.totalInteractions} votes
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedKeyForVotes(null)}
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="p-3 bg-stone-900/50 backdrop-blur-md border-b border-stone-800/80 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex p-0.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-xs font-mono-numbers overflow-x-auto max-w-full">
                  <button
                    onClick={() => setVoteFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      voteFilterTab === 'all'
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Tous ({allVotersList.length})
                  </button>

                  <button
                    onClick={() => setVoteFilterTab('likes')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      voteFilterTab === 'likes'
                        ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                        : 'text-emerald-500 hover:text-emerald-400'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Likes ({currentKey.likes})
                  </button>

                  <button
                    onClick={() => setVoteFilterTab('dislikes')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      voteFilterTab === 'dislikes'
                        ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800'
                        : 'text-rose-500 hover:text-rose-400'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                    Dislikes ({currentKey.dislikes})
                  </button>

                  <button
                    onClick={() => setVoteFilterTab('superlikes')}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                      voteFilterTab === 'superlikes'
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                        : 'text-amber-500 hover:text-amber-400'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-amber-500" />
                    Superlikes ({currentKey.superlikes})
                  </button>
                </div>

                <button
                  onClick={() => setVoteMotivssOnly(!voteMotivssOnly)}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0 backdrop-blur-sm ${
                    voteMotivssOnly
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/80 font-bold'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800/80 hover:text-stone-200'
                  }`}
                >
                  <Hammer className="w-3 h-3" />
                  <span>Motiv'ss</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrer par Buque ou Fam'ss..."
                  value={voteSearch}
                  onChange={(e) => setVoteSearch(e.target.value)}
                  className="w-full bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Voters List */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1 max-h-[55vh]">
              {filteredVoters.length === 0 ? (
                <div className="p-6 text-center text-stone-500 text-xs">
                  Aucun votant dans cette sélection.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredVoters.map((voter, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between gap-1 backdrop-blur-sm transition-all shadow-inner ${
                        voter.reaction === 'superlike'
                          ? 'bg-amber-950/30 border-amber-600/60'
                          : voter.reaction === 'like'
                          ? 'bg-stone-950/45 border-stone-800/80'
                          : 'bg-stone-950/30 border-stone-800/50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-stone-100 truncate font-mono-numbers">
                            {voter.buque}
                          </span>
                          <span className="font-mono-numbers text-stone-400 text-[11px]">
                            ({voter.famss})
                          </span>
                        </div>

                        {/* Reaction Badge */}
                        {voter.reaction === 'superlike' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-900/50 text-amber-300 text-[10px] font-bold flex items-center gap-0.5 shrink-0 border border-amber-600/50">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> Superlike
                          </span>
                        )}
                        {voter.reaction === 'like' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 text-[10px] font-medium flex items-center gap-0.5 shrink-0 border border-emerald-800">
                            <ThumbsUp className="w-2.5 h-2.5" /> Like
                          </span>
                        )}
                        {voter.reaction === 'dislike' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-950/80 text-rose-300 text-[10px] font-medium flex items-center gap-0.5 shrink-0 border border-rose-800">
                            <ThumbsDown className="w-2.5 h-2.5" /> Dislike
                          </span>
                        )}
                      </div>

                      {/* Motiv'ss badge */}
                      {voter.isMotivss && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium font-mono-numbers">
                          <Hammer className="w-2.5 h-2.5" /> Motiv'ss
                        </div>
                      )}

                      {/* Superlike Note */}
                      {voter.reason && (
                        <div className="mt-1 pt-1 border-t border-stone-800/80 text-[11px] text-stone-300 italic font-sans">
                          {voter.element && (
                            <span className="text-[10px] text-amber-400 not-italic font-semibold block mb-0.5">
                              {voter.element}
                            </span>
                          )}
                          « {voter.reason} »
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-950/80 border-t border-stone-800/80 flex justify-between items-center text-xs text-stone-400 font-mono-numbers">
              <span>{filteredVoters.length} personne{filteredVoters.length > 1 ? 's' : ''}</span>
              <button
                onClick={() => setSelectedKeyForVotes(null)}
                className="px-4 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP 5 MODAL */}
      {showTop5Modal && (
        <Top5KeysModal
          topKeys={keyRankings}
          onClose={() => setShowTop5Modal(false)}
        />
      )}
    </div>
  );
};
