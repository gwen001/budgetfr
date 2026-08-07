"use client";

import { useEffect, useState } from "react";
import { Subvention } from "@/lib/supabase";
import { PieChart } from "@/components/PieChart";
import { SubventionsTable } from "@/components/SubventionsTable";

export default function Page() {
    const [data, setData] = useState<Subvention[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupBySiret, setGroupBySiret] = useState(false);
    const countByCategory = data.reduce((acc, s) => {
        const cat = s.secteurs_d_activites_definies_par_l_association || "Non renseigné";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/subventions?year=${selectedYear}`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const params = new URLSearchParams();

    //         if (selectedYears.length > 0) {
    //         params.set("years", selectedYears.join(","));
    //         }

    //         const res = await fetch(`/api/subventions?${params.toString()}`);
    //         const json = await res.json();

    //         setData(json);
    //     };

    //     fetchData();
    // }, [selectedYears]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         let query = supabase.from("subventions").select("*");

    //         if (selectedYears.length > 0) {
    //             query = query.in("annee", selectedYears);
    //         }

    //         const { data, error } = await query;

    //         if (!error && data) {
    //             setData(data);
    //         }
    //     };

    //     fetchData();
    // }, [selectedYears]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const res = await fetch("/api/subventions");
    //             const json = await res.json();
    //             setData(json);
    //         } catch (e) {
    //             console.error(e);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, []);

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
            {/* <h1 className="text-3xl font-bold mb-2">
                Subventions associations votées
            </h1> */}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Subventions associations votées</h1>

                <div className="flex items-center gap-6">
                    {[2023, 2024, 2025].map((year) => (
                        <label key={year} className="flex items-center gap-2 cursor-pointer">
                            <input
                            type="radio"
                            name="year-filter"
                            value={year}
                            checked={selectedYear === year}
                            onChange={() => setSelectedYear(year)}
                            className="w-4 h-4"
                            />
                            <span>{year}</span>
                        </label>
                    ))}
                </div>
            </div>
        </header>

        <PieChart
            data={data}
            selectedCategory={selectedCategory}
            onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
            countByCategory={countByCategory}
        />

        <SubventionsTable
            data={data}
            selectedCategory={selectedCategory}
            onResetCategory={() => { setSelectedCategory(null);  setSearchTerm(""); }}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            groupBySiret={groupBySiret}
            onToggleGroupBySiret={() => setGroupBySiret((v) => !v)}
        />
        </main>
    );
}
