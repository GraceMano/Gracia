export type SeverityClass = 1 | 2 | 3 | 4;

export interface ErosionFeatureProperties {
  id: number;
  gridcode: SeverityClass;
  area_m2: number;
  area_ha: number;
}

export interface ErosionFeature {
  type: "Feature";
  id?: number | string;
  properties: ErosionFeatureProperties;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface ErosionFeatureCollection {
  type: "FeatureCollection";
  features: ErosionFeature[];
}

export interface SeverityRule {
  classId: SeverityClass;
  nameKey: string;
  color: string;
  fillOpacity: number;
  borderColor: string;
  lossRangeTonsPerHaYear: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  descriptionKey: string;
  recommendations: RecommendationTemplate[];
}

export interface RecommendationTemplate {
  id: string;
  titleKey: string;
  practiceType: "biological" | "mechanical" | "agronomic";
  suitabilitySlope: string;
  descriptionKey: string;
  speciesKey?: string;
  implementationCost: "low" | "medium" | "high";
}

export interface GeneratedRecommendation {
  id: string;
  title: string;
  practiceType: "biological" | "mechanical" | "agronomic";
  suitabilitySlope: string;
  description: string;
  recommendedSpecies?: string;
  implementationCost: "low" | "medium" | "high";
}

export interface TerritoryStatistics {
  totalPolygons: number;
  totalAreaHa: number;
  totalAreaM2: number;
  classBreakdown: Record<
    SeverityClass,
    {
      polygonCount: number;
      totalAreaHa: number;
      percentageArea: number;
    }
  >;
}

export interface LayerFilterState {
  visibleClasses: Record<SeverityClass, boolean>;
  opacity: number;
  highlightedZoneId: number | null;
  selectedZoneId: number | null;
}

export interface ZoneObservation {
  id: string;
  zoneId: number;
  authorName: string;
  authorRole: "agronomist" | "farmer" | "researcher" | "local_officer";
  findingType: "gully_erosion" | "conservation_success" | "rill_erosion" | "landslide" | "general_note";
  comment: string;
  timestamp: string;
}
