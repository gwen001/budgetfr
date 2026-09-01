// "use client";

import Link from "next/link";
import { redirect } from "next/navigation";

export default function Page() {
    const ENABLE_REDIRECT = false;

    if (ENABLE_REDIRECT) {
        redirect("/subventions-votees");
    }

    return (
        <div className="p-0">
            <h1 className="text-3xl font-bold mb-6">BudgetFR</h1>

            <h2 className="text-2xl font-bold mb-3">PARIS</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                    <Link href="/paris-subventions-associations-votees" className="text-blue-600 underline">
                        Répartition des subventions aux associations votées
                    </Link>
                </li>
                <li>
                    <Link href="/paris-subventions-versees" className="text-blue-600 underline">
                        Répartition des subventions versées - annexe compte administratif
                    </Link>
                </li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">FRANCE</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                    <Link href="/france-remunerations-responsables-publics" className="text-blue-600 underline">
                        Répartition des rémunérations des responsables publics par fonction
                    </Link>
                </li>
                <li>
                    <Link href="/france-remunerations-gouvernement-2026" className="text-blue-600 underline">
                        Rémunérations des membres du gouvernement 2026
                    </Link>
                </li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">MONDE</h2>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                    <Link href="/monde-aide-publique-developpement" className="text-blue-600 underline">
                        Répartition des aides publiques au développpement
                    </Link>
                </li>
            </ul>
        </div>
  );
}
