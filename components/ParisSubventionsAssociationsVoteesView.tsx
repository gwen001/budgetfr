"use client";

import { useEffect, useState } from "react";
import { SubventionVotee } from "@/lib/supabase";
import Loader from "@/components/Loader";
import YearSelector from "@/components/YearSelector";
import DataSelector from "@/components/DataSelector";
import InfoButton from "@/components/InfoButton";
import InfoPopup from "@/components/InfoSubventionsAssociationsVotees";
import ParisSubventionsAssociationsVoteesChart from "@/components/ParisSubventionsAssociationsVoteesChart";
import ParisSubventionsAssociationsVoteesTable from "@/components/ParisSubventionsAssociationsVoteesTable";

export default function ParisSubventionsAssociationsVoteesView() {
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [showInfo, setShowInfo] = useState(false);

    const [data, setData] = useState<SubventionVotee[]>([]);
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
            setLoading(true);
            fetch(`/api/paris-subventions-associations-votees?year=${selectedYear}`)
                .then((res) => res.json())
                .then((json) => setData(json))
                .finally(() => setLoading(false));
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
                 <div className="lg:flex justify-between text-center lg:items-center mb-6">
                     <div className="lg:flex items-center gap-4">
                         <DataSelector dataset="paris-subventions-associations-votees" />
                         <InfoButton onClick={() => setShowInfo(true)} />
                     </div>
                    <YearSelector years={[2022, 2023, 2024, 2025]} selectedYear={selectedYear} onChange={setSelectedYear} />
                 </div>
             </header>

             <InfoPopup open={showInfo} onClose={() => setShowInfo(false)} />

            {loading ? (
                <Loader />
            ) : (
                <ParisSubventionsAssociationsVoteesChart
                    data={data}
                    selectedCategory={selectedCategory}
                    onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
                    countByCategory={countByCategory}
                />
            )}

            {loading ? (
                <Loader />
            ) : (
                <ParisSubventionsAssociationsVoteesTable
                    data={data}
                    selectedCategory={selectedCategory}
                    onResetCategory={() => { setSelectedCategory(null); setSearchTerm(""); }}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    groupBySiret={groupBySiret}
                    onToggleGroupBySiret={() => setGroupBySiret((v) => !v)}
                />
            )}
        </div>
    );
}
