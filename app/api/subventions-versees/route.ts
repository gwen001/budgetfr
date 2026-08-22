import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");

    let query = supabase
        .from("subventions_versees_annexe_compte_administratif")
        .select("*");

    if (yearParam) {
        const year = Number(yearParam);
        query = query.eq("publication", year);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convertir SubventionVersees[] → Subvention[]
    const converted = data.map((s) => ({
        id: s.id,
        publication: s.publication,
        collectivite: s.collectivite,
        categorie_du_beneficiaire: s.categorie_du_beneficiaire,
        nature_juridique_du_beneficiaire: s.nature_juridique_du_beneficiaire,
        nom_organisme_beneficiaire: s.nom_organisme_beneficiaire,
        montant_de_la_subvention: s.montant_de_la_subvention,
        prestations_en_nature: s.prestations_en_nature,
        montant_verse: s.montant_de_la_subvention + s.prestations_en_nature,
    }));

    return NextResponse.json(converted);
}
