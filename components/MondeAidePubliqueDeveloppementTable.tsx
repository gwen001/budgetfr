import { AidePubliqueDeveloppement } from "@/lib/supabase";

type Props = {
    data: AidePubliqueDeveloppement[];
    selectedCategory: string | null;
    onResetCategory: () => void;
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    groupBy: boolean;
    onToggleGroupBy: () => void;
};

export default function MondeAidePubliqueDeveloppementTable({ data, selectedCategory, onResetCategory, searchTerm, onSearchTermChange, groupBy, onToggleGroupBy }: Props) {
    // Filtrer par catégorie
    const filtered = selectedCategory
        ? data.filter(
            (s) =>
            s.region === selectedCategory
        )
        : data;

    let rows: any[] = [];

    if (groupBy) {
        // mode groupé par NOM DE PAYS
        const grouped = filtered.reduce((acc, s) => {
            const key = s.pays_beneficiaire || "Non renseigné";

            if (!acc[key]) {
                acc[key] = {
                    pays_beneficiaire: s.pays_beneficiaire || "Non renseigné",
                    pays_beneficiaire_iso: s.pays_beneficiaire_iso || "Non renseigné",
                    region: s.region || "Non renseigné",
                    sous_region: s.sous_region || "Non renseigné",
                    description: s.description || "Non renseigné",
                    secteur: s.secteur || "Non renseigné",
                    montant: 0,
                    lignes: [],
                };
            }

            acc[key].montant += s.montant || 0;
            acc[key].lignes.push(s);

            return acc;
        }, {} as Record<string, any>);

        rows = Object.values(grouped);
    } else {
        // mode non groupé : on affiche directement les aides filtrées
        rows = filtered;
    }

    const sorted = Object.values(rows).sort(
        (a, b) => b.montant - a.montant
    );

    const filteredBySearch = sorted.filter((s) =>
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const total = filteredBySearch.reduce((sum, s) => sum + s.montant, 0);

    const totalCount = data.length;
    const displayedCount = filteredBySearch.length;

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-1 lg:flex items-center gap-x-20">
                    <div className="flex justify-between items-center">
                        {/* Titre */}
                        <h2 className="text-m lg:text-xl font-semibold mb-2 lg:mb-0">
                            Détails des aides
                        </h2>

                        {/* Compteur */}
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700 ms-2">
                                ({displayedCount}/{totalCount})
                            </span>
                        </div>

                        {/* Checkbox regroupement */}
                        <label className="flex items-center gap-1 cursor-pointer select-none ms-4">
                            <input
                                type="checkbox"
                                checked={groupBy}
                                onChange={onToggleGroupBy}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">
                                regrouper par pays
                            </span>
                        </label>
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
                            <th className="px-4 py-2 text-center">#</th>
                            <th className="px-4 py-2 text-left">Pays bénéficiaire</th>
                            <th className="px-4 py-2 text-left hidden md:block">Secteur</th>
                            {/* <th className="px-4 py-2 text-left">Région</th> */}
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right">Montant voté</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredBySearch.map((s, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2 text-center">{index + 1}</td>
                                <td className="px-4 py-2">
                                    {s.pays_beneficiaire}
                                    {groupBy ? " ("+s.lignes.length+")" : ""}
                                </td>
                                <td className="px-4 py-2 hidden md:block">
                                    {groupBy ? (
                                            "-"
                                    ) : (
                                        <span title={`${s.secteur}`}>
                                            {s.secteur}
                                        </span>
                                    )}
                                </td>
                                {/* <td className="px-4 py-2">{s.region ?? "-"}</td> */}
                                <td className="px-4 py-2">
                                    {groupBy ? (
                                            "-"
                                    ) : (
                                        <span title={`${s.description}`}>
                                            {s.description && s.description.length > 70
                                            ? s.description.slice(0, 70) + "..."
                                            : s.description}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {s.montant?.toLocaleString("fr-FR", {
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
