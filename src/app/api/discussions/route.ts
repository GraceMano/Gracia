import { NextRequest, NextResponse } from "next/server";
import { ZoneObservation } from "@/types/erosion";
import { neon } from "@neondatabase/serverless";

// Fallback in-memory state when DATABASE_URL is not set
const MEMORY_OBSERVATIONS: ZoneObservation[] = [
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

async function getNeonClient() {
  const dbUrl = (process.env.DATABASE_URL || "").trim();
  if (!dbUrl) return null;
  return neon(dbUrl);
}

// GET /api/discussions?zoneId=1042
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneIdParam = searchParams.get("zoneId");
    const zoneId = zoneIdParam ? parseInt(zoneIdParam, 10) : null;

    const sql = await getNeonClient();

    if (sql) {
      // Ensure table exists on first query
      await sql`
        CREATE TABLE IF NOT EXISTS zone_observations (
          id VARCHAR(64) PRIMARY KEY,
          zone_id INTEGER NOT NULL,
          author_name VARCHAR(128) NOT NULL,
          author_role VARCHAR(64) NOT NULL,
          finding_type VARCHAR(64) NOT NULL,
          comment TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `;

      let rows;
      if (zoneId !== null && !isNaN(zoneId)) {
        rows = await sql`
          SELECT id, zone_id as "zoneId", author_name as "authorName", 
                 author_role as "authorRole", finding_type as "findingType", 
                 comment, timestamp
          FROM zone_observations
          WHERE zone_id = ${zoneId}
          ORDER BY timestamp DESC
        `;
      } else {
        rows = await sql`
          SELECT id, zone_id as "zoneId", author_name as "authorName", 
                 author_role as "authorRole", finding_type as "findingType", 
                 comment, timestamp
          FROM zone_observations
          ORDER BY timestamp DESC
        `;
      }

      return NextResponse.json(rows);
    }

    // In-memory fallback
    if (zoneId !== null && !isNaN(zoneId)) {
      const filtered = MEMORY_OBSERVATIONS.filter((o) => o.zoneId === zoneId);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(MEMORY_OBSERVATIONS);
  } catch (error) {
    console.error("GET /api/discussions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch observations" },
      { status: 500 }
    );
  }
}

// POST /api/discussions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, authorName, authorRole, findingType, comment } = body;

    if (!zoneId || !comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newObservation: ZoneObservation = {
      id: `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      zoneId: Number(zoneId),
      authorName: (authorName || "Observateur de terrain").trim(),
      authorRole: authorRole || "agronomist",
      findingType: findingType || "general_note",
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
    };

    const sql = await getNeonClient();

    if (sql) {
      await sql`
        INSERT INTO zone_observations (id, zone_id, author_name, author_role, finding_type, comment, timestamp)
        VALUES (
          ${newObservation.id},
          ${newObservation.zoneId},
          ${newObservation.authorName},
          ${newObservation.authorRole},
          ${newObservation.findingType},
          ${newObservation.comment},
          ${newObservation.timestamp}
        )
      `;
    } else {
      MEMORY_OBSERVATIONS.unshift(newObservation);
    }

    return NextResponse.json(newObservation, { status: 201 });
  } catch (error) {
    console.error("POST /api/discussions error:", error);
    return NextResponse.json(
      { error: "Failed to create observation" },
      { status: 500 }
    );
  }
}
