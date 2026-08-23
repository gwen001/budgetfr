import { ResponsableRemunerationCompute } from "@/lib/supabase";

type Props = {
    data: ResponsableRemunerationCompute[];
    selectedFonction: string | null;
    onResetFonction: () => void;
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    groupByName: boolean;
    onToggleGroupByName: () => void;
};

function capitalizeWords(str: string | null | undefined) {
    if( !str || !str.length ) {
        return "";
    }
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
}

export default function FranceRemunerationsResponsablesPublicsTable({ data, selectedFonction, onResetFonction, searchTerm, onSearchTermChange, groupByName, onToggleGroupByName }: Props) {
    const filtered = selectedFonction
        ? data.filter(
            (s) =>
            s.fonctionNom === selectedFonction
        )
        : data;

    let rows: any[] = [];

    if (groupByName) {
        // mode groupé par NOM
        const grouped = filtered.reduce((acc, s) => {
            const key = s.textCNP || "Non renseigné";

            if (!acc[key]) {
                acc[key] = {
                    responsableId: s.responsableId,
                    civilite: s.civilite,
                    nom: s.nom,
                    prenom: s.prenom,
                    photo: s.photo,
                    employeur: s.employeur,
                    description: s.description,
                    montant: 0,
                    annee: s.annee,
                    fonctionId: s.fonctionId,
                    fonctionNom: s.fonctionNom,
                    textCNP: s.textCNP,
                    textED: s.textED,
                    lignes: [],
                };
            }

            acc[key].montant += s.montant || 0;
            acc[key].lignes.push(s);

            return acc;
        }, {} as Record<string, any>);

        rows = Object.values(grouped);
    } else {
        // mode non groupé : on affiche directement les subventions filtrées
        rows = filtered;
    }

    const sorted = Object.values(rows).sort(
        (a, b) => b.montant - a.montant
    );

    const filteredBySearch = sorted.filter((s) =>
        s.textCNP.toLowerCase().includes( searchTerm.toLowerCase() ) || s.textED.toLowerCase().includes( searchTerm.toLowerCase() )
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
                            Détails des rémunérations
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
                                checked={groupByName}
                                onChange={onToggleGroupByName}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">
                                regrouper par nom
                            </span>
                        </label>
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

                    {/* Filtre secteur d'activité */}
                    <div className="border-0">
                        {selectedFonction && (
                            <span className="text-sm text-gray-600 flex items-center">
                            fonction: <strong className="ml-1">{selectedFonction}</strong>

                            {/* Bouton reset */}
                            <button
                                onClick={onResetFonction}
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
                            <th className="px-4 py-2 text-left">Fonction</th>
                            <th className="px-4 py-2 text-left">Responsable public</th>
                            <th className="px-4 py-2 text-left">Employeur / description</th>
                            <th className="px-4 py-2 text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBySearch.map((d, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2 text-center hidden sm:table-cell">{index + 1}</td>
                                <td className="px-4 py-2">
                                    {groupByName ? "-" : d.fonctionNom}
                                    {/* {d.fonctionNom} */}
                                </td>
                                <td className="px-4 py-2">
                                    <a
                                    href={`https://www.google.com/search?q=${d.nom}+${d.prenom}`}
                                    target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"
                                    >
                                        {capitalizeWords(d.civilite)}{""} {capitalizeWords(d.nom)}{""} {capitalizeWords(d.prenom)}{""}
                                    </a>
                                    {groupByName ? " ("+d.lignes.length+")" : ""}
                                </td>
                                <td className="px-4 py-2">
                                    <span title={`${d.employeur} / ${d.description}`}>
                                        {groupByName ? (
                                            "-"
                                        ) : (
                                            d.employeur ? (
                                                // d.employeur
                                                d.employeur.length > 50
                                                ? d.employeur.slice(0,50) + "..."
                                                : d.employeur
                                            ) : (
                                                ""
                                            )
                                        )}
                                        {/* {!groupByName && d.employeur && d.description ? <br /> : ""} */}
                                        {!groupByName && d.employeur && d.description ? " / " : ""}
                                        {/* <br /> */}
                                        {groupByName ? (
                                            ""
                                        ) : (
                                            d.description ? (
                                                // d.description
                                                d.description.length > 50
                                                ? d.description.slice(0,50) + "..."
                                                : d.description
                                            ) : (
                                                ""
                                            )
                                        )}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {d.montant?.toLocaleString("fr-FR", {
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
