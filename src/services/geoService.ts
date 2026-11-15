import {
  ErosionFeatureCollection,
  ErosionFeature,
  TerritoryStatistics,
  SeverityClass,
} from "@/types/erosion";
import { KABARE_GEO_CONFIG } from "@/config/erosionRules";

export interface ErosionGeoService {
  loadErosionDataset(): Promise<ErosionFeatureCollection>;
  calculateTerritoryStats(data: ErosionFeatureCollection): TerritoryStatistics;
  getZoneById(
    data: ErosionFeatureCollection,
    id: number
  ): ErosionFeature | undefined;
}

export class StaticErosionGeoService implements ErosionGeoService {
  private cachedDataset: ErosionFeatureCollection | null = null;
  private readonly dataUrl: string;

  constructor(dataUrl: string = KABARE_GEO_CONFIG.dataSourceUrl) {
    this.dataUrl = dataUrl;
  }

  async loadErosionDataset(): Promise<ErosionFeatureCollection> {
    if (this.cachedDataset) {
      return this.cachedDataset;
    }

    const response = await fetch(this.dataUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch geospatial dataset from ${this.dataUrl}: ${response.statusText}`
      );
    }

    const data: ErosionFeatureCollection = await response.json();
    this.cachedDataset = data;
    return data;
  }

  calculateTerritoryStats(data: ErosionFeatureCollection): TerritoryStatistics {
    const breakdown: Record<
      SeverityClass,
      { polygonCount: number; totalAreaHa: number; percentageArea: number }
    > = {
      1: { polygonCount: 0, totalAreaHa: 0, percentageArea: 0 },
      2: { polygonCount: 0, totalAreaHa: 0, percentageArea: 0 },
      3: { polygonCount: 0, totalAreaHa: 0, percentageArea: 0 },
      4: { polygonCount: 0, totalAreaHa: 0, percentageArea: 0 },
    };

    let totalAreaHa = 0;
    let totalAreaM2 = 0;

    for (const feature of data.features) {
      const { gridcode, area_ha, area_m2 } = feature.properties;
      const classId = Math.max(1, Math.min(4, Math.round(gridcode || 1))) as SeverityClass;

      if (breakdown[classId]) {
        breakdown[classId].polygonCount += 1;
        breakdown[classId].totalAreaHa += area_ha;
      }
      totalAreaHa += area_ha;
      totalAreaM2 += area_m2;
    }

    for (const classId of [1, 2, 3, 4] as SeverityClass[]) {
      const classHa = breakdown[classId].totalAreaHa;
      breakdown[classId].totalAreaHa = Number(classHa.toFixed(2));
      breakdown[classId].percentageArea =
        totalAreaHa > 0 ? Number(((classHa / totalAreaHa) * 100).toFixed(1)) : 0;
    }

    return {
      totalPolygons: data.features.length,
      totalAreaHa: Number(totalAreaHa.toFixed(2)),
      totalAreaM2: Number(totalAreaM2.toFixed(2)),
      classBreakdown: breakdown,
    };
  }

  getZoneById(
    data: ErosionFeatureCollection,
    id: number
  ): ErosionFeature | undefined {
    return data.features.find((f) => f.properties.id === id);
  }
}

export const geoService: ErosionGeoService = new StaticErosionGeoService();
