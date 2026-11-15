"use client";

import React from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { SupportedLocale } from "@/lib/locales";
import {
  Compass,
  Globe,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  KeyRound,
  Layers,
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onResetView: () => void;
  onOpenApiKeyModal: () => void;
  totalPolygons?: number;
  totalAreaHa?: number;
}

export function Header({
  sidebarOpen,
  onToggleSidebar,
  onResetView,
  onOpenApiKeyModal,
  totalPolygons,
  totalAreaHa,
}: HeaderProps) {
  const { locale, setLocale, t } = useLocale();

  const languages: { code: SupportedLocale; label: string }[] = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
  ];

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 text-white flex items-center justify-between px-3.5 sm:px-6 z-20 shrink-0">
      <div className="flex items-center space-x-3.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? t("nav.collapseSidebar") : t("nav.expandSidebar")}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-100 truncate">
                {t("app.title")}
              </h1>
              
            </div>
            
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {totalPolygons && totalAreaHa ? (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-slate-300">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">
              {totalPolygons.toLocaleString()}
            </span>
            <span className="text-slate-400">{t("app.kpiPolygons")}</span>
            <span className="text-slate-600">|</span>
            <span className="font-semibold text-white">
              {Math.round(totalAreaHa).toLocaleString()} ha
            </span>
          </div>
        ) : null}

        {/* <button
          onClick={onOpenApiKeyModal}
          title={t("nav.basemapSettings")}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">{t("nav.basemapSettings")}</span>
        </button> */}

        <button
          onClick={onResetView}
          title={t("nav.resetView")}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{t("nav.resetView")}</span>
        </button>

        <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-xl p-0.5 shadow-inner">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 hidden sm:inline" />
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                locale === lang.code
                  ? "bg-emerald-600 text-white shadow-sm scale-100"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
