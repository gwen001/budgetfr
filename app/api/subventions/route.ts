import { NextResponse } from "next/server";
import { supabase, Subvention } from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("subventions-associations-votees")
        .select("*");

    if (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as Subvention[]);
}
