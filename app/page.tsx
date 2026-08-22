"use client";

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

            <ul className="list-disc pl-6 space-y-2">
                <li>
                    <Link href="/subventions-votees" className="text-blue-600 underline">
                        Répartition des subventions votées aux associations
                    </Link>
                </li>
                <li>
                    <Link href="/subventions-versees" className="text-blue-600 underline">
                        Répartition des subventions versées, comptes annexes
                    </Link>
                </li>
                <li>
                    <Link href="/responsables-publics" className="text-blue-600 underline">
                        Rémunérations des membres du gouvernement en place depuis février 2026
                    </Link>
                </li>
                {/* <li>
                    <Link href="/responsables-publics-remunerations" className="text-blue-600 underline">
                        Répartition des rémunérations des responsables publiques
                    </Link>
                </li> */}
            </ul>
        </div>
  );
}
