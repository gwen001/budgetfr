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
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">Liste des subventions aux associations votées par la ville de Paris.</h2>
                <p className="mb-6">
                    Sont considérées comme bénéficiaires de subvention les associations relevant de la loi du 1er juillet 1901 ayant déposé par exercice budgétaire une ou plusieurs demandes de subvention auprès de la ville de Paris.
                </p>
                <p className="mb-6">
                    Données extraites de <a href="https://opendata.paris.fr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Paris | DATA</a>, site officiel de la démarche Open Data de la ville de Paris.
                </p>
                <p className="mb-6 text-red-600">
                    Aucune donnée n'a été altérée. Toutes les données sont retranscrites telles quelles, y compris les secteurs d'activité.
                </p>
                <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded hover:cursor-pointer hover:bg-gray-800">
                    Fermer
                </button>
            </div>
        </div>
    );
}
