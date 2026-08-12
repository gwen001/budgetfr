import { NextResponse } from "next/server";
import { supabase, SubventionVotee } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    // const yearsParam = searchParams.get("years");

    // let query = supabase
    //     .from("subventions_associations_votees")
    //     .select("*");

    // if (yearsParam) {
    //     const years = yearsParam.split(",").map(Number);
    //     query = query.in("annee_budgetaire", years);
    // }

    // const { data, error } = await query;

    // if (error) {
    //     console.error(error);
    //     return NextResponse.json({ error: error.message }, { status: 500 });
    // }

    const yearParam = searchParams.get("year");

    let query = supabase
        .from("subventions_associations_votees")
        .select("*");

    if (yearParam) {
        const year = Number(yearParam);
        query = query.eq("annee_budgetaire", year);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convertir SubventionVotees[] → Subvention[]
    // const converted = data.map((s) => ({
    //     id: s.id,
    //     annee: s.annee_budgetaire,
    //     nom_beneficiaire: s.nom_beneficiaire,
    //     numero_siret: s.numero_siret,
    //     secteurs_d_activites: s.secteurs_d_activites_definies_par_l_association,
    //     nature_juridique: null,
    //     montant: s.montant_vote,
    // }));

    return NextResponse.json(data);
}
