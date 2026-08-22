import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids")?.split(",").map(Number) || [];

    const { data: responsables } = await supabase
      .from("responsables_publics")
      .select("*, declarations:responsables_remunerations(*)")
      .in("id", ids);

    return NextResponse.json(responsables);
}
