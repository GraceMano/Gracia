"use client";

import React from "react";
import { TerritoryStatistics, SeverityClass } from "@/types/erosion";
import { EROSION_SEVERITY_CONFIG } from "@/config/erosionRules";
import { useLocale } from "@/contexts/LocaleContext";
import { Layers, MapPin, ShieldAlert, BarChart2 } from "lucide-react";

interface GlobalStatsProps {
  stats: TerritoryStatistics | null;
  loading: boolean;
  onSelectSeverityFilter?: (severity: SeverityClass) => void;
}

export function GlobalStats({ stats, loading, onSelectSeverityFilter }: GlobalStatsProps) {
  const { t } = useLocale();

  if (loading || !stats) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-20 bg-slate-800/50 rounded-xl" />
        <div className="h-56 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  const severityOrder: SeverityClass[] = [1, 2, 3, 4];

  return (
    <div className="space-y-4">
      {/* Territory Header Info */}
      <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kabare &bull; Sud-Kivu</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            EPSG:4326 (WGS84)
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t("app.subtitle")}
        </p>
      </div>

      {/* Surface and Zones Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t("stats.totalArea")}</span>
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono tracking-tight">
            {Math.round(stats.totalAreaHa).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {t("stats.hectares")} &bull; {(stats.totalAreaHa / 100).toFixed(1)} km²
          </div>
        </div>

        <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl">
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-medium mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>{t("stats.totalPolygons")}</span>
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono tracking-tight">
            {stats.totalPolygons.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {t("stats.zoneCount")} cartographiées
          </div>
        </div>
      </div>

      {/* Severity Breakdown Card */}
      <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("stats.distributionTitle")}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {t("stats.clickToFilter")}
          </span>
        </div>

        <div className="space-y-2.5">
          {severityOrder.map((classId) => {
            const rule = EROSION_SEVERITY_CONFIG[classId];
            const classData = stats.classBreakdown[classId];
            const title = t(rule.nameKey);

            return (
              <div
                key={classId}
                onClick={() => onSelectSeverityFilter && onSelectSeverityFilter(classId)}
                className="cursor-pointer p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: rule.color }}
                    />
                    <span className="font-medium text-slate-200">
                      Classe {classId} &bull; {title}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-100">
                    {classData.percentageArea}%
                  </span>
                </div>

                {/* Clean, unadorned progress track */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(classData.percentageArea, 2)}%`,
                      backgroundColor: rule.color,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 font-mono">
                  <span>
                    {classData.polygonCount.toLocaleString()} {t("stats.zoneCount")}
                  </span>
                  <span>
                    {rule.lossRangeTonsPerHaYear}
                  </span>
                  <span className="text-slate-300 font-medium">
                    {Math.round(classData.totalAreaHa).toLocaleString()} ha
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
