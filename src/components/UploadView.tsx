import React, { useState } from 'react';
import { UploadCloud, AlertCircle, Sparkles } from 'lucide-react';
import { Respondent } from '../data/surveyData';

interface UploadViewProps {
  onLoadData: (data: Respondent[], filename: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onLoadData }) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    if (!file.name.endsWith('.json')) {
      setErrorMessage("Veuillez sélectionner un fichier .json.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        
        let responsesArray: Respondent[] = [];
        if (Array.isArray(parsed)) {
          responsesArray = parsed;
        } else if (parsed.responses && Array.isArray(parsed.responses)) {
          responsesArray = parsed.responses;
        } else {
          throw new Error("Format invalide : attendu un tableau JSON de réponses.");
        }

        if (responsesArray.length === 0) {
          throw new Error("Le fichier est vide.");
        }

        onLoadData(responsesArray, file.name);
      } catch (err: any) {
        setErrorMessage(err.message || "Erreur de lecture du fichier.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto py-12 px-4 space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-stone-900/60 border border-stone-800/80 shadow-inner mb-1">
          <img
            src="/AM_TRADS_Arrondi.svg"
            alt="AM Trad's"
            className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]"
          />
        </div>
        <span className="text-[11px] font-mono-numbers uppercase tracking-[0.25em] text-amber-500 font-bold block">
          Promotion Cl225 · Arts & Métiers
        </span>
        <h1 className="font-serif-cluny text-2xl sm:text-3xl font-bold text-stone-100 tracking-wide">
          Projet Clé d'Ex
        </h1>
        <p className="text-xs text-stone-400 font-sans max-w-xs mx-auto">
          Plateforme de restitution et d'analyse de la consultation de promotion.
        </p>
      </div>

      <div
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3.5 backdrop-blur-md shadow-xl ${
          dragActive
            ? 'border-amber-500/90 bg-amber-500/15 ring-2 ring-amber-500/30'
            : 'border-stone-800/80 bg-stone-900/50 hover:border-amber-700/60 hover:bg-stone-900/65'
        }`}
      >
        <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-amber-400 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone-200">
            Glissez-déposez le fichier de réponses (.json)
          </p>
          <p className="text-[11px] text-stone-400 font-mono-numbers">
            ou parcourez vos documents
          </p>
        </div>

        <label className="cursor-pointer mt-1">
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            className="sr-only"
          />
          <span className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs transition-all shadow-md hover:shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>Charger la consultation</span>
          </span>
        </label>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-1.5 mt-2 text-left shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] font-mono-numbers text-stone-500">
        École Nationale Supérieure d'Arts et Métiers · Campus de Cluny
      </div>
    </div>
  );
};
