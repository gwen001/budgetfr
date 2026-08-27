"use client";

export function apdKeepLine( typeFinancement: string | null, modalite: string | null, typeFlux: string | null ): boolean {
    // 1. EXCLUSIONS — règles strictes OCDE + APD réelle

    // a) Type de financement à exclure
    const excludeFinancement = new Set([
        'Annulation/conversion de la dette',
        'Rééchelonnement de la dette',
        'Garanties',
        'Obligations'
    ]);

    if( typeFinancement && typeFinancement.length && excludeFinancement.has(typeFinancement) ) {
        return false;
    }

    // b) Modalités de coopération à exclure
    const excludeModalites = new Set([
        'Coûts imputés des étudiants',
        'Bourses/formations dans le pays donneur',
        'Personnel du pays donneur',
        'Frais administratifs non inclus ailleurs',
        'Demandeurs d’asile finalement acceptés',
        'Demandeurs d’asile finalement déboutés',
        'Refugiés/demandeurs d’asile dans les pays donneurs',
        'Réfugiés et demandeurs d\'asile dans d\'autres pays fournisseurs',
        'Sensibilisation au développement',
        'Allégement de la dette',
        'Transfert intra-gouvernemental pour ISP',
        'Personnes auxquelles le statut de réfugié a été accordé'
    ]);

    if( modalite && modalite.length && modalite && excludeModalites.has(modalite) ) {
        return false;
    }

    // c) Type de flux à exclure
    const excludeFlux = new Set([
        'Instruments du Secteur Privé',
        'Autre Apport du Secteur Public hors crédits-export',
        'Autres apports',
        'Non apports'
    ]);

    if( typeFlux && typeFlux.length && excludeFlux.has(typeFlux) ) {
        return false;
    }

    // 2. INCLUSIONS — tout ce qui reste est de l’APD réelle
    return true;
}

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

    const [showMultilateral, setShowMultilateral] = useState(true);
    const [enableStructuredFilter, setEnableStructuredFilter] = useState(false);

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
                type_de_financement: row.type_de_financement || "",
                modalites_de_cooperation: row.modalites_de_cooperation || "",
                type_de_flux: row.type_de_flux || "",
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

    const filteredData = data
        // Filtre Multilatéral
        .filter((item) => {
            if (showMultilateral) return true;
            return item.region !== "Multilatéral";
        })
        // Filtre structuré basé sur les 3 champs
        .filter((item) => {
            if (!enableStructuredFilter) return true;

            return apdKeepLine(
                item['type_de_financement'],
                item['modalites_de_cooperation'],
                item['type_de_flux']
            );
            // return (
            //     item.type_de_financement !== "EXCLURE" &&
            //     item.modalites_de_cooperation !== "EXCLURE" &&
            //     item.type_de_flux !== "EXCLURE"
            // );
        });


    // const filteredMulti = data.filter((item) => {
    //     if (showMultilateral) return true;
    //     return item.region !== "Multilatéral";
    // })

    // Filtrage APD réelle
    // const filteredData = filteredMulti.filter((row) => {
    //     if (showMultilateral) return true;
    //     apdKeepLine(
    //         row['type_de_financement'],
    //         row['modalites_de_cooperation'],
    //         row['type_de_flux']
    //     )
    // });

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
                    data={filteredData}
                    selectedCategory={selectedCategory}
                    onCategoryClick={(cat) => { setSelectedCategory(cat); setSearchTerm(""); }}
                    countByCategory={countByCategory}
                    showMultilateral={showMultilateral}
                    setShowMultilateral={setShowMultilateral}
                    enableStructuredFilter={enableStructuredFilter}
                    setEnableStructuredFilter={setEnableStructuredFilter}
                  />
            )}

            {loading ? (
                <Loader />
            ) : (
                <MondeAidePubliqueDeveloppementTable
                    data={filteredData}
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
