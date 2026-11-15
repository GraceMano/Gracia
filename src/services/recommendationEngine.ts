import {
  ErosionFeatureProperties,
  GeneratedRecommendation,
  SeverityClass,
} from "@/types/erosion";
import { getSeverityRule } from "@/config/erosionRules";
import { SupportedLocale, getTranslation } from "@/lib/locales";

export interface AiActionPlanResult {
  zoneId: number;
  severityClass: SeverityClass;
  areaHa: number;
  executiveSummary: string;
  discussionAnalysis?: string;
  modelUsed?: string;
  phases: Array<{
    title: string;
    duration: string;
    actions: string[];
  }>;
  recommendedSpecies: string[];
  maintenanceGuidelines: string;
  generatedAt: string;
}

export class RecommendationEngine {
  getRecommendationsForZone(
    properties: ErosionFeatureProperties,
    locale: SupportedLocale
  ): GeneratedRecommendation[] {
    const rule = getSeverityRule(properties.gridcode);

    if (!rule) {
      return [];
    }

    return rule.recommendations.map((rec) => {
      return {
        id: rec.id,
        title: getTranslation(locale, rec.titleKey),
        practiceType: rec.practiceType,
        suitabilitySlope: rec.suitabilitySlope,
        description: getTranslation(locale, rec.descriptionKey),
        recommendedSpecies: rec.speciesKey
          ? getTranslation(locale, rec.speciesKey)
          : undefined,
        implementationCost: rec.implementationCost,
      };
    });
  }

  async generateCustomPlan(
    properties: ErosionFeatureProperties,
    locale: SupportedLocale,
    discussions: unknown[] = []
  ): Promise<AiActionPlanResult> {
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties, locale, discussions }),
      });
      if (res.ok) {
        return (await res.json()) as AiActionPlanResult;
      }
    } catch (e) {
      console.warn("Falling back to local action plan engine:", e);
    }
    return this.generateAiActionPlan(properties, locale);
  }

  async generateAiActionPlan(
    properties: ErosionFeatureProperties,
    locale: SupportedLocale
  ): Promise<AiActionPlanResult> {
    // Deterministic simulation of AI engine or external LLM API
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { id, gridcode, area_ha } = properties;
    const rule = getSeverityRule(gridcode);
    const severityName = getTranslation(locale, rule.nameKey);

    const isHighOrCritical = gridcode >= 3;

    const summaryFr = `Plan d'urgence antiérosif conçu pour la zone #${id} (${area_ha} ha) classée en sévérité ${severityName}. Le territoire de Kabare présente une topographie montagneuse vulnérable aux fortes précipitations équatoriales. L'objectif immédiat est de freiner le ruissellement superficiel et de stabiliser le complexe argilo-humique.`;
    const summaryEn = `Soil conservation action plan for zone #${id} (${area_ha} ha) categorized under ${severityName} erosion severity. The mountainous highland topography of Kabare necessitates immediate runoff mitigation to protect vulnerable ferrallitic topsoils.`;
    const summaryEs = `Plan de acción antierosivo para la zona #${id} (${area_ha} ha) clasificada con severidad ${severityName}. La topografía montañosa de Kabare requiere la mitigación inmediata de la escorrentía para estabilizar el suelo.`;

    const summary =
      locale === "fr" ? summaryFr : locale === "es" ? summaryEs : summaryEn;

    const phases =
      locale === "fr"
        ? [
            {
              title: "Phase 1: Préparation & Piquetage",
              duration: "Mois 1 - 2",
              actions: [
                "Délimitation des courbes de niveau avec le niveau en A",
                "Sensibilisation des exploitants agricoles riverains",
                "Mise en place de pépinières communautaires de vétiver et calliandra",
              ],
            },
            {
              title: "Phase 2: Travaux Antiérosifs Prioritaires",
              duration: "Mois 2 - 4",
              actions: isHighOrCritical
                ? [
                    "Terrassement de fossés d'infiltration avec talus consolidé",
                    "Plantation serrée de haies vives antiérosives (Calliandra / Vétiver)",
                    "Mise en défens des zones à pente supérieure à 35%",
                  ]
                : [
                    "Semis intercalaire de légumineuses étouffantes (Mucuna/Desmodium)",
                    "Application systématique du paillage sur les planches de culture",
                    "Installation de bandes enherbées de Pennisetum purpureum",
                  ],
            },
            {
              title: "Phase 3: Pérennisation & Intégration Agroforestière",
              duration: "Mois 5 - 12",
              actions: [
                "Plantation d'arbres agroforestiers (Grevillea robusta, Alnus acuminata)",
                "Élagage périodique pour paillage et fourrage",
                "Curage des fossés avant la grande saison des pluies",
              ],
            },
          ]
        : locale === "es"
        ? [
            {
              title: "Fase 1: Preparación y Topografía",
              duration: "Mes 1 - 2",
              actions: [
                "Trazado de curvas de nivel mediante nivel en A",
                "Sensibilización comunitaria de los agricultores locales",
                "Establecimiento de viveros comunitarios de vetiver y calliandra",
              ],
            },
            {
              title: "Fase 2: Obras Antierosivas Físicas",
              duration: "Mes 2 - 4",
              actions: isHighOrCritical
                ? [
                    "Excavación de zanjas de infiltración con taludes estabilizados",
                    "Plantación densa de setos vivos protectores (Calliandra / Vetiver)",
                    "Exclusión de pastoreo en laderas con pendiente superior al 35%",
                  ]
                : [
                    "Siembra intercalada de leguminosas de cobertura (Mucuna)",
                    "Acolchado orgánico continuo en parcelas cultivadas",
                    "Establecimiento de franjas filtrantes de Pennisetum",
                  ],
            },
            {
              title: "Fase 3: Mantenimiento y Agroforestería",
              duration: "Mes 5 - 12",
              actions: [
                "Plantación de árboles agroforestales (Grevillea, Alnus)",
                "Podas periódicas para abono verde y forraje",
                "Limpieza de zanjas antes de la temporada de lluvias",
              ],
            },
          ]
        : [
            {
              title: "Phase 1: Site Survey & Community Mobilization",
              duration: "Month 1 - 2",
              actions: [
                "Contour line pegging using A-frame levels",
                "Local smallholder farmer sensitization and training",
                "Establishment of decentralized nurseries for vetiver and calliandra",
              ],
            },
            {
              title: "Phase 2: Structural & Vegetative Interventions",
              duration: "Month 2 - 4",
              actions: isHighOrCritical
                ? [
                    "Excavation of contour infiltration trenches and silt traps",
                    "Dense hedgerow planting (Calliandra calothyrsus & Vetiver grass)",
                    "Livestock grazing exclosure on critical slopes exceeding 35%",
                  ]
                : [
                    "Intercropping with nitrogen-fixing cover crops (Mucuna pruriens)",
                    "Systematic crop residue mulching on cultivated beds",
                    "Living grass buffer filter strips installation",
                  ],
            },
            {
              title: "Phase 3: Agroforestry Consolidation",
              duration: "Month 5 - 12",
              actions: [
                "Multi-purpose agroforestry tree planting (Grevillea, Alnus)",
                "Periodic hedgerow pruning for green mulch and fodder",
                "Trench sediment dredging prior to the primary rainy season",
              ],
            },
          ];

    const recommendedSpecies = isHighOrCritical
      ? [
          "Calliandra calothyrsus",
          "Vetiver zizanioides",
          "Grevillea robusta",
          "Alnus acuminata",
          "Tripsacum laxum",
        ]
      : [
          "Pennisetum purpureum",
          "Desmodium intortum",
          "Mucuna pruriens",
          "Leucaena diversifolia",
          "Sesbania sesban",
        ];

    const maintenanceGuidelines =
      locale === "fr"
        ? "Contrôle visuel hebdomadaire des risbermes après chaque averse majeure. Renouvellement des plants non repris après 30 jours."
        : locale === "es"
        ? "Monitoreo semanal de zanjas después de lluvias intensas. Reemplazo de plántulas secas tras 30 días de la siembra."
        : "Weekly inspection of contour risers after high-intensity storm events. Replacement of non-viable seedlings within 30 days.";

    return {
      zoneId: id,
      severityClass: gridcode,
      areaHa: area_ha,
      executiveSummary: summary,
      phases,
      recommendedSpecies,
      maintenanceGuidelines,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const recommendationEngine = new RecommendationEngine();
