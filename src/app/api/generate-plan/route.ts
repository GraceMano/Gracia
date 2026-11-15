import { NextRequest, NextResponse } from "next/server";
import {
  ErosionFeatureProperties,
  ZoneObservation,
  SeverityClass,
} from "@/types/erosion";
import { getSeverityRule } from "@/config/erosionRules";
import { recommendationEngine } from "@/services/recommendationEngine";

interface PlanRequestBody {
  properties: ErosionFeatureProperties;
  locale?: "fr" | "en" | "es";
  discussions?: ZoneObservation[];
}

export async function POST(req: NextRequest) {
  try {
    const body: PlanRequestBody = await req.json();
    const { properties, locale = "fr", discussions = [] } = body;

    if (!properties || typeof properties.id !== "number") {
      return NextResponse.json(
        { error: "Invalid properties provided" },
        { status: 400 }
      );
    }

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();

    // If no API key configured, use deterministic offline engine
    if (!apiKey) {
      const offlinePlan = await recommendationEngine.generateAiActionPlan(
        properties,
        locale
      );
      return NextResponse.json({
        ...offlinePlan,
        modelUsed: "Moteur Agro-Écologique Kabare (Mode local hors-ligne)",
        discussionAnalysis:
          discussions.length > 0
            ? `${discussions.length} observation(s) terrain enregistrée(s). Clé GEMINI_API_KEY non configurée pour l'analyse sémantique approfondie.`
            : "Aucune observation de terrain à analyser sur cette zone.",
      });
    }

    const rule = getSeverityRule(properties.gridcode);
    const severityLabel =
      rule.classId === 1
        ? "Faible"
        : rule.classId === 2
        ? "Modérée"
        : rule.classId === 3
        ? "Élevée"
        : "Très Élevée / Critique";

    const discussionsContext =
      discussions.length > 0
        ? discussions
            .map(
              (d, i) =>
                `[Observation #${i + 1} par ${d.authorName} (${d.authorRole}) - Type: ${d.findingType}]: "${d.comment}"`
            )
            .join("\n")
        : "Aucune observation de terrain enregistrée pour cette zone.";

    const promptText = `
Tu es un ingénieur agronome expert en conservation des sols (CES/DRS) spécialisé dans le territoire de Kabare, Sud-Kivu, RD Congo (altitude 1500-2200m, sols ferrallitiques et volcaniques sur fortes pentes, pluviométrie annuelle 1300-1800mm).

Génère une fiche technique d'aménagement antiérosif personnalisée et UNIQUE pour la parcelle suivante :
- Identifiant zone : #${properties.id}
- Classe de sévérité d'érosion : Classe ${properties.gridcode} (${severityLabel})
- Taux de perte en terre estimé : ${rule.lossRangeTonsPerHaYear}
- Superficie : ${properties.area_ha} hectares (${properties.area_m2.toLocaleString()} m²)
- Langue requise pour le rapport : ${locale === "fr" ? "Français" : locale === "es" ? "Espagnol" : "Anglais"}

OBSERVATIONS ET RETOURS DE TERRAIN DE LA COMMUNAUTÉ :
${discussionsContext}

CONSIGNES IMPORTANTES :
1. Chaque plan doit être personnalisé et unique à cette parcelle #${properties.id}.
2. Analyse spécifiquement les retours de terrain fournis ci-dessus (par exemple en répondant aux ravines signalées, aux travaux déjà effectués, ou en conseillant les agriculteurs riverains).
3. Adapte les essences végétales (Calliandra calothyrsus, Vetiver zizanioides, Pennisetum purpureum, Grevillea robusta, Alnus acuminata) et les ouvrages (fossés d'infiltration, talus végétalisés, terrasses radicales).
4. Ne mets AUCUN emoji, aucun symbole décoratif unicode, aucun marqueur d'IA générative. Réponds STRICTEMENT au format JSON valide selon le schéma suivant :

{
  "zoneId": ${properties.id},
  "severityClass": ${properties.gridcode},
  "areaHa": ${properties.area_ha},
  "executiveSummary": "Synthèse opérationnelle claire et concise adaptée à la zone et à ses observations",
  "discussionAnalysis": "Analyse critique des constats de terrain publiés par les observateurs locaux et recommandations spécifiques en lien avec ces retours",
  "phases": [
    {
      "title": "Phase 1: Titre de la phase",
      "duration": "Mois 1 - 2",
      "actions": ["Action technique 1", "Action technique 2", "Action technique 3"]
    },
    {
      "title": "Phase 2: Titre de la phase",
      "duration": "Mois 2 - 4",
      "actions": ["Action technique 1", "Action technique 2", "Action technique 3"]
    },
    {
      "title": "Phase 3: Titre de la phase",
      "duration": "Mois 5 - 12",
      "actions": ["Action technique 1", "Action technique 2", "Action technique 3"]
    }
  ],
  "recommendedSpecies": ["Espèce 1", "Espèce 2", "Espèce 3"],
  "maintenanceGuidelines": "Protocole de maintenance périodique et curage des ouvrages"
}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      // Graceful fallback to deterministic engine on API error
      const offlinePlan = await recommendationEngine.generateAiActionPlan(
        properties,
        locale
      );
      return NextResponse.json({
        ...offlinePlan,
        modelUsed: "Moteur Agro-Écologique Kabare (Secours après erreur API)",
        discussionAnalysis:
          discussions.length > 0
            ? `${discussions.length} observation(s) terrain enregistrée(s).`
            : "Aucune observation de terrain.",
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (e) {
      parsedResult = await recommendationEngine.generateAiActionPlan(
        properties,
        locale
      );
    }

    return NextResponse.json({
      ...parsedResult,
      modelUsed: "Google Gemini 1.5 Flash",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Generate plan route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
