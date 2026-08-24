"use client";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function InfoHATVP({ open, onClose }: Props) {
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
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-900">Rémunérations des reponsables publics.</h2>
                <p className="mb-6">
                    Données extraites du site de la <a href="https://www.hatvp.fr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Haute Autorité pour la Transparence de la Vie Publique</a>, chargée de promouvoir la probité et l'exemplarité des responsables publics.
                </p>
                <p className="mb-6">
                    Les données fournies par HATVP sont basées sur les déclarations des responsables publics eux-mêmes.
                </p>
                <p className="mb-6 underline">
                    Les rémunérations, indemnités et gratifications perçues sont déclarées sur une base annuelle pour leur montant net, après cotisations sociales mais avant impôt.
                </p>
                <p className="mb-6">
                    Les fonctions sont estimées par notre système en suivant des règles internes basées sur la comparaison de chaines de texte, des erreurs peuvent subsister.
                </p>
                <p className="mb-0">
                    Ne sont pas intégrées:
                </p>
                <ul className="list-disc pl-4 mb-6">
                    <li className="">Les déclarations de patrimoine.</li>
                    <li className="">Les participations financières directes dans le capital d'une société.</li>
                    <li className="">Les activités professionnelles exercées par le conjoint, le partenaire lié par un pacte civil de solidarité ou le concubin.</li>
                    <li className="">Les fonctions bénévoles.</li>
                    <li className="">Les rémunérations nulles (montant=0).</li>
                </ul>
                <p className="mb-6">
                    Certaines dates de naissances ont été modifiées afin de corriger des doublons de personnes.
                </p>
                <p className="mb-6 text-red-600">
                    Aucun montant n'a été altéré. Toutes les rémunérations sont retranscrites telles quelles.
                </p>
                <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded hover:cursor-pointer hover:bg-gray-800">
                    Fermer
                </button>
            </div>
        </div>
    );
}
