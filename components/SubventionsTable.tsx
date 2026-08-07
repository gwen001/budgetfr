import { Subvention } from "@/lib/supabase";

type Props = {
  data: Subvention[];
  selectedCategory: string | null;
  onResetCategory: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
};

export function SubventionsTable({ data, selectedCategory, onResetCategory, searchTerm, onSearchTermChange }: Props) {
  // Filtrer par catégorie
  const filtered = selectedCategory
    ? data.filter(
        (s) =>
        //   (s.secteurs_d_activites_definies_par_l_association || "Non renseigné") === selectedCategory
          s.secteurs_d_activites_definies_par_l_association === selectedCategory
      )
    : data;

    const grouped = filtered.reduce<Record<string, {
        nom_beneficiaire: string | null;
        montant_total: number;
        annee_budgetaire: number | null;
        secteurs_d_activites_definies_par_l_association: string | null;
        numero_siret: string | null;
    }>>((acc, s) => {
        const key = s.numero_siret || "-";

        if (!acc[key]) {
            acc[key] = {
                nom_beneficiaire: s.nom_beneficiaire,
                montant_total: 0,
                annee_budgetaire: s.annee_budgetaire,
                secteurs_d_activites_definies_par_l_association: s.secteurs_d_activites_definies_par_l_association,
                numero_siret: key,
            };
        }

        acc[key].montant_total += s.montant_vote || 0;

        return acc;
    }, {});

    const sorted = Object.values(grouped).sort(
        (a, b) => b.montant_total - a.montant_total
    );

    const filteredBySearch = sorted.filter((s) =>
        s.nom_beneficiaire.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // const total = sorted.reduce((sum, s) => sum + s.montant_total, 0);
    const total = filteredBySearch.reduce((sum, s) => sum + s.montant_total, 0);


    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-x-20">
                    <h2 className="text-xl font-semibold">
                        Détails des subventions <span className="text-xs font-normal italic">(regroupées par #siret)</span>
                    </h2>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            placeholder="Filtrer par bénéficiaire…"
                            className="border rounded px-3 py-1 text-sm pr-6"
                        />

                        {searchTerm.length > 0 && (
                            <button
                            onClick={() => onSearchTermChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 font-bold"
                            title="Effacer le filtre"
                            >
                            ×
                            </button>
                        )}
                    </div>
                </div>
                {selectedCategory && (
                    <span className="text-sm text-gray-600 flex items-center">
                    Secteur d'activité : <strong className="ml-1">{selectedCategory}</strong>

                    {/* Bouton reset */}
                    <button
                        onClick={onResetCategory}
                        className="ml-3 text-red-500 hover:text-red-700 font-bold text-lg"
                        title="Réinitialiser le filtre"
                    >
                        ×
                    </button>
                    </span>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-center">#</th>
                            <th className="px-4 py-2 text-left">Secteur d'activité</th>
                            <th className="px-4 py-2 text-left">Siret</th>
                            <th className="px-4 py-2 text-left">Bénéficiaire</th>
                            <th className="px-4 py-2 text-right">Montant voté</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBySearch.map((s, index) => (
                        // {sorted.map((s, index) => (
                        <tr key={s.nom_beneficiaire} className="border-b">
                            <td className="px-4 py-2 text-center">{index + 1}</td>
                            <td className="px-4 py-2">{s.secteurs_d_activites_definies_par_l_association ?? "-"}</td>
                            <td className="px-4 py-2">
                                <a href={`https://annuaire-entreprises.data.gouv.fr/entreprise/aaa-${s.numero_siret?.slice(0,9)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{s.numero_siret ?? "-"}</a>
                            </td>
                            <td className="px-4 py-2">
                                <span title={`${s.nom_beneficiaire}`}>{s.nom_beneficiaire.length > 50
                                    ? s.nom_beneficiaire.slice(0, 50) + "…"
                                    : s.nom_beneficiaire}
                                </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                                {s.montant_total?.toLocaleString("fr-FR", {
                                    style: "decimal",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                }) ?? "-"}
                            </td>
                        </tr>
                        ))}
                        <tr className="bg-gray-200 font-semibold">
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2"></td>
                            <td className="px-4 py-2 text-right text-red-500">Total:</td>
                            <td className="px-4 py-2 text-right text-red-500">
                                {total.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                    minimumFractionDigits: 0,
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
