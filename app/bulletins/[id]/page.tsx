import { BulletinResult } from "@/components/bulletins/BulletinResult";
import { supabase } from "@/lib/supabase";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const params_resolved = await params;

    const { data: bulletin } = await supabase
        .from("bulletins")
        .select("*")
        .eq("id", params_resolved.id)
        .single();

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-10">Analyse du bulletin de salaire</h1>
            <BulletinResult bulletin={bulletin.analysis_json} />
        </div>
    );
}
