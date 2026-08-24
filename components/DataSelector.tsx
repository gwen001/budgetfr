"use client";

import { useRouter } from "next/navigation";

type Props = {
    dataset: string;
};

export default function DatasetSelector({ dataset }: Props) {
    const router = useRouter();

    const handleChange = (value: string) => {
        router.push(`/${value}`);
    };

    return (
        <select
            value={dataset}
            onChange={(e) => handleChange(e.target.value)}
            className="border px-3 py-2 rounded bg-white"
        >
            <option value="paris-subventions-associations-votees">PARIS: Subventions aux associations votées</option>
            <option value="paris-subventions-versees">PARIS: Subventions versées - annexe compte administratif</option>
            <option value="france-remunerations-responsables-publics">FRANCE: Rémunérations des responsables publics par fonction</option>
            <option value="france-remunerations-gouvernement-2026">FRANCE: Rémunérations des membres du gouvernement 2026</option>
            {/* <option value="monde-aide-publique-developpement">MONDE: Répartition des aides publiques au développpement</option> */}
        </select>
    );
}
