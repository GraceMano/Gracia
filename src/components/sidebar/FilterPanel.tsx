"use client";

import React, { useState } from "react";
import { SeverityClass, LayerFilterState, TerritoryStatistics } from "@/types/erosion";
import { EROSION_SEVERITY_CONFIG } from "@/config/erosionRules";
import { useLocale } from "@/contexts/LocaleContext";
import { Sliders, Search, Check, Eye, X } from "lucide-react";

interface FilterPanelProps {
  filterState: LayerFilterState;
  onToggleClass: (classId: SeverityClass) => void;
  onSetOpacity: (opacity: number) => void;
  onSearchZone: (id: number) => boolean;
  onShowAll: () => void;
  onHideAll: () => void;
  stats?: TerritoryStatistics | null;
}

export function FilterPanel({
  filterState,
  onToggleClass,
  onSetOpacity,
  onSearchZone,
  onShowAll,
  onHideAll,
  stats,
}: FilterPanelProps) {
  const { t } = useLocale();
  const [searchIdInput, setSearchIdInput] = useState("");
  const [searchError, setSearchError] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchIdInput.trim(), 10);
    if (isNaN(id)) return;

    const found = onSearchZone(id);
    if (!found) {
      setSearchError(true);
      setTimeout(() => setSearchError(false), 3500);
    } else {
      setSearchError(false);
    }
  };

  const severityOrder: SeverityClass[] = [1, 2, 3, 4];

  return (
    <div className="space-y-5">
      {/* Search by zone ID */}
      <form onSubmit={handleSearch} className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t("nav.searchZonePlaceholder")}</span>
        </label>
        <div className="flex gap-2 relative">
          <input
            type="number"
            min="1"
            value={searchIdInput}
            onChange={(e) => setSearchIdInput(e.target.value)}
            placeholder="Ex: 1042"
            className="flex-1 bg-slate-800/80 border border-slate-700 text-slate-100 text-xs rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-inner"
          />
          {searchIdInput && (
            <button
              type="button"
              onClick={() => setSearchIdInput("")}
              className="absolute right-24 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 hover:scale-105 active:scale-95"
          >
            {t("nav.searchButton")}
          </button>
        </div>
        {searchError && (
          <p className="text-[11px] text-rose-400 mt-1 font-medium bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
            {t("nav.zoneNotFound")}
          </p>
        )}
      </form>

      {/* Opacity slider */}
      <div className="p-4 bg-slate-800/50 backdrop-blur-md border border-slate-700/60 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            {t("nav.layerOpacity")}
          </span>
          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {Math.round(filterState.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={Math.round(filterState.opacity * 100)}
          onChange={(e) => onSetOpacity(parseInt(e.target.value, 10) / 100)}
          className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>10% (Transparent)</span>
          <span>100% (Opaque)</span>
        </div>
      </div>

      {/* Severity filter toggles */}
      <div className="p-4 bg-slate-800/50 backdrop-blur-md border border-slate-700/60 rounded-2xl space-y-3.5 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            {t("nav.severityFilter")}
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={onShowAll}
              className="text-slate-400 hover:text-emerald-400 transition-colors font-medium"
            >
              {t("mapControls.showAll")}
            </button>
            <span className="text-slate-600">&bull;</span>
            <button
              onClick={onHideAll}
              className="text-slate-400 hover:text-rose-400 transition-colors font-medium"
            >
              {t("mapControls.hideAll")}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {severityOrder.map((classId) => {
            const rule = EROSION_SEVERITY_CONFIG[classId];
            const isVisible = filterState.visibleClasses[classId];
            const count = stats?.classBreakdown?.[classId]?.polygonCount;

            return (
              <label
                key={classId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      isVisible
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  >
                    {isVisible && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-sm"
                    style={{ backgroundColor: rule.color }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">
                      Classe {classId} &bull; {t(rule.nameKey)}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {rule.lossRangeTonsPerHaYear}
                    </div>
                  </div>
                </div>

                {count !== undefined && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">
                    {count.toLocaleString()}
                  </span>
                )}

                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleClass(classId)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
