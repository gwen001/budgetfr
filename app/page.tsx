"use client";

import { useEffect, useState } from "react";
import { Subvention } from "@/lib/supabase";
import { PieChart } from "@/components/PieChart";
import { SubventionsTable } from "@/components/SubventionsTable";

export default function Page() {
    const [data, setData] = useState<Subvention[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await fetch("/api/subventions");
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
            <span className="text-gray-600">Chargement des données…</span>
            </div>
        );
    }

    return (
        <main className="space-y-6">
        <header className="mb-4">
            <h1 className="text-3xl font-bold mb-2">
                Subventions associations votées
            </h1>
            {/* <p className="text-gray-600">
                Répartition des montants par secteur d'activité.
            </p> */}
        </header>

        <PieChart
            data={data}
            selectedCategory={selectedCategory}
            onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
        />

        <SubventionsTable
            data={data}
            selectedCategory={selectedCategory}
            onResetCategory={() => { setSelectedCategory(null);  setSearchTerm(""); }}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
        />
        </main>
    );
}
