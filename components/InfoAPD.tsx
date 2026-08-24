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
                <p className="mb-6">
                    Données extraites de <a href="https://data.aide-developpement.gouv.fr/pages/accueil/#" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">data.aide-developpement.gouv.fr</a>.
                </p>
                <p className="mb-6">
                    L'APD a pour but de favoriser le développement économique et l'amélioration du niveau de vie des pays en développement, en assurant un accès équitable aux ressources et aux services de base.
                </p>
                <p className="mb-6">
                    Les données sont collectées et traitées annuellement par la Direction Générale du Trésor, avec le concours du Ministère de l'Europe et des Affaires Etrangères, dans le cadre de la déclaration auprès du Comité d'Aide au développement (CAD) de l'OCDE.
                </p>
                <p className="mb-6">
                    La mention "Multilatéral" signifie que l'aide n'est pas versée directement à un pays, mais à une organisation internationale, qui elle-même redistribue ensuite les fonds vers plusieurs pays.
                </p>
                <p className="mb-6 text-red-600">
                    Aucune donnée n'a été altérée. Toutes les données sont retranscrites telles quelles, y compris les régions.
                </p>
                <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded hover:cursor-pointer hover:bg-gray-800">
                    Fermer
                </button>
            </div>
        </div>
    );
}
