"use client";

import React, { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Key, X, Check, ExternalLink, ShieldCheck, Sparkles, MapPin } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapboxToken: string;
  onSaveMapboxToken: (token: string) => void;
  cartoApiKey: string;
  onSaveCartoKey: (key: string) => void;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  mapboxToken,
  onSaveMapboxToken,
  cartoApiKey,
  onSaveCartoKey,
}: ApiKeyModalProps) {
  const { t } = useLocale();
  const [inputMapbox, setInputMapbox] = useState(mapboxToken);
  const [inputCarto, setInputCarto] = useState(cartoApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMapboxToken(inputMapbox.trim());
    onSaveCartoKey(inputCarto.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClearMapbox = () => {
    setInputMapbox("");
    onSaveMapboxToken("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
              <Key className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {t("mapControls.apiKeyTitle")}
              </h3>
              <p className="text-xs text-slate-400">
                Mapbox, CARTO & Services SIG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Basemaps Callout */}
        <div className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong>Fonds gratuits inclus :</strong> <strong>Esri Topo</strong> (relief montagneux de Kabare) et <strong>OpenStreetMap</strong> sont toujours actifs sans aucune clé ni filigrane.
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Mapbox Token Input (Primary) */}
          <div className="p-4 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900 border border-blue-500/40 rounded-2xl space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{t("mapControls.mapboxTitle")}</span>
              </label>
              {mapboxToken && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                  Actif
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {t("mapControls.mapboxDesc")}
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputMapbox}
                onChange={(e) => setInputMapbox(e.target.value)}
                placeholder={t("mapControls.mapboxPlaceholder")}
                className="flex-1 bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              {inputMapbox && (
                <button
                  type="button"
                  onClick={handleClearMapbox}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  {t("mapControls.clearKey")}
                </button>
              )}
            </div>
          </div>

          {/* Optional CARTO Key Input */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Clé API CARTO (Optionnelle)
              </label>
              {cartoApiKey && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
                  Actif
                </span>
              )}
            </div>
            <input
              type="text"
              value={inputCarto}
              onChange={(e) => setInputCarto(e.target.value)}
              placeholder={t("mapControls.apiKeyPlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {t("mapControls.closeModal")}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t("mapControls.keyActive")}</span>
                </>
              ) : (
                <span>{t("mapControls.saveKey")}</span>
              )}
            </button>
          </div>
        </form>

        {/* Mapbox Token Guide */}
        <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>Où trouver votre token Mapbox ?</span>
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>account.mapbox.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
            Connectez-vous sur Mapbox &rarr; <strong>Tokens</strong> &rarr; Copiez votre <strong>Default public token</strong> (commençant par <code className="text-blue-300">pk.eyJ1...</code>) et collez-le ci-dessus.
          </p>
        </div>
      </div>
    </div>
  );
}
