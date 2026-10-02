import React, { useState } from 'react';
import { Users, Hammer, Star, ThumbsUp, ThumbsDown, ZoomIn, X, ArrowDownUp } from 'lucide-react';
import { Respondent, knownHistoricalKeys } from '../data/surveyData';
import imageMap from '../data/imageMap.json';

interface UserExplorerViewProps {
  respondents: Respondent[];
}

export const UserExplorerView: React.FC<UserExplorerViewProps> = ({ respondents }) => {
  const [search, setSearch] = useState('');
  const [filterMotivss, setFilterMotivss] = useState<'all' | 'motivss' | 'curious'>('all');
  const [selectedUser, setSelectedUser] = useState<Respondent | null>(respondents[0] || null);
  const [keyVoteFilter, setKeyVoteFilter] = useState<'all' | 'likes' | 'dislikes' | 'superlikes'>('all');
  const [keyVoteSort, setKeyVoteSort] = useState<'likes_first' | 'dislikes_first' | 'superlikes_first' | 'name'>('likes_first');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const imgMapTyped = imageMap as Record<string, string>;

  const filteredList = respondents.filter((r) => {
    if (filterMotivss === 'motivss' && r.answers?.post_interet !== 'envie_investir_activement') return false;
    if (filterMotivss === 'curious' && r.answers?.post_interet !== 'curieux_voir_propositions') return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.buque.toLowerCase().includes(q) ||
      r.famss.toLowerCase().includes(q) ||
      (r.answers?.pre_representation && r.answers.pre_representation.toLowerCase().includes(q)) ||
      (r.answers?.post_originalite && r.answers.post_originalite.toLowerCase().includes(q))
    );
  });

  // Filter and sort keys voted by selected user
  const userSwipesEntries = Object.entries(selectedUser?.swipes || {});
  const filteredAndSortedSwipes = userSwipesEntries
    .filter(([, reaction]) => {
      if (keyVoteFilter === 'likes') return reaction === 'like';
      if (keyVoteFilter === 'dislikes') return reaction === 'dislike';
      if (keyVoteFilter === 'superlikes') return reaction === 'superlike';
      return true;
    })
    .sort((a, b) => {
      const reactionA = a[1];
      const reactionB = b[1];

      if (keyVoteSort === 'likes_first') {
        const score = (r: string) => (r === 'superlike' ? 3 : r === 'like' ? 2 : 1);
        return score(reactionB) - score(reactionA);
      }

      if (keyVoteSort === 'dislikes_first') {
        const score = (r: string) => (r === 'dislike' ? 3 : r === 'like' ? 2 : 1);
        return score(reactionB) - score(reactionA);
      }

      if (keyVoteSort === 'superlikes_first') {
        const score = (r: string) => (r === 'superlike' ? 3 : 0);
        return score(reactionB) - score(reactionA);
      }

      return a[0].localeCompare(b[0]);
    });

  return (
    <div className="space-y-6">
      {/* Header with glassmorphism */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-stone-800/80 shadow-xl">
        <div>
          <h2 className="font-serif-cluny text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Explorateur des Répondants</span>
          </h2>
          <span className="text-xs text-stone-400 font-mono-numbers block mt-0.5">
            {filteredList.length} personnes trouvées
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Rechercher par Buque ou Fam'ss..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 w-48"
          />

          <div className="inline-flex p-0.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-xs">
            <button
              onClick={() => setFilterMotivss('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterMotivss === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tous ({respondents.length})
            </button>
            <button
              onClick={() => setFilterMotivss('motivss')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${
                filterMotivss === 'motivss'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Hammer className="w-3 h-3 text-amber-400" />
              Motiv'ss
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User List */}
        <div className="lg:col-span-4 rounded-2xl border border-stone-800/80 bg-stone-900/50 backdrop-blur-md overflow-hidden max-h-[75vh] flex flex-col shadow-xl">
          <div className="p-3 border-b border-stone-800/80 text-xs font-semibold text-stone-400 flex justify-between bg-stone-950/50">
            <span>Liste ({filteredList.length})</span>
            <span className="font-mono-numbers">Sélectionner</span>
          </div>

          <div className="overflow-y-auto divide-y divide-stone-800/60">
            {filteredList.map((r, idx) => {
              const isSelected = selectedUser?.buque === r.buque && selectedUser?.famss === r.famss;
              const isMotivss = r.answers?.post_interet === 'envie_investir_activement';

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedUser(r);
                    setKeyVoteFilter('all');
                  }}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-l-4 border-amber-500 pl-2.5 text-amber-100 shadow-inner'
                      : 'hover:bg-stone-900/40 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-sm truncate font-mono-numbers">{r.buque}</span>
                    <span className="font-mono-numbers text-stone-400 text-xs">Fam'ss {r.famss}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="truncate max-w-[180px] font-sans">
                      {r.answers?.pre_representation || r.answers?.pre_representation_promss || "Réponses complétées"}
                    </span>
                    {isMotivss && (
                      <span className="text-amber-400 shrink-0 flex items-center gap-0.5 font-medium font-mono-numbers">
                        <Hammer className="w-2.5 h-2.5" /> Motiv'ss
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: User Details Sheet with Glassmorphism */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-800/80 bg-stone-900/50 backdrop-blur-md p-5 space-y-5 shadow-xl">
          {selectedUser ? (
            <>
              {/* Profile banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
                <div>
                  <h3 className="font-serif-cluny text-2xl font-bold text-stone-100">
                    {selectedUser.buque}
                  </h3>
                  <span className="text-xs font-mono-numbers text-stone-400">
                    Fam'ss {selectedUser.famss}
                  </span>
                </div>

                {selectedUser.answers?.post_interet === 'envie_investir_activement' ? (
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 text-xs font-semibold flex items-center gap-1.5 self-start shadow-md shadow-amber-500/10">
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Motiv'ss</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-stone-950/60 border border-stone-800 text-stone-400 text-xs self-start">
                    Curieux des projets
                  </span>
                )}
              </div>

              {/* Free text responses */}
              <div className="space-y-2.5 text-xs">
                {selectedUser.answers?.pre_representation && (
                  <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-0.5 shadow-inner">
                    <span className="text-stone-500 font-semibold uppercase text-[10px] block font-mono-numbers">
                      Symbolique de la clé :
                    </span>
                    <p className="text-stone-200 italic leading-relaxed whitespace-pre-line font-sans">
                      « {selectedUser.answers.pre_representation} »
                    </p>
                  </div>
                )}

                {selectedUser.answers?.pre_representation_promss && (
                  <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-0.5 shadow-inner">
                    <span className="text-stone-500 font-semibold uppercase text-[10px] block font-mono-numbers">
                      Éléments & anecdotes Cl225 :
                    </span>
                    <p className="text-stone-200 italic leading-relaxed whitespace-pre-line font-sans">
                      « {selectedUser.answers.pre_representation_promss} »
                    </p>
                  </div>
                )}

                {selectedUser.answers?.post_originalite && (
                  <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-0.5 shadow-inner">
                    <span className="text-stone-500 font-semibold uppercase text-[10px] block font-mono-numbers">
                      Touche d'originalité / Secret proposé :
                    </span>
                    <p className="text-stone-200 italic leading-relaxed whitespace-pre-line font-sans">
                      « {selectedUser.answers.post_originalite} »
                    </p>
                  </div>
                )}

                {selectedUser.answers?.post_boite_a_idees && (
                  <div className="p-3 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 space-y-0.5 shadow-inner">
                    <span className="text-stone-500 font-semibold uppercase text-[10px] block font-mono-numbers">
                      Boîte à idées générale :
                    </span>
                    <p className="text-stone-200 italic leading-relaxed whitespace-pre-line font-sans">
                      « {selectedUser.answers.post_boite_a_idees} »
                    </p>
                  </div>
                )}
              </div>

              {/* Technical consensus choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono-numbers">
                <div className="p-2.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] uppercase">Matériaux :</span>
                  <div className="text-stone-200 font-medium mt-0.5">
                    {selectedUser.answers?.post_materiaux?.join(', ') || '—'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] uppercase">Dimensions :</span>
                  <div className="text-stone-200 font-medium mt-0.5">
                    {selectedUser.answers?.post_taille_signification?.join(', ') || '—'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-950/45 backdrop-blur-sm border border-stone-800/80 shadow-inner">
                  <span className="text-stone-500 block text-[10px] uppercase">Échéance :</span>
                  <div className="text-stone-200 font-medium mt-0.5">
                    {selectedUser.answers?.pre_importance || '—'}
                  </div>
                </div>
              </div>

              {/* Keys voted by this user: WITH SORT BY LIKE / DISLIKE */}
              <div className="space-y-3 pt-3 border-t border-stone-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-serif-cluny">
                      Clés votées ({userSwipesEntries.length})
                    </h4>
                  </div>

                  {/* Controls: Trier par Like / Dislike + Filtrer */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Explicit Sort Control */}
                    <div className="flex items-center gap-1 bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 rounded-xl px-2 py-1 text-xs">
                      <ArrowDownUp className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="text-[11px] text-stone-500">Trier :</span>
                      <select
                        value={keyVoteSort}
                        onChange={(e) => setKeyVoteSort(e.target.value as any)}
                        className="bg-transparent text-stone-200 text-xs font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="likes_first" className="bg-stone-900">Likes d'abord (Superlike &gt; Like &gt; Dislike)</option>
                        <option value="dislikes_first" className="bg-stone-900">Dislikes d'abord</option>
                        <option value="superlikes_first" className="bg-stone-900">Superlikes d'abord</option>
                        <option value="name" className="bg-stone-900">Nom de clé</option>
                      </select>
                    </div>

                    {/* Filter buttons */}
                    <div className="inline-flex p-0.5 rounded-xl bg-stone-950/60 backdrop-blur-sm border border-stone-800/80 text-[11px] overflow-x-auto max-w-full">
                      <button
                        onClick={() => setKeyVoteFilter('all')}
                        className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                          keyVoteFilter === 'all'
                            ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/50'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        Tous
                      </button>
                      <button
                        onClick={() => setKeyVoteFilter('likes')}
                        className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          keyVoteFilter === 'likes'
                            ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800'
                            : 'text-emerald-500 hover:text-emerald-400'
                        }`}
                      >
                        <ThumbsUp className="w-2.5 h-2.5" />
                        Likes ({userSwipesEntries.filter(([, r]) => r === 'like').length})
                      </button>
                      <button
                        onClick={() => setKeyVoteFilter('dislikes')}
                        className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          keyVoteFilter === 'dislikes'
                            ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800'
                            : 'text-rose-500 hover:text-rose-400'
                        }`}
                      >
                        <ThumbsDown className="w-2.5 h-2.5" />
                        Dislikes ({userSwipesEntries.filter(([, r]) => r === 'dislike').length})
                      </button>
                      <button
                        onClick={() => setKeyVoteFilter('superlikes')}
                        className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          keyVoteFilter === 'superlikes'
                            ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/50'
                            : 'text-amber-500 hover:text-amber-400'
                        }`}
                      >
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                        Superlikes ({userSwipesEntries.filter(([, r]) => r === 'superlike').length})
                      </button>
                    </div>
                  </div>
                </div>

                {filteredAndSortedSwipes.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-3 text-center">
                    Aucune clé dans cette sélection.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {filteredAndSortedSwipes.map(([keyId, reaction], idx) => {
                      const meta = knownHistoricalKeys[keyId];
                      const imgUrl = imgMapTyped[keyId] || imgMapTyped[keyId.replace('photo_120_im_cl___cl', '').replace('_jpg', '')];
                      const note = selectedUser.superlikeNotes?.[keyId];

                      return (
                        <div
                          key={idx}
                          className={`p-2 rounded-xl border flex flex-col justify-between overflow-hidden text-xs relative group backdrop-blur-sm transition-all shadow-inner ${
                            reaction === 'superlike'
                              ? 'bg-amber-950/25 border-amber-600/60'
                              : reaction === 'like'
                              ? 'bg-stone-950/45 border-stone-800/80 hover:border-emerald-700/60'
                              : 'bg-stone-950/30 border-stone-800/50 opacity-75 hover:opacity-100 hover:border-rose-800/60'
                          }`}
                        >
                          {/* Image preview */}
                          <div className="relative h-24 w-full bg-stone-950/80 rounded-lg overflow-hidden flex items-center justify-center mb-1.5 border border-stone-800/60">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={meta?.label || keyId}
                                className="max-h-full max-w-full object-contain cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => setPreviewImage({ url: imgUrl, title: meta?.label || keyId })}
                              />
                            ) : (
                              <span className="text-[10px] text-stone-500 font-mono-numbers">
                                {meta?.label || keyId}
                              </span>
                            )}

                            {imgUrl && (
                              <button
                                onClick={() => setPreviewImage({ url: imgUrl, title: meta?.label || keyId })}
                                className="absolute bottom-1 right-1 p-1 rounded bg-black/70 text-stone-300 hover:text-white"
                                title="Agrandir"
                              >
                                <ZoomIn className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <span className="font-semibold text-stone-200 block truncate font-serif-cluny">
                              {meta?.label || keyId}
                            </span>

                            {/* Badge */}
                            <div className="flex items-center justify-between">
                              {reaction === 'superlike' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 text-[10px] font-bold flex items-center gap-0.5 border border-amber-600/50">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> Superlike
                                </span>
                              )}
                              {reaction === 'like' && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-medium flex items-center gap-0.5 border border-emerald-800">
                                  <ThumbsUp className="w-2.5 h-2.5" /> Like
                                </span>
                              )}
                              {reaction === 'dislike' && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-medium flex items-center gap-0.5 border border-rose-800">
                                  <ThumbsDown className="w-2.5 h-2.5" /> Dislike
                                </span>
                              )}
                            </div>

                            {/* Superlike comment */}
                            {note?.reason && (
                              <div className="mt-1 pt-1 border-t border-stone-800 text-[10px] text-stone-300 italic line-clamp-2">
                                « {note.reason} »
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-500 text-xs">
              Sélectionnez un répondant dans la liste de gauche.
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <div className="w-full flex justify-between items-center text-stone-200 mb-2 px-1">
              <span className="font-serif-cluny text-base font-bold text-amber-300 truncate">
                {previewImage.title}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl border border-stone-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
