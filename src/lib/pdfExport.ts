import { AiActionPlanResult } from "@/services/recommendationEngine";
import { ErosionFeatureProperties } from "@/types/erosion";
import { getSeverityRule } from "@/config/erosionRules";

export function exportFicheTechniquePdf(
  plan: AiActionPlanResult,
  properties: ErosionFeatureProperties,
  locale: "fr" | "en" | "es" = "fr"
) {
  if (typeof window === "undefined") return;

  const rule = getSeverityRule(properties.gridcode);
  const dateStr = new Date(plan.generatedAt || Date.now()).toLocaleDateString(
    locale,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const severityName =
    rule.classId === 1
      ? "Faible (< 10 t/ha/an)"
      : rule.classId === 2
      ? "Modérée (10 - 25 t/ha/an)"
      : rule.classId === 3
      ? "Élevée (25 - 50 t/ha/an)"
      : "Très Élevée / Critique (> 50 t/ha/an)";

  const phasesHtml = plan.phases
    .map(
      (phase, idx) => `
      <div class="phase-card">
        <div class="phase-header">
          <span class="phase-title">${phase.title}</span>
          <span class="phase-duration">${phase.duration}</span>
        </div>
        <ul class="phase-actions">
          ${phase.actions.map((act) => `<li>${act}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");

  const discussionHtml = plan.discussionAnalysis
    ? `
      <div class="section-box green-box">
        <div class="section-title text-emerald">Analyse des observations de terrain</div>
        <p>${plan.discussionAnalysis}</p>
      </div>
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="utf-8" />
      <title>Fiche Technique #${properties.id} - Agrsmart</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 16mm 18mm 16mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.5;
          font-size: 11pt;
          position: relative;
        }

        /* Diagonal Repeating Watermark */
        .watermark-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .watermark-text {
          font-size: 52pt;
          font-weight: 800;
          color: rgba(16, 185, 129, 0.06);
          transform: rotate(-35deg);
          white-space: nowrap;
          user-select: none;
          letter-spacing: 2px;
          text-align: center;
          line-height: 1.4;
        }

        /* Header */
        .doc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #10b981;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .brand-title {
          font-size: 20pt;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .brand-accent {
          color: #059669;
        }
        .brand-subtitle {
          font-size: 9.5pt;
          color: #64748b;
          font-weight: 600;
          margin-top: 2px;
        }
        .doc-badge {
          text-align: right;
          font-size: 9pt;
          color: #64748b;
        }
        .doc-id-pill {
          display: inline-block;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 3px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 3px;
        }

        /* Official Disclaimer Banner */
        .disclaimer-banner {
          background: #f8fafc;
          border-left: 3px solid #10b981;
          padding: 8px 12px;
          font-size: 8.5pt;
          color: #475569;
          margin-bottom: 16px;
          border-radius: 0 6px 6px 0;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
        }
        .metric-label {
          font-size: 8pt;
          text-transform: uppercase;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .metric-val {
          font-size: 13pt;
          font-weight: 800;
          color: #0f172a;
          font-family: monospace;
        }

        /* Sections */
        .section-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 14px;
        }
        .green-box {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .section-title {
          font-size: 9pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          color: #334155;
        }
        .text-emerald {
          color: #047857;
        }

        /* Phases */
        .phase-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 10px;
          background: #ffffff;
        }
        .phase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }
        .phase-title {
          font-weight: 700;
          font-size: 10.5pt;
          color: #0f172a;
        }
        .phase-duration {
          font-size: 8.5pt;
          font-family: monospace;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          color: #475569;
        }
        .phase-actions {
          padding-left: 18px;
          font-size: 9.5pt;
          color: #334155;
        }
        .phase-actions li {
          margin-bottom: 3px;
        }

        /* Footer */
        .doc-footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 8pt;
          color: #64748b;
        }
        .doc-footer a {
          color: #059669;
          text-decoration: none;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <!-- Background Repeating Watermark -->
      <div class="watermark-container">
        <div class="watermark-text">
          Agrsmart &bull; Grace Mano<br/>
          Propriété Intellectuelle Agrsmart<br/>
          Agrsmart &bull; Grace Mano
        </div>
      </div>

      <!-- Header -->
      <div class="doc-header">
        <div>
          <div class="brand-title"><span class="brand-accent">Agr</span>smart</div>
          <div class="brand-subtitle">Observatoire de l'Érosion des Sols &bull; Territoire de Kabare (Sud-Kivu, RDC)</div>
        </div>
        <div class="doc-badge">
          <div class="doc-id-pill">PARCELLE #${properties.id}</div>
          <div>Édité le ${dateStr}</div>
        </div>
      </div>

      <!-- Official Watermark & Initiative Notice -->
      <div class="disclaimer-banner">
        <strong>Agrsmart &bull; Grace Mano</strong> : Ce rapport d'aménagement antiérosif a été généré automatiquement par la plateforme Agrsmart — Une initiative portée par l'équipe Agrsmart (Grace Mano). Document protégé au titre de la propriété intellectuelle.
      </div>

      <!-- Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Superficie de la Parcelle</div>
          <div class="metric-val">${properties.area_ha} ha</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Classe de Sévérité</div>
          <div class="metric-val">Classe ${properties.gridcode}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pertes Estimées</div>
          <div class="metric-val">${rule.lossRangeTonsPerHaYear}</div>
        </div>
      </div>

      <!-- Summary -->
      <div class="section-box">
        <div class="section-title">Synthèse Opérationnelle</div>
        <p style="font-size: 10pt; color: #1e293b; font-style: italic;">
          ${plan.executiveSummary}
        </p>
      </div>

      <!-- Discussion Analysis if any -->
      ${discussionHtml}

      <!-- Phases Breakdown -->
      <div style="margin-bottom: 14px;">
        <div class="section-title">Calendrier d'Intervention Phasé</div>
        ${phasesHtml}
      </div>

      <!-- Recommended Species -->
      <div class="section-box" style="margin-bottom: 12px;">
        <div class="section-title text-emerald">Essences Végétales & Végétation Antiérosive</div>
        <p style="font-size: 9.5pt; color: #047857; font-weight: 600;">
          ${plan.recommendedSpecies.join(", ")}
        </p>
      </div>

      <!-- Maintenance Guidelines -->
      <div class="section-box">
        <div class="section-title">Directives de Maintenance & Consolidation</div>
        <p style="font-size: 9pt; color: #475569;">
          ${plan.maintenanceGuidelines}
        </p>
      </div>

      <!-- Footer with Portfolio Link -->
      <div class="doc-footer">
        <div>Moteur : ${plan.modelUsed || "Agrsmart Decision Engine"}</div>
        <div>
          Conçu par <strong>Agrsmart (Grace Mano)</strong> &bull; 
          <a href="https://macpierre.web.app/" target="_blank">Portfolio : https://macpierre.web.app/</a>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=850,height=1100");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
