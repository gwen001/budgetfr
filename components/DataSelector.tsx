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
            <option value="subventions-votees">Subventions aux associations votées</option>
            <option value="subventions-versees">Subventions versées - annexe compte administratif</option>
            <option value="responsables-publics">Rémunérations des responsables publics</option>
            {/* <option value="responsables-publics-remunerations">Rémunérations des responsables publics par fonction</option> */}
        </select>
    );
}
