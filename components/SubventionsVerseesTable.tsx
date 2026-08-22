import { SubventionVersee } from "@/lib/supabase";

type Props = {
  data: SubventionVersee[];
  selectedCategory: string | null;
  onResetCategory: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  groupBySiret: boolean;
  onToggleGroupBySiret: () => void;
};

export default function SubventionsVerseesTable({ data, selectedCategory, onResetCategory, searchTerm, onSearchTermChange, groupBySiret, onToggleGroupBySiret }: Props) {
  // Filtrer par catégorie
  const filtered = selectedCategory
    ? data.filter(
        (s) =>
          s.nature_juridique_du_beneficiaire === selectedCategory
      )
    : data;

    let rows: any[] = [];

    if (groupBySiret) {
        // mode groupé par nature juridique
        const grouped = filtered.reduce((acc, s) => {
            const key = s.nom_organisme_beneficiaire || "Non renseigné";

            if (!acc[key]) {
                acc[key] = {
                    nature_juridique_du_beneficiaire: s.nature_juridique_du_beneficiaire || "Non renseigné",
                    nom_organisme_beneficiaire: s.nom_organisme_beneficiaire || "Non renseigné",
                    // montant_de_la_subvention: s.montant_de_la_subvention,
                    // prestations_en_nature: s.prestations_en_nature,
                    montant_verse: 0,
                    lignes: [],
                };
            }

            acc[key].montant_verse += s.montant_verse || 0;
            acc[key].lignes.push(s);

            return acc;
        }, {} as Record<string, any>);

        rows = Object.values(grouped);
    } else {
        // mode non groupé : on affiche directement les subventions filtrées
        rows = filtered;
    }

    const sorted = Object.values(rows).sort(
        (a, b) => b.montant_verse - a.montant_verse
    );

    const filteredBySearch = sorted.filter((s) =>
        s.nom_organisme_beneficiaire.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const total = filteredBySearch.reduce((sum, s) => sum + s.montant_verse, 0);

    const totalCount = data.length;
    const displayedCount = filteredBySearch.length;

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-1 lg:flex items-center gap-x-20">
                    <div className="flex justify-between items-center">
                        {/* Titre */}
                        <h2 className="text-m lg:text-xl font-semibold mb-2 lg:mb-0">
                            Détails des subventions
                        </h2>

                        {/* Compteur */}
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 ms-2">
                                ({displayedCount}/{totalCount})
                            </span>
                        </div>

                        {/* Checkbox regroupement */}
                        {/* <label className="flex items-center gap-1 cursor-pointer select-none ms-4">
                            <input
                                type="checkbox"
                                checked={groupBySiret}
                                onChange={onToggleGroupBySiret}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">
                                regrouper par bénéficiaire
                            </span>
                        </label> */}
                    </div>

                    {/* Filtre textuel */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Filtrer par bénéficiaire..."
                            className="border rounded px-3 py-1 text-sm pr-6 w-full mb-2 lg:mb-0"
                        />

                        {searchTerm.length > 0 && (
                            <button
                            onClick={() => onSearchTermChange("")}
                            className="pb-2 lg:pb-0 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:cursor-pointer hover:text-gray-700 font-bold"
                            title="Réinitialiser le filtre"
                            >
                            ×
                            </button>
                        )}
                    </div>

                    {/* Filtre nature juridique */}
                    <div className="border-0">
                        {selectedCategory && (
                            <span className="text-sm text-gray-600 flex items-center">
                            nj: <strong className="ml-1">{selectedCategory}</strong>

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
                            <th className="px-4 py-2 text-left">Nature juridique</th>
                            <th className="px-4 py-2 text-left">Bénéficiaire</th>
                            <th className="px-4 py-2 text-right">Montant versé</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBySearch.map((s, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2 text-center hidden sm:table-cell">{index + 1}</td>
                                <td className="px-4 py-2">{s.nature_juridique_du_beneficiaire ?? "-"}</td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <a
                                        href={`https://www.google.com/search?q=${s.nature_juridique_du_beneficiaire}+${s.nom_organisme_beneficiaire}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-600 hover:text-green-800"
                                        >
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
                                        <span title={`${s.nom_organisme_beneficiaire}`}>
                                            {s.nom_organisme_beneficiaire.length > 50
                                            ? s.nom_organisme_beneficiaire.slice(0, 50) + "..."
                                            : s.nom_organisme_beneficiaire}
                                        </span>
                                        {groupBySiret ? " ("+s.lignes.length+")" : ""}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {s.montant_verse?.toLocaleString("fr-FR", {
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
