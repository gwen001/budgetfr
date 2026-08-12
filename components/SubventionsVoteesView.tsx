"use client";

import { useEffect, useState } from "react";
import { SubventionVotee } from "@/lib/supabase";
import Loader from "@/components/Loader";
import YearSelector from "@/components/YearSelector";
import DataSelector from "@/components/DataSelector";
import InfoButton from "@/components/InfoButton";
import InfoParisData from "@/components/InfoParisData";
import SubventionsVoteesChart from "@/components/SubventionsVoteesChart";
import SubventionsVoteesTable from "@/components/SubventionsVoteesTable";

export default function SubventionsVoteesView() {
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [data, setData] = useState<SubventionVotee[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupBySiret, setGroupBySiret] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const countByCategory = data.reduce((acc, s) => {
        const cat = s.secteurs_d_activites_definies_par_l_association || "Non renseigné";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            fetch(`/api/subventions-votees?year=${selectedYear}`)
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
                 <div className="lg:flex justify-between items-center mb-6">
                     <div className="lg:flex items-center gap-4">
                         <DataSelector dataset="subventions-votees" />
                         <InfoButton onClick={() => setShowInfo(true)} />
                     </div>
                    <YearSelector years={[2022, 2023, 2024]} selectedYear={selectedYear} onChange={setSelectedYear} />
                 </div>
             </header>

             <InfoParisData open={showInfo} onClose={() => setShowInfo(false)} />

            {loading ? (
                <Loader />
            ) : (
                <SubventionsVoteesChart
                    data={data}
                    selectedCategory={selectedCategory}
                    onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
                    countByCategory={countByCategory}
                />
            )}

            {loading ? (
                <Loader />
            ) : (
                <SubventionsVoteesTable
                    data={data}
                    selectedCategory={selectedCategory}
                    onResetCategory={() => { setSelectedCategory(null);  setSearchTerm(""); }}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    groupBySiret={groupBySiret}
                    onToggleGroupBySiret={() => setGroupBySiret((v) => !v)}
                />
            )}
        </div>
    );
}
