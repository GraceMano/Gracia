"use client";

import React, { useState, useEffect } from "react";
import { ErosionFeatureProperties, ZoneObservation } from "@/types/erosion";
import { getSeverityRule } from "@/config/erosionRules";
import {
  recommendationEngine,
  AiActionPlanResult,
} from "@/services/recommendationEngine";
import { discussionService } from "@/services/discussionService";
import { useLocale } from "@/contexts/LocaleContext";
import { ZoneDiscussions } from "./ZoneDiscussions";
import {
  MousePointerClick,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  Sprout,
  ArrowRight,
  Shield,
  Copy,
  Check,
  HelpCircle,
  Cpu,
} from "lucide-react";

interface ZoneDetailProps {
  properties: ErosionFeatureProperties | null;
  onClearSelection: () => void;
  onObservationAdded?: () => void;
}

export function ZoneDetail({
  properties,
  onClearSelection,
  onObservationAdded,
}: ZoneDetailProps) {
  const { locale, t } = useLocale();
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiPlan, setAiPlan] = useState<AiActionPlanResult | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showAiInfo, setShowAiInfo] = useState(false);
  const [observations, setObservations] = useState<ZoneObservation[]>([]);

  useEffect(() => {
    if (properties) {
      setObservations(discussionService.getObservationsForZone(properties.id));
      setAiPlan(null);
    }
  }, [properties]);

  if (!properties) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <MousePointerClick className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-bold text-slate-200">
          {t("zoneDetail.noSelectionTitle")}
        </h4>
        <p className="text-[13px] text-slate-400 leading-relaxed max-w-xs mx-auto">
          {t("zoneDetail.noSelectionPrompt")}
        </p>
      </div>
    );
  }

  const { id, gridcode, area_ha } = properties;
  const rule = getSeverityRule(gridcode);
  const recommendations = recommendationEngine.getRecommendationsForZone(
    properties,
    locale
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleGenerateAiPlan = async () => {
    setGeneratingAi(true);
    try {
      const plan = await recommendationEngine.generateCustomPlan(
        properties,
        locale,
        observations
      );
      setAiPlan(plan);
    } finally {
      setGeneratingAi(false);
    }
  };

  const refreshObservations = () => {
    setObservations(discussionService.getObservationsForZone(id));
  };

  return (
    <div className="space-y-4">
      {/* Zone Header Card */}
      <div className="p-3.5 bg-slate-850/90 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[14px] font-mono font-bold text-slate-300">
              {t("zoneDetail.zoneId")}: #{id}
            </span>
            <button
              onClick={handleCopyId}
              title="Copier ID"
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            onClick={onClearSelection}
            className="text-[13px] font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            {t("zoneDetail.deselect")}
          </button>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: rule.color }}
            />
            <h3 className="text-[17px] font-bold text-white tracking-tight">
              {t(rule.nameKey)}
            </h3>
          </div>

          <span
            className="px-2.5 py-1 text-[13px] font-semibold font-mono rounded-md"
            style={{
              backgroundColor: `${rule.color}15`,
              color: rule.color,
              border: `1px solid ${rule.color}40`,
            }}
          >
            Classe {gridcode}
          </span>
        </div>
      </div>

      {/* Surface & Loss Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl">
          <div className="text-[13px] text-slate-400 font-semibold mb-1">
            {t("zoneDetail.surfaceHa")}
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono">
            {area_ha.toLocaleString()} ha
          </div>
        </div>

        <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl">
          <div className="text-[13px] text-slate-400 font-semibold mb-1">
            {t("zoneDetail.estimatedLoss")}
          </div>
          <div className="text-[16px] font-bold text-slate-200 font-mono">
            {rule.lossRangeTonsPerHaYear}
          </div>
        </div>
      </div>

      {/* Urgency Badge */}
      <div className="p-3 bg-slate-850/60 border border-slate-800 rounded-lg flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{t("zoneDetail.urgency")} :</span>
        </div>
        <span className="font-semibold text-slate-200">
          {t(`zoneDetail.urgencyLevels.${rule.urgencyLevel}`)}
        </span>
      </div>

      {/* Public Field Observations & Discussions Component */}
      <ZoneDiscussions
        zoneId={id}
        observations={observations}
        onObservationAdded={onObservationAdded}
        onRefreshObservations={refreshObservations}
      />

      {/* Deterministic Agronomic Recommendations List */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2 text-[13px] font-bold uppercase tracking-wider text-slate-200">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <h4>{t("recommendations.sectionTitle")}</h4>
        </div>

        <div className="space-y-2.5">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-[14px] font-bold text-slate-100">
                  {rec.title}
                </h5>
                <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 font-medium shrink-0 border border-slate-700">
                  {t(`recommendations.types.${rec.practiceType}`)}
                </span>
              </div>

              <p className="text-[13px] text-slate-300 leading-relaxed">
                {rec.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                  {t("recommendations.slopeLabel")}: {rec.suitabilitySlope}
                </span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-medium">
                  {t("recommendations.costLabel")}: {t(`recommendations.costs.${rec.implementationCost}`)}
                </span>
              </div>

              {rec.recommendedSpecies && (
                <div className="pt-1.5 border-t border-slate-800 text-[13px] text-emerald-400 italic">
                  {t("recommendations.speciesLabel")}: {rec.recommendedSpecies}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Action Plan Section & AI Engine Explainer */}
      <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-200">
              {t("recommendations.aiSectionTitle")}
            </h4>
          </div>

          <button
            onClick={() => setShowAiInfo(!showAiInfo)}
            title="Détails du modèle"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>À propos</span>
          </button>
        </div>

        {/* AI Explainer Accordion */}
        {showAiInfo && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/80 text-[13px] space-y-2 animate-in fade-in">
            <div>
              <div className="font-semibold text-emerald-400">
                {t("aiPlan.whatIsIt")}
              </div>
              <p className="text-slate-300 leading-relaxed mt-0.5">
                {t("aiPlan.whatIsItDesc")}
              </p>
            </div>
            <div className="pt-1.5 border-t border-slate-800">
              <div className="font-semibold text-emerald-400">
                {t("aiPlan.whichAi")}
              </div>
              <p className="text-slate-300 leading-relaxed mt-0.5">
                {t("aiPlan.whichAiDesc")}
              </p>
            </div>
          </div>
        )}

        <p className="text-[13px] text-slate-300 leading-relaxed">
          {t("recommendations.aiPromptDesc")}
        </p>

        <button
          onClick={handleGenerateAiPlan}
          disabled={generatingAi}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
        >
          {generatingAi ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t("recommendations.generatingAiPlan")}</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>{t("recommendations.generateAiPlan")}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {aiPlan && (
          <div className="p-3.5 bg-slate-900/95 border border-slate-800 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-[14px]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("recommendations.aiPlanResultTitle")}</span>
              </div>
              {aiPlan.modelUsed && (
                <div className="flex items-center gap-1 text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                  <Cpu className="w-3 h-3 text-emerald-400" />
                  <span>{aiPlan.modelUsed}</span>
                </div>
              )}
            </div>

            <p className="text-slate-200 leading-relaxed text-[13px] italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              {aiPlan.executiveSummary}
            </p>

            {/* Field Discussions Analysis */}
            {aiPlan.discussionAnalysis && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-1 text-[13px]">
                <div className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                  Analyse des observations de terrain
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {aiPlan.discussionAnalysis}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-1">
              {aiPlan.phases.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="text-[13px]">{phase.title}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {phase.duration}
                    </span>
                  </div>
                  <ul className="space-y-1 pl-3 text-slate-300 list-disc text-[13px]">
                    {phase.actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-slate-800 text-[13px] text-slate-300">
              <span className="text-emerald-400 font-semibold">
                {t("recommendations.speciesLabel")}:
              </span>{" "}
              {aiPlan.recommendedSpecies.join(", ")}
            </div>

            <p className="text-[13px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
              {aiPlan.maintenanceGuidelines}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
