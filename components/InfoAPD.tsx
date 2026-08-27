"use client";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function InfoAPD({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full text-sm md:text-base text-gray-700"
            onClick={(e) => e.stopPropagation()}   // clic dans la popup = ne pas fermer
            >
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">Aide Publique au Développement.</h2>
                <p className="mb-4">
                    Données extraites de <a href="https://data.aide-developpement.gouv.fr/pages/accueil/#" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">data.aide-developpement.gouv.fr</a>.
                    <br />Les données sont collectées et traitées annuellement par la Direction Générale du Trésor, avec le concours du Ministère de l'Europe et des Affaires Etrangères, dans le cadre de la déclaration auprès du Comité d'Aide au développement de l'<a href="https://www.oecd.org/fr.html" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Organisation de Coopération et de Développement Economiques</a>.
                </p>
                <p className="mb-4">
                    L'APD a pour but de favoriser le développement économique et l'amélioration du niveau de vie des pays en développement, en assurant un accès équitable aux ressources et aux services de base.
                </p>
                <p className="mb-4">
                    La mention "<b>Multilatéral</b>" signifie que l'aide n'est pas versée directement à un pays, mais à une organisation internationale, qui elle-même redistribue ensuite les fonds vers plusieurs pays.
                </p>
                <p className="">
                    <b>Le filtre structuré</b> exclut les éléments qui ne correspondent pas à de l'aide réellement transférée vers les pays bénéficiaires mais plutôt des coûts internes, des ajustements comptables, ou des flux non-APD :
                </p>
                <ul className="list-disc pl-4 mb-4">
                    <li>Allégements de dette.</li>
                    <li>Dépenses internes : bourses, formations, étudiants, personnel, frais administratifs...</li>
                    <li>Prise en charge des réfugiés et demandeurs d'asile.</li>
                    <li>Transferts internes et dépenses non liées à des projets.</li>
                    <li>Apports divers, instruments du secteur privé, non-apports...</li>
                </ul>
                <p className="mb-4 text-red-600">
                    Aucune donnée n'a été altérée. Toutes les données sont retranscrites telles quelles.
                </p>
                <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded hover:cursor-pointer hover:bg-gray-800">
                    Fermer
                </button>
            </div>
        </div>
    );
}
