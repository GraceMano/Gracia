"use client";

import React, { useState, useEffect } from "react";
import {
  TerritoryStatistics,
  ErosionFeatureProperties,
  LayerFilterState,
  SeverityClass,
} from "@/types/erosion";
import { useLocale } from "@/contexts/LocaleContext";
import { GlobalStats } from "./GlobalStats";
import { ZoneDetail } from "./ZoneDetail";
import { FilterPanel } from "./FilterPanel";
import { BarChart3, Info, SlidersHorizontal, ChevronLeft, ExternalLink } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TerritoryStatistics | null;
  selectedProperties: ErosionFeatureProperties | null;
  onClearSelection: () => void;
  filterState: LayerFilterState;
  onToggleClass: (classId: SeverityClass) => void;
  onSetOpacity: (opacity: number) => void;
  onSearchZone: (id: number) => boolean;
  onShowAll: () => void;
  onHideAll: () => void;
  loading: boolean;
  onObservationAdded?: () => void;
}

type TabType = "stats" | "detail" | "filters";

export function Sidebar({
  isOpen,
  onClose,
  stats,
  selectedProperties,
  onClearSelection,
  filterState,
  onToggleClass,
  onSetOpacity,
  onSearchZone,
  onShowAll,
  onHideAll,
  loading,
  onObservationAdded,
}: SidebarProps) {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>("stats");

  // Automatically switch to details tab when user selects a zone
  useEffect(() => {
    if (selectedProperties) {
      setActiveTab("detail");
    }
  }, [selectedProperties]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-2xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-2xl ${
        isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
      }`}
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 w-full shadow-inner">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "stats"
                ? "bg-emerald-600 text-white shadow-md scale-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="truncate">{t("nav.overview")}</span>
          </button>

          <button
            onClick={() => setActiveTab("detail")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "detail"
                ? "bg-emerald-600 text-white shadow-md scale-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="truncate">{t("nav.zoneAnalysis")}</span>
          </button>

          <button
            onClick={() => setActiveTab("filters")}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "filters"
                ? "bg-emerald-600 text-white shadow-md scale-100"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="truncate">{t("nav.filtersLayers")}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="md:hidden ml-2 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
        {activeTab === "stats" && (
          <GlobalStats
            stats={stats}
            loading={loading}
            onSelectSeverityFilter={(sev) => {
              onToggleClass(sev);
              setActiveTab("filters");
            }}
          />
        )}

        {activeTab === "detail" && (
          <ZoneDetail
            properties={selectedProperties}
            onClearSelection={onClearSelection}
            onObservationAdded={onObservationAdded}
          />
        )}

        {activeTab === "filters" && (
          <FilterPanel
            filterState={filterState}
            onToggleClass={onToggleClass}
            onSetOpacity={onSetOpacity}
            onSearchZone={onSearchZone}
            onShowAll={onShowAll}
            onHideAll={onHideAll}
            stats={stats}
          />
        )}
      </div>

      {/* Sidebar Footer */}
      <footer className="p-3 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-300">
            {t("sidebar.builtBy")}
          </span>
          {/* <a
            href="https://macpierre.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors mt-0.5"
          >
            <span>{t("sidebar.portfolioLink")}</span>
            <ExternalLink className="w-3 h-3" />
          </a> */}
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          v1.0 Bukavu
        </span>
      </footer>
    </aside>
  );
}
