import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Download, Check, FileImage } from 'lucide-react';
import { downloadElementAsPng, downloadElementAsSvg, copyElementToClipboard } from '../utils/exportUtils';

interface ExportMenuProps {
  targetElementId: string;
  filenamePrefix: string;
  buttonLabel?: string;
  className?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  targetElementId,
  filenamePrefix,
  buttonLabel,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    const el = document.getElementById(targetElementId);
    if (!el) return;
    setCopied(true);
    await copyElementToClipboard(el);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleDownloadPng = async () => {
    const el = document.getElementById(targetElementId);
    if (!el) return;
    setDownloading(true);
    await downloadElementAsPng(el, `${filenamePrefix}.png`);
    setDownloading(false);
    setIsOpen(false);
  };

  const handleDownloadSvg = async () => {
    const el = document.getElementById(targetElementId);
    if (!el) return;
    setDownloading(true);
    await downloadElementAsSvg(el, `${filenamePrefix}.svg`);
    setDownloading(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 rounded-lg bg-stone-950/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors flex items-center gap-1 cursor-pointer touch-manipulation"
        title="Exporter (PNG, SVG, Presse-papier)"
        aria-label="Options d'export"
      >
        <MoreVertical className="w-4 h-4 shrink-0" />
        {buttonLabel && <span className="text-xs font-medium pr-1">{buttonLabel}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 max-w-[calc(100vw-2rem)] rounded-xl bg-stone-900 border border-stone-700/90 shadow-2xl py-1.5 z-50 text-xs font-sans">
          <button
            onClick={handleCopy}
            className="w-full px-3 py-2 text-left text-stone-200 hover:bg-stone-800 flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className={copied ? 'text-emerald-300 font-semibold' : ''}>
              {copied ? 'Copié !' : 'Copier l\'image (Ctrl+V)'}
            </span>
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="w-full px-3 py-2 text-left text-stone-200 hover:bg-stone-800 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileImage className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Télécharger PNG HD</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            disabled={downloading}
            className="w-full px-3 py-2 text-left text-stone-300 hover:bg-stone-800 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Télécharger SVG</span>
          </button>
        </div>
      )}
    </div>
  );
};
