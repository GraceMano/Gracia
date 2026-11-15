"use client";

import React, { useState } from "react";
import { ZoneObservation } from "@/types/erosion";
import { discussionService } from "@/services/discussionService";
import { useLocale } from "@/contexts/LocaleContext";
import { MessageSquare, Send, Check, User, Tag } from "lucide-react";

interface ZoneDiscussionsProps {
  zoneId: number;
  observations: ZoneObservation[];
  onObservationAdded?: () => void;
  onRefreshObservations: () => void;
}

export function ZoneDiscussions({
  zoneId,
  observations,
  onObservationAdded,
  onRefreshObservations,
}: ZoneDiscussionsProps) {
  const { locale, t } = useLocale();
  const [showAddForm, setShowAddForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState<ZoneObservation["authorRole"]>("agronomist");
  const [findingType, setFindingType] = useState<ZoneObservation["findingType"]>("conservation_success");
  const [comment, setComment] = useState("");
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    discussionService.addObservation(
      zoneId,
      authorName,
      authorRole,
      findingType,
      comment
    );

    setComment("");
    setShowAddForm(false);
    setPublishSuccess(true);
    onRefreshObservations();
    if (onObservationAdded) {
      onObservationAdded();
    }
    setTimeout(() => setPublishSuccess(false), 4000);
  };

  return (
    <div className="p-3.5 bg-slate-850/80 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h4 className="text-[14px] font-bold text-slate-200">
            {t("discussions.sectionTitle")}
          </h4>
        </div>
        <span className="text-xs font-mono text-emerald-400">
          {observations.length} {t("discussions.observationsCount")}
        </span>
      </div>

      <p className="text-[13px] text-slate-400 leading-relaxed">
        {t("discussions.subtitle")}
      </p>

      {publishSuccess && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[13px] text-emerald-300 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t("discussions.publishedSuccess")}</span>
        </div>
      )}

      {/* Observations List */}
      <div className="space-y-2">
        {observations.length === 0 ? (
          <p className="text-[13px] text-slate-500 italic p-2.5 bg-slate-900/40 rounded-lg">
            {t("discussions.noObservations")}
          </p>
        ) : (
          observations.map((obs) => (
            <div
              key={obs.id}
              className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{obs.authorName}</span>
                  <span className="text-xs text-slate-400 font-normal">
                    &bull; {t(`discussions.roles.${obs.authorRole}`)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(obs.timestamp).toLocaleDateString(locale)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">
                  {t(`discussions.types.${obs.findingType}`)}
                </span>
              </div>

              <p className="text-[13px] text-slate-300 leading-relaxed pt-0.5">
                {obs.comment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Form Toggle or Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[13px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t("discussions.shareFinding")}</span>
        </button>
      ) : (
        <form
          onSubmit={handlePublish}
          className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl space-y-2.5 animate-in fade-in"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {t("discussions.nameLabel")}
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("discussions.namePlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t("discussions.roleLabel")}
              </label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[13px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="agronomist">{t("discussions.roles.agronomist")}</option>
                <option value="farmer">{t("discussions.roles.farmer")}</option>
                <option value="researcher">{t("discussions.roles.researcher")}</option>
                <option value="local_officer">{t("discussions.roles.local_officer")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                {t("discussions.findingTypeLabel")}
              </label>
              <select
                value={findingType}
                onChange={(e) => setFindingType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[13px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="conservation_success">{t("discussions.types.conservation_success")}</option>
                <option value="gully_erosion">{t("discussions.types.gully_erosion")}</option>
                <option value="rill_erosion">{t("discussions.types.rill_erosion")}</option>
                <option value="landslide">{t("discussions.types.landslide")}</option>
                <option value="general_note">{t("discussions.types.general_note")}</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              {t("discussions.commentLabel")}
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("discussions.commentPlaceholder")}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-[13px] text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t("discussions.publishButton")}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
