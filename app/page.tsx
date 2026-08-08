"use client";

import { useEffect, useState } from "react";
import { Subvention } from "@/lib/supabase";
import { PieChart } from "@/components/PieChart";
import { SubventionsTable } from "@/components/SubventionsTable";
import { Analytics } from "@vercel/analytics/next"

export default function Page() {
    const [data, setData] = useState<Subvention[]>([]);
    const [showInfo, setShowInfo] = useState(false);
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
        if (!showInfo) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
            setShowInfo(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showInfo]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
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

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //         <span className="text-gray-600">Chargement des données…</span>
    //         </div>
    //     );
    // }

    return (
        <main className="space-y-6">
            <header className="mb-4">
                <div className="lg:flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center lg:text-left lg:flex items-center gap-4">
                        Subventions aux associations (Paris)
                        <button
                            onClick={() => setShowInfo(true)}
                            className="ms-4 lg:ms-0 align-middle cursor-pointer w-6 h-6 lg:flex items-center justify-center rounded-full bg-black text-white text-sm font-bold"
                            aria-label="Informations"
                            >
                            ?
                        </button>
                    </h1>
                    <div className="mt-3 lg:mt-0 lg:flex items-center text-center gap-6">
                        {[2023, 2024, 2025].map((year) => (
                            <label key={year} className="ms-3 lg:ms-0 lg:flex items-center gap-2 cursor-pointer">
                                <input
                                type="radio"
                                name="year-filter"
                                value={year}
                                checked={selectedYear === year}
                                onChange={() => setSelectedYear(year)}
                                className="w-4 h-4"
                                />
                                <span className="ms-1 lg:ms-0">{year}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </header>

            {showInfo && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setShowInfo(false)}   // 👈 clic sur le fond = fermer
                >
                    <div
                    className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}   // 👈 clic dans la popup = ne pas fermer
                    >
                        <h2 className="text-xl font-semibold mb-4">Liste des subventions aux associations votées par la ville de Paris.</h2>
                        <p className="text-gray-700 mb-6">
                            Sont considérées comme bénéficiaires de subvention les associations relevant de la loi du 1er juillet 1901 ayant déposé par exercice budgétaire une ou plusieurs demandes de subvention auprès de la ville de Paris.
                        </p>
                        <p className="text-gray-700 mb-6">
                            Données extraites de <a href="https://opendata.paris.fr/explore/dataset/subventions-associations-votees-/information/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Paris | DATA</a>, site officiel de la démarche Open Data de la ville de Paris.
                        </p>
                        <button onClick={() => setShowInfo(false)} className="px-4 py-2 bg-black text-white rounded hover:cursor-pointer hover:bg-gray-800">
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-center h-100">
                        <span className="text-gray-600">Chargement des données...</span>
                    </div>
                </div>
            ) : (
                <PieChart
                    data={data}
                    selectedCategory={selectedCategory}
                    onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
                    countByCategory={countByCategory}
                />
            )}

            <SubventionsTable
                data={data}
                selectedCategory={selectedCategory}
                onResetCategory={() => { setSelectedCategory(null);  setSearchTerm(""); }}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                groupBySiret={groupBySiret}
                onToggleGroupBySiret={() => setGroupBySiret((v) => !v)}
            />

            <Analytics />

        </main>
    );
}
