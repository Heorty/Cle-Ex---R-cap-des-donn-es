import React, { useState } from 'react';
import { BarChart3, Award, Users, UploadCloud } from 'lucide-react';
import { UploadView } from './components/UploadView';
import { StatsAndIdeationView } from './components/StatsAndIdeationView';
import { KeysRankingView } from './components/KeysRankingView';
import { UserExplorerView } from './components/UserExplorerView';
import { WatermarkBackground } from './components/WatermarkBackground';
import { Respondent } from './data/surveyData';
import { computeStats } from './data/analytics';

export default function App() {
  const [respondents, setRespondents] = useState<Respondent[] | null>(null);
  const [sourceFilename, setSourceFilename] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stats' | 'ranking' | 'users'>('stats');

  const handleCustomUpload = (data: Respondent[], filename: string) => {
    setRespondents(data);
    setSourceFilename(filename);
    setActiveTab('stats');
  };

  // If no data loaded, show simple upload page with watermark background
  if (!respondents) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
        <WatermarkBackground />
        <UploadView onLoadData={handleCustomUpload} />
      </div>
    );
  }

  const stats = computeStats(respondents);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 relative">
      {/* GLOBAL WATERMARK AM TRAD'S EMBLEM IN BACKGROUND */}
      <WatermarkBackground />

      {/* Top Header - Glassmorphic fixed atop */}
      <header className="border-b border-stone-800/80 bg-stone-950/75 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Brand with AM Trad's Icon */}
            <div className="flex items-center gap-2.5 shrink-0">
              <img
                src="/AM_TRADS_Arrondi.svg"
                alt="AM Trad's"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              />
              <span className="font-serif-cluny font-bold text-xs sm:text-sm tracking-wider text-amber-200 whitespace-nowrap">
                CLÉ D'EX CL225
              </span>
            </div>

            {/* The 3 Tabs - Glassmorphic design system */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
                  activeTab === 'stats'
                    ? 'bg-amber-500/20 border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 font-semibold shadow-md shadow-amber-500/5'
                    : 'bg-stone-950/45 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
                title="Statistiques & Idées"
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Statistiques & Idées</span>
                <span className="sm:hidden">Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('ranking')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
                  activeTab === 'ranking'
                    ? 'bg-amber-500/20 border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 font-semibold shadow-md shadow-amber-500/5'
                    : 'bg-stone-950/45 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
                title="Classement Clés & Photos"
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Classement Clés & Photos</span>
                <span className="sm:hidden">Clés</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
                  activeTab === 'users'
                    ? 'bg-amber-500/20 border-amber-500/80 ring-1 ring-amber-500/50 text-amber-300 font-semibold shadow-md shadow-amber-500/5'
                    : 'bg-stone-950/45 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
                title="Explorateur des Répondants"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Profils</span>
              </button>
            </nav>

            {/* Change File button */}
            <button
              onClick={() => setRespondents(null)}
              className="px-2 sm:px-2.5 py-1.5 text-xs font-medium text-stone-300 bg-stone-950/45 hover:bg-stone-900/70 border border-stone-800/80 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer backdrop-blur-sm shadow-sm"
              title="Changer de fichier"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline">Changer de fichier</span>
            </button>
          </div>

          {/* Subheader status bar */}
          <div className="py-1.5 border-t border-stone-800/60 flex flex-wrap items-center justify-between text-[11px] text-stone-400 font-mono-numbers gap-1 bg-stone-950/30">
            <span className="truncate max-w-[200px] sm:max-w-xs text-stone-300">
              {sourceFilename}
            </span>
            <div className="shrink-0">
              <strong className="text-amber-300">{respondents.length} réponses</strong> · {stats.activeBuilders.length} Motiv'ss
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Content above watermark */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'stats' && (
          <StatsAndIdeationView stats={stats} />
        )}

        {activeTab === 'ranking' && (
          <KeysRankingView keyRankings={stats.keyRankings} />
        )}

        {activeTab === 'users' && (
          <UserExplorerView respondents={respondents} />
        )}
      </main>
    </div>
  );
}
