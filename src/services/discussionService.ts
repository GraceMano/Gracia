import { ZoneObservation } from "@/types/erosion";

const STORAGE_KEY = "kabare_zone_field_observations";

const DEFAULT_SEED_OBSERVATIONS: ZoneObservation[] = [
  {
    id: "obs-1",
    zoneId: 615,
    authorName: "Justin Birindwa",
    authorRole: "agronomist",
    findingType: "conservation_success",
    comment:
      "Plantation réussie de haies vives de Calliandra calothyrsus et de Vétiver sur les courbes de niveau. Forte réduction du ruissellement observée après les fortes averses d'octobre.",
    timestamp: "2026-11-10T08:30:00Z",
  },
  {
    id: "obs-2",
    zoneId: 1042,
    authorName: "Dr. Pascal Murhula",
    authorRole: "researcher",
    findingType: "gully_erosion",
    comment:
      "Apparition d'un ravinement actif de 1.8 mètre de profondeur en bordure de parcelle sur forte pente. Nécessité urgente d'un fascinage en bois et de fossés d'infiltration.",
    timestamp: "2026-11-12T14:15:00Z",
  },
  {
    id: "obs-3",
    zoneId: 2100,
    authorName: "Anselme Bahati",
    authorRole: "farmer",
    findingType: "general_note",
    comment:
      "Pratique du paillage avec tiges de maïs et fanes de haricot généralisée sur 3 hectares riverains. Meilleure humidité résiduelle du sol.",
    timestamp: "2026-11-14T09:45:00Z",
  },
];

export class DiscussionService {
  private getStoredObservations(): ZoneObservation[] {
    if (typeof window === "undefined") {
      return DEFAULT_SEED_OBSERVATIONS;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_OBSERVATIONS));
        return DEFAULT_SEED_OBSERVATIONS;
      }
      return JSON.parse(raw) as ZoneObservation[];
    } catch (e) {
      return DEFAULT_SEED_OBSERVATIONS;
    }
  }

  private saveObservations(obs: ZoneObservation[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obs));
    } catch (e) {
      console.error("Failed to save observations to localStorage:", e);
    }
  }

  getAllObservations(): ZoneObservation[] {
    return this.getStoredObservations();
  }

  getObservationsForZone(zoneId: number): ZoneObservation[] {
    return this.getStoredObservations().filter((o) => o.zoneId === zoneId);
  }

  getObservedZoneIds(): Set<number> {
    const list = this.getStoredObservations();
    return new Set(list.map((o) => o.zoneId));
  }

  addObservation(
    zoneId: number,
    authorName: string,
    authorRole: ZoneObservation["authorRole"],
    findingType: ZoneObservation["findingType"],
    comment: string
  ): ZoneObservation {
    const newEntry: ZoneObservation = {
      id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      zoneId,
      authorName: authorName.trim() || "Observateur Anonyme",
      authorRole,
      findingType,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    const current = this.getStoredObservations();
    const updated = [newEntry, ...current];
    this.saveObservations(updated);
    return newEntry;
  }
}

export const discussionService = new DiscussionService();
