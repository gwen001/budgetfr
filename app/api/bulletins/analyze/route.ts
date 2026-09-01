// app/api/bulletins/analyze/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { BulletinSchema } from "@/lib/bulletins/BulletinSchema";
import { DetectAnomalies } from "@/lib/bulletins/DetectAnomalies";


export async function POST(req: Request) {
  try {
    const { bulletinId } = await req.json();

    if (!bulletinId) {
      return NextResponse.json(
        { error: "bulletinId manquant" },
        { status: 400 }
      );
    }

    const { data: bulletin, error: fetchError } = await supabase
      .from("bulletins")
      .select("*")
      .eq("id", bulletinId)
      .single();

    if (fetchError || !bulletin) {
      return NextResponse.json(
        { error: "Bulletin introuvable" },
        { status: 404 }
      );
    }

    // 2) Extraction PDF via microservice Railway
    const extractRes = await fetch(process.env.PDF_EXTRACTOR_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: bulletin.storage_path }),
    });

    if (!extractRes.ok) {
      const errJson = await extractRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errJson.error || "Erreur extraction PDF" },
        { status: 500 }
      );
    }

    const { text: extractedText } = await extractRes.json();

    // 3) Appel Claude (analyse du bulletin)
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const claudeRes = await anthropic.messages.create(
      {
        model: "claude-opus-5",
        max_tokens: 8000,
        // temperature: 0,
        // system:
        //   "Tu es un expert en analyse de bulletins de salaire français. Tu dois produire un JSON strict, exploitable par une application SaaS.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Analyse ce bulletin de salaire et renvoie UNIQUEMENT un JSON strict.

CONTRAINTES IMPORTANTES :
- NE RENVOIE PAS DE TEXTE EN DEHORS DU JSON.
- NE RENVOIE PAS DE BLOC THINKING.
- NE COUPE PAS LE JSON.
- Si un champ est inconnu, mets "" ou 0.
- Le JSON doit être valide, complet, et parseable.

Texte brut du bulletin de salaire :

${extractedText}

{
  "employe": {
    "nom": "...",
    "prenom": "...",
    "poste": "...",
    "matricule": "...",
    "convention_collective": "..."
  },
  "employeur": {
    "raison_sociale": "...",
    "siret": "...",
    "adresse": "..."
  },
  "periode": {
    "mois": "...",
    "annee": "...",
    "date_paiement": "..."
  },
  "montants": {
    "brut": 0,
    "net_imposable": 0,
    "net_a_payer": 0,
    "heures_travaillees": 0,
    "taux_horaire": 0
  },
  "primes": [
    {
      "intitule": "...",
      "montant": 0
    },
  ],
  "total_primes": {
        "montant": 0
    },
  "retenues": [
    {
      "intitule": "...",
      "montant": 0
    },
  ],
    "total_retenues": {
        "montant": 0
    },
  "cotisations": [
    {
      "intitule": "...",
      "base": 0,
      "taux": 0,
      "montant_salarial": 0,
      "montant_patronal": 0
    }
  ],
  "anomalies": [
    {
      "type": "...",
      "description": "...",
      "gravite": "info|warning|critical"
    }
  ],
  "resume": "Résumé clair en français, une ou deux phrases."
}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID!,
        }
      }
    );

    // const contentBlock = claudeRes.content[0];

    // // 4) Mise à jour Supabase avec le résultat
    // await supabase
    //   .from("bulletins")
    //   .update({
    //     status: "processed",
    //     raw_response: contentBlock
    //   })
    //   .eq("id", bulletinId);

    const textBlock = claudeRes.content.find(c => c.type === "text");

    if (!textBlock) {
      return NextResponse.json(
        { error: "Claude n'a renvoyé aucun bloc texte.", raw: claudeRes },
        { status: 500 }
      );
    }

    await supabase
      .from("bulletins")
      .update({
        status: "processed",
        raw_response: textBlock
      })
      .eq("id", bulletinId);

    // if (contentBlock.type !== "text") {
    //   return NextResponse.json(
    //     { error: "Réponse Claude inattendue (pas de bloc texte)." },
    //     { status: 500 }
    //   );
    // }

    const rawJson = textBlock.text.trim();

    // if (!rawJson.trim().endsWith("}")) {
    //   return NextResponse.json(
    //     {
    //       error: "JSON incomplet renvoyé par Claude",
    //       raw: rawJson
    //     },
    //     { status: 500 }
    //   );
    // }

    let analysis;
    try {
      analysis = JSON.parse(rawJson);
    } catch (e) {
      return NextResponse.json(
        {
          error: "Impossible de parser le JSON renvoyé par Claude.",
          raw: rawJson,
        },
        { status: 500 }
      );
    }

    // 4) Mise à jour Supabase avec le résultat
    await supabase
      .from("bulletins")
      .update({
        status: "processed",
        analysis_summary: analysis.resume ?? null,
        // analysis_json: analysis,
      })
      .eq("id", bulletinId);

      const validated = BulletinSchema.safeParse(analysis);

      if (!validated.success) {
        return NextResponse.json(
          {
            error: "JSON IA invalide",
            details: validated.error.format(),
            raw: analysis,
          },
          { status: 500 }
        );
      }

      const bulletin_validated = validated.data;

      // Ajout des anomalies RH
      bulletin_validated.anomalies = DetectAnomalies(bulletin_validated);

      await supabase
        .from("bulletins")
        .update({
          status: "processed",
          analysis_summary: bulletin_validated.resume,
          analysis_json: bulletin_validated,
        })
        .eq("id", bulletinId);


    // 5) Réponse au front
    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
