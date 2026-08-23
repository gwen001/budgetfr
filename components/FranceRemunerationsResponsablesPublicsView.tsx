"use client";

import { useEffect, useState } from "react";
import { ResponsableRemuneration } from "@/lib/supabase";
import Loader from "@/components/Loader";
import DataSelector from "./DataSelector";
import YearSelector from "./YearSelector";
import InfoButton from "@/components/InfoButton";
import InfoPopup from "@/components/InfoHATVP2";
import FranceRemunerationsResponsablesPublicsChart from "./FranceRemunerationsResponsablesPublicsChart";
import FranceRemunerationsResponsablesPublicsTable from "./FranceRemunerationsResponsablesPublicsTable";

function capitalizeWords(str: string | null | undefined) {
    if( !str || !str.length ) {
        return "";
    }
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
}

export default function FranceRemunerationsResponsablesPublicsView() {
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [showInfo, setShowInfo] = useState(false);

    const [tableData, setTableData] = useState([]);
    const [selectedFonction, setSelectedFonction] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupByName, setGroupByName] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setSelectedFonction(null);

            const res = await fetch(`/api/france-remunerations-responsables-publics?year=${selectedYear}`);
            const json = await res.json();

            const rows = json || [];

            const mapped = rows.map((row: ResponsableRemuneration) => ({
                responsableId: row.responsable.id,
                civilite: row.responsable.civilite,
                nom: row.responsable.nom,
                prenom: row.responsable.prenom,
                photo: row.responsable.photo,
                employeur: row.employeur || "",
                description: row.description || "",
                montant: row.montant,
                annee: row.annee,
                fonctionId: row.fonction?.id || null,
                fonctionNom: capitalizeWords(row.fonction?.nom) || "Non renseigné",
                textCNP: row.responsable.civilite+" "+row.responsable.nom+" "+row.responsable.prenom,
                textED: row.employeur+" "+row.description
            }));

            setTableData(mapped)
            setLoading(false);
        };

        fetchData();
    }, [selectedYear]);

    const handleSliceClick = (fonctionNom: string | null) => {
        setSelectedFonction(fonctionNom);
    };

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
                        <DataSelector dataset="france-remunerations-responsables-publics" />
                        <InfoButton onClick={() => setShowInfo(true)} />
                     </div>
                    <YearSelector years={[2021, 2022, 2023, 2024, 2025]} selectedYear={selectedYear} onChange={setSelectedYear} />
                 </div>
             </header>

            <InfoPopup open={showInfo} onClose={() => setShowInfo(false)} />

            {loading ? (
                <Loader />
            ) : (
                <FranceRemunerationsResponsablesPublicsChart
                    data={tableData}
                    onSliceClick={handleSliceClick}
                    selectedFonction={selectedFonction}
                />
            )}
            {loading ? (
                <Loader />
            ) : (
                <FranceRemunerationsResponsablesPublicsTable
                    data={tableData}
                    selectedFonction={selectedFonction}
                    onResetFonction={() => { setSelectedFonction(null); setSearchTerm(""); }}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    groupByName={groupByName}
                    onToggleGroupByName={() => setGroupByName((v) => !v)}
                />
            )}
        </div>
    );
}
