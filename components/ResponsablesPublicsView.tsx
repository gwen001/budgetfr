"use client";

import { useEffect, useState } from "react";
import { ResponsablePublic } from "@/lib/supabase";
import Loader from "@/components/Loader";
import DataSelector from "@/components/DataSelector";
import InfoButton from "@/components/InfoButton";
import InfoPopup from "@/components/InfoHATVP1";
import ResponsablesPublicsCard from "@/components/ResponsablesPublicsCard";

export default function ResponsablesPublicsView() {
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [responsables, setResponsables] = useState<ResponsablePublic[]>([]);

    const groupes = [
        {
            titre: "Premier Ministre",
            ids: [1865, 2395, 474, 277, ],
        },
        {
            titre: "Ministère de l'Intérieur",
            ids: [2351, 281, 3123, ],
        },
        {
            titre: "Ministère des Armées et des Anciens combattants",
            ids: [3118, 2786, ],
        },
        {
            titre: "Ministère du Travail et des Solidarités",
            ids: [1162, 2756, ],
        },
        {
            titre: "Ministère de la Transition écologique, de la Biodiversité et des Négociations internationales sur le climat et la nature",
            ids: [163, 647, 1880, ],
        },
        {
            titre: "Ministère de la Justice",
            ids: [871],
        },
        {
            titre: "Ministère de l'Économie, des Finances et de la Souveraineté industrielle, énergétique et numérique",
            ids: [1942, 474, 2121, 1896, ],
        },
        {
            titre: "Ministère des Petites et moyennes entreprises, du Commerce, de l'Artisanat et du Tourisme et du Pouvoir d'achat",
            ids: [2409, ],
        },
        {
            titre: "Ministère de l'Agriculture, de l'Agro-alimentaire et de la Souveraineté alimentaire",
            ids: [1359, ],
        },
        {
            titre: "Ministère de l'Éducation nationale",
            ids: [1347, 2756, ],
        },
        {
            titre: "Ministère de l'Europe et des Affaires étrangères",
            ids: [181, 1526, 1237, 596, ],
        },
        {
            titre: "Ministère de la Santé, des Familles, de l'Autonomie et des Personnes handicapées",
            ids: [2707, 1303, ],
        },
        {
            titre: "Ministère de la Culture",
            ids: [2440, ],
        },
        {
            titre: "Ministère des Outre-mer",
            ids: [2292, ],
        },
        {
            titre: "Ministère de l'Aménagement du territoire et de la Décentralisation",
            ids: [1326, 1254, ],
        },
        {
            titre: "Ministère de l'Action et des Comptes publics",
            ids: [56, ],
        },
        {
            titre: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Espace",
            ids: [154, ],
        },
        {
            titre: "Ministère des Sports, de la Jeunesse et de la Vie associative",
            ids: [1202, ],
        },
        {
            titre: "Ministère des Transports",
            ids: [2964, ],
        },
        {
            titre: "Ministère de la Ville et du Logement",
            ids: [1646, ],
        },
    ];

    // const IDS = [2331,2863, 938, 741];
    const IDS = groupes.flatMap(g => g.ids);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/responsables-publics?ids=${IDS.join(",")}`)
        .then((res) => res.json())
        .then(setResponsables)
        .finally(() => setLoading(false));
    }, []);

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
                        <DataSelector dataset="responsables-publics" />
                        <InfoButton onClick={() => setShowInfo(true)} />
                    </div>
                </div>
            </header>

            <InfoPopup open={showInfo} onClose={() => setShowInfo(false)} />

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white rounded-xl shadow p-2 sm:p-8">
                    {groupes.map((groupe, index) => (
                        <div key={index} className="mb-15">
                            <h2 className="text-2xl font-bold mb-4">{groupe.titre}</h2>

                            <div className="flex flex-wrap gap-6">
                            {groupe.ids.map((id,index) => {
                                const isFirst = index === 0;
                                const responsable = responsables.find(r => r.id === id);
                                if (!responsable) return null;
                                return (
                                    <div key={id} className="mr-4">
                                        <ResponsablesPublicsCard key={id} responsable={responsable} isFirst={isFirst} />
                                    </div>
                                );
                            })}

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
