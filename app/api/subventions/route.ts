import { NextResponse } from "next/server";
import { supabase, Subvention } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");

    let query = supabase
        .from("subventions-associations-votees")
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


// import { NextResponse } from "next/server";
// import { supabase, Subvention } from "@/lib/supabase";

// export async function GET(req: Request) {
//     const { searchParams } = new URL(req.url);
//     const yearsParam = searchParams.get("years");

//     let query = supabase
//         .from("subventions-associations-votees")
//         .select("*");

//     if (yearsParam) {
//         const yearsArray = yearsParam.split(",").map((y) => Number(y));
//         query = query.in("annee_budgetaire", yearsArray);
//     }

//     const { data, error } = await query;

//     if (error) {
//         console.error(error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data as Subvention[]);
// }


// import { NextResponse } from "next/server";
// import { supabase, Subvention } from "@/lib/supabase";

// export async function GET() {
//     const { data, error } = await supabase
//         .from("subventions-associations-votees")
//         .select("*");

//     if (error) {
//         console.error(error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json(data as Subvention[]);
// }
