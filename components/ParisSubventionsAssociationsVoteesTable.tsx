import { SubventionVotee } from "@/lib/supabase";

type Props = {
    data: SubventionVotee[];
    selectedCategory: string | null;
    onResetCategory: () => void;
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    groupBySiret: boolean;
    onToggleGroupBySiret: () => void;
};

export default function ParisSubventionsAssociationsVoteesTable({ data, selectedCategory, onResetCategory, searchTerm, onSearchTermChange, groupBySiret, onToggleGroupBySiret }: Props) {
    // Filtrer par catégorie
    const filtered = selectedCategory
        ? data.filter(
            (s) =>
            s.secteurs_d_activites_definies_par_l_association === selectedCategory
        )
        : data;

    let rows: any[] = [];

    if (groupBySiret) {
        // mode groupé par SIRET
        const grouped = filtered.reduce((acc, s) => {
            const key = s.numero_siret || "Non renseigné";

            if (!acc[key]) {
                acc[key] = {
                    secteurs_d_activites_definies_par_l_association: s.secteurs_d_activites_definies_par_l_association || "Non renseigné",
                    nom_beneficiaire: s.nom_beneficiaire || "Non renseigné",
                    numero_siret: s.numero_siret || "Non renseigné",
                    montant_vote: 0,
                    lignes: [],
                };
            }

            acc[key].montant_vote += s.montant_vote || 0;
            acc[key].lignes.push(s);

            return acc;
        }, {} as Record<string, any>);

        rows = Object.values(grouped);
    } else {
        // mode non groupé : on affiche directement les subventions filtrées
        rows = filtered;
    }

    const sorted = Object.values(rows).sort(
        (a, b) => b.montant_vote - a.montant_vote
    );

    const filteredBySearch = sorted.filter((s) =>
        s.nom_beneficiaire.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const total = filteredBySearch.reduce((sum, s) => sum + s.montant_vote, 0);

    const totalCount = data.length;
    const displayedCount = filteredBySearch.length;

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-1 lg:flex items-center gap-x-20">
                    <div className="sm:flex justify-between md:items-center">
                        {/* Titre */}
                        <h2 className="text-m lg:text-xl font-semibold mb-2 sm:mb-0">
                            Détails des subventions
                        </h2>

                        {/* Compteur */}
                        <div className="flex mb-2 sm:mb-0">
                            <div className="flex items-center">
                                <span className="text-sm text-gray-700 sm:ms-2">
                                    ({displayedCount}/{totalCount})
                                </span>
                            </div>

                            {/* Checkbox regroupement */}
                            <label className="flex items-center gap-1 cursor-pointer select-none ms-4">
                                <input
                                    type="checkbox"
                                    checked={groupBySiret}
                                    onChange={onToggleGroupBySiret}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">
                                    regrouper par siret
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Filtre textuel */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Rechercher..."
                            className="border rounded px-3 py-1 text-sm pr-6 w-full mb-2 lg:mb-0"
                        />

                        {searchTerm.length > 0 && (
                            <button
                            onClick={() => onSearchTermChange("")}
                            className="pb-2 lg:pb-0 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer hover:text-gray-700 font-bold"
                            title="Réinitialiser"
                            >
                            ×
                            </button>
                        )}
                    </div>

                    {/* Filtre secteur d'activité */}
                    <div className="border-0">
                        {selectedCategory && (
                            <span className="text-sm text-gray-600 flex items-center">
                            sa: <strong className="ml-1">{selectedCategory}</strong>

                            {/* Bouton reset */}
                            <button
                                onClick={onResetCategory}
                                className="ml-2 text-red-500 hover:cursor-pointer hover:text-red-700 font-bold text-lg"
                                title="Supprimer le filtre"
                            >
                                ×
                            </button>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-gray-100">
                        <tr className="bg-white font-semibold">
                            <td className="px-4 py-2 hidden sm:block"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 hidden md:block"></td>
                            <td className="px-4 py-2 text-right text-red-500">TOTAL:</td>
                            <td className="px-4 py-2 text-right text-red-500">
                                {total.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                    currencyDisplay: 'code',
                                })}
                            </td>
                        </tr>
                        <tr>
                            <th className="px-4 py-2 text-center hidden sm:block">#</th>
                            <th className="px-4 py-2 text-left">Secteur d'activité</th>
                            <th className="px-4 py-2 text-left hidden md:block">Siret</th>
                            <th className="px-4 py-2 text-left">Bénéficiaire</th>
                            <th className="px-4 py-2 text-right">Montant voté</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBySearch.map((s, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2 text-center hidden sm:table-cell">{index + 1}</td>
                                <td className="px-4 py-2">{s.secteurs_d_activites_definies_par_l_association ?? "-"}</td>
                                <td className="px-4 py-2 hidden md:block">
                                    <a href={`https://annuaire-entreprises.data.gouv.fr/entreprise/aaa-${s.numero_siret?.slice(0,9)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.numero_siret ?? "-"}</a>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <a
                                        href={`https://www.google.com/search?q=association+${s.nom_beneficiaire}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800"
                                        >
                                            {/* <img src="/img/google.png" height="16" width="16" /> */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13 7h5m0 0v5m0-5L10 15m-4 4h8a2 2 0 002-2v-8"
                                                />
                                            </svg>
                                        </a>
                                        {/* <a
                                        href={`https://www.helloasso.com/e/recherche?query=${s.nom_beneficiaire}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800"
                                        >
                                            <img src="/img/helloasso.png" height="16" width="16" />
                                        </a> */}
                                        <span title={`${s.nom_beneficiaire}`}>
                                            {s.nom_beneficiaire.length > 50
                                            ? s.nom_beneficiaire.slice(0, 50) + "..."
                                            : s.nom_beneficiaire}
                                        </span>
                                        {groupBySiret ? " ("+s.lignes.length+")" : ""}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {s.montant_vote?.toLocaleString("fr-FR", {
                                        style: "decimal",
                                        currency: "EUR",
                                        minimumFractionDigits: 0,
                                    }) ?? "-"}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-200 font-semibold">
                            <td className="px-4 py-2 hidden sm:block"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 hidden md:block"></td>
                            <td className="px-4 py-2 text-right text-red-500">TOTAL:</td>
                            <td className="px-4 py-2 text-right text-red-500">
                                {total.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                    currencyDisplay: 'code',
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
