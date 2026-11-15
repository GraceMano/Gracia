import { SeverityClass, SeverityRule } from "@/types/erosion";

export const EROSION_SEVERITY_CONFIG: Record<SeverityClass, SeverityRule> = {
  1: {
    classId: 1,
    nameKey: "severity.low.title",
    color: "#10b981",
    fillOpacity: 0.65,
    borderColor: "#047857",
    lossRangeTonsPerHaYear: "< 10 t/ha/an",
    urgencyLevel: "low",
    descriptionKey: "severity.low.desc",
    recommendations: [
      {
        id: "rec-mulch",
        titleKey: "recommendations.mulching.title",
        practiceType: "agronomic",
        suitabilitySlope: "0 - 12%",
        descriptionKey: "recommendations.mulching.desc",
        speciesKey: "recommendations.mulching.species",
        implementationCost: "low",
      },
      {
        id: "rec-cover-crop",
        titleKey: "recommendations.coverCrop.title",
        practiceType: "biological",
        suitabilitySlope: "0 - 15%",
        descriptionKey: "recommendations.coverCrop.desc",
        speciesKey: "recommendations.coverCrop.species",
        implementationCost: "low",
      },
    ],
  },
  2: {
    classId: 2,
    nameKey: "severity.moderate.title",
    color: "#f59e0b",
    fillOpacity: 0.65,
    borderColor: "#b45309",
    lossRangeTonsPerHaYear: "10 - 25 t/ha/an",
    urgencyLevel: "medium",
    descriptionKey: "severity.moderate.desc",
    recommendations: [
      {
        id: "rec-contour-farming",
        titleKey: "recommendations.contourFarming.title",
        practiceType: "agronomic",
        suitabilitySlope: "8 - 20%",
        descriptionKey: "recommendations.contourFarming.desc",
        implementationCost: "low",
      },
      {
        id: "rec-grass-strips",
        titleKey: "recommendations.grassStrips.title",
        practiceType: "biological",
        suitabilitySlope: "10 - 25%",
        descriptionKey: "recommendations.grassStrips.desc",
        speciesKey: "recommendations.grassStrips.species",
        implementationCost: "medium",
      },
    ],
  },
  3: {
    classId: 3,
    nameKey: "severity.high.title",
    color: "#f97316",
    fillOpacity: 0.7,
    borderColor: "#c2410c",
    lossRangeTonsPerHaYear: "25 - 50 t/ha/an",
    urgencyLevel: "high",
    descriptionKey: "severity.high.desc",
    recommendations: [
      {
        id: "rec-agroforestry-hedges",
        titleKey: "recommendations.hedges.title",
        practiceType: "biological",
        suitabilitySlope: "15 - 35%",
        descriptionKey: "recommendations.hedges.desc",
        speciesKey: "recommendations.hedges.species",
        implementationCost: "medium",
      },
      {
        id: "rec-infiltration-ditches",
        titleKey: "recommendations.ditches.title",
        practiceType: "mechanical",
        suitabilitySlope: "15 - 30%",
        descriptionKey: "recommendations.ditches.desc",
        implementationCost: "medium",
      },
    ],
  },
  4: {
    classId: 4,
    nameKey: "severity.critical.title",
    color: "#ef4444",
    fillOpacity: 0.75,
    borderColor: "#b91c1c",
    lossRangeTonsPerHaYear: "> 50 t/ha/an",
    urgencyLevel: "critical",
    descriptionKey: "severity.critical.desc",
    recommendations: [
      {
        id: "rec-bench-terraces",
        titleKey: "recommendations.terraces.title",
        practiceType: "mechanical",
        suitabilitySlope: "> 25%",
        descriptionKey: "recommendations.terraces.desc",
        implementationCost: "high",
      },
      {
        id: "rec-steep-afforestation",
        titleKey: "recommendations.afforestation.title",
        practiceType: "biological",
        suitabilitySlope: "> 35%",
        descriptionKey: "recommendations.afforestation.desc",
        speciesKey: "recommendations.afforestation.species",
        implementationCost: "high",
      },
    ],
  },
};

export function getSeverityRule(gridcode: number): SeverityRule {
  const normalized = Math.max(1, Math.min(4, Math.round(gridcode || 1))) as SeverityClass;
  return EROSION_SEVERITY_CONFIG[normalized] || EROSION_SEVERITY_CONFIG[1];
}

export const KABARE_GEO_CONFIG = {
  territoryName: "Kabare",
  province: "Sud-Kivu",
  country: "RD Congo",
  defaultCenter: [-2.45, 28.80] as [number, number],
  defaultZoom: 10,
  minZoom: 9,
  maxZoom: 17,
  dataSourceUrl: "/data/kabare_erosion_clean.geojson",
  nativeEpsg: 32735,
  displayEpsg: 4326,
};
