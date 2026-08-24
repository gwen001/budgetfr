import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");

    let query = supabase
        .from("aide_publique_developpement")
        .select("*");

    if (yearParam) {
        const year = Number(yearParam);
        query = query.eq("annee", year);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
