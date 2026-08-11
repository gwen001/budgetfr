import { NextResponse } from "next/server";
import { supabase, Subvention } from "@/lib/supabase";

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

    return NextResponse.json(data as Subvention[]);
}
