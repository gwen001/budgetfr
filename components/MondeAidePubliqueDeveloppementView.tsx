"use client";

import { useEffect, useState } from "react";
import { AidePubliqueDeveloppement } from "@/lib/supabase";
import Loader from "@/components/Loader";
import YearSelector from "@/components/YearSelector";
import DataSelector from "@/components/DataSelector";
import InfoButton from "@/components/InfoButton";
import InfoPopup from "@/components/InfoAPD";
import MondeAidePubliqueDeveloppementChart from "@/components/MondeAidePubliqueDeveloppementChart";
import MondeAidePubliqueDeveloppementTable from "@/components/MondeAidePubliqueDeveloppementTable";

export default function MondeAidePubliqueDeveloppementView() {
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [showInfo, setShowInfo] = useState(false);

    const [data, setData] = useState<AidePubliqueDeveloppement[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupBy, setGroupBy] = useState(false);

    const countByCategory = data.reduce((acc, s) => {
        const cat = s.region || "Non spécifié";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setSelectedCategory(null);

            const res = await fetch(`/api/monde-aide-publique-developpement?year=${selectedYear}`)
            const json = await res.json();

            const rows = json || [];

            const mapped = rows.map((row: AidePubliqueDeveloppement) => ({
                annee: row.annee,
                pays_beneficiaire: row.pays_beneficiaire || "Non spécifié",
                pays_beneficiaire_iso: row.pays_beneficiaire_iso,
                region: row.region || "Non spécifié",
                sous_region: row.sous_region || "Non spécifié",
                description: row.description || "-",
                secteur: row.secteur || "",
                montant: (row.montant ? Math.ceil(row.montant*1000) : 0),
            }));

            setData(mapped)
            setLoading(false);

            // setLoading(true);
            // fetch(`/api/monde-aide-publique-developpement?year=${selectedYear}`)
            //     .then((res) => res.json())
            //     .then((json) => setData(json))
            //     .finally(() => setLoading(false));
        };

        fetchData();
    }, [selectedYear]);

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

    return (
        <div className="p-0">
             <header className="mb-4">
                 <div className="lg:flex justify-between items-center mb-6">
                     <div className="lg:flex items-center gap-4">
                         <DataSelector dataset="monde-aide-publique-developpement" />
                         <InfoButton onClick={() => setShowInfo(true)} />
                     </div>
                    <YearSelector years={[2020, 2021, 2022, 2023, 2024]} selectedYear={selectedYear} onChange={setSelectedYear} />
                 </div>
             </header>

             <InfoPopup open={showInfo} onClose={() => setShowInfo(false)} />

            {loading ? (
                <Loader />
            ) : (
                <MondeAidePubliqueDeveloppementChart
                    data={data}
                    selectedCategory={selectedCategory}
                    onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
                    countByCategory={countByCategory}
                />
            )}

            {loading ? (
                <Loader />
            ) : (
                <MondeAidePubliqueDeveloppementTable
                    data={data}
                    selectedCategory={selectedCategory}
                    onResetCategory={() => { setSelectedCategory(null); setSearchTerm(""); }}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    groupBy={groupBy}
                    onToggleGroupBy={() => setGroupBy((v) => !v)}
                />
            )}
        </div>
    );
}
