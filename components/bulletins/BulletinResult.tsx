// components/bulletin/BulletinView.tsx
import { Section } from "./Section";
import { AnomalyBadge } from "./AnomalyBadge";

type Cotisation = {
    intitule: string;
    base: number;
    taux: number;
    montant_salarial: number;
    montant_patronal: number;
    // ajoute les autres champs si nécessaires
};

export function BulletinResult({ bulletin }: { bulletin: any }) {
    if (!bulletin) {
        return <div>Chargement...</div>;
    }

    const parsed = typeof bulletin === "string" ? JSON.parse(bulletin) : bulletin

    const cotisations = parsed.cotisations || [];
    const cotisationsSalarie = cotisations
        .filter((c: Cotisation) => c.montant_salarial > 0)
        .sort((a:Cotisation, b:Cotisation) => {
            if (a.intitule.startsWith("Total des cotisations")) return 1;
            if (b.intitule.startsWith("Total des cotisations")) return -1;
            return a.intitule.localeCompare(b.intitule);
        });
    const totalCotisationsSalarie = Math.round(
        cotisationsSalarie.reduce((acc: number, c: Cotisation) => acc + c.montant_salarial, 0) * 100
    ) / 100;
    const cotisationsEmployeur = cotisations
        .filter((c: Cotisation) => c.montant_patronal > 0)
        .sort((a:Cotisation, b:Cotisation) => {
            if (a.intitule.startsWith("Total des cotisations")) return 1;
            if (b.intitule.startsWith("Total des cotisations")) return -1;
            return a.intitule.localeCompare(b.intitule);
        });
    const totalCotisationsEmployeur = Math.round(
        cotisationsEmployeur.reduce((acc: number, c: Cotisation) => acc + c.montant_patronal, 0) * 100
    ) / 100;

    return (
        <div className="space-y-10">
            {/* Résumé */}
            <Section title="Résumé" help="">
                <p className="text-gray-700">{parsed.resume}</p>

            </Section>

            {/* Employé */}
            <Section title="Salarié">
                <ul className="space-y-1">
                <li><strong>Nom :</strong> {parsed.employe.nom}</li>
                <li><strong>Prénom :</strong> {parsed.employe.prenom}</li>
                <li><strong>Poste :</strong> {parsed.employe.poste}</li>
                <li><strong>Matricule :</strong> {parsed.employe.matricule}</li>
                <li><strong>Convention :</strong> {parsed.employe.convention_collective}</li>
                </ul>
            </Section>

            {/* Employeur */}
            <Section title="Employeur" help="">
                <ul className="space-y-1">
                <li><strong>Raison sociale :</strong> {parsed.employeur.raison_sociale}</li>
                <li>
                    <p className="flex items-center gap-1">
                        <strong>SIRET :</strong> {parsed.employeur.siret}
                        {/* Icône lien externe */}
                        <a
                            href={`https://annuaire-entreprises.data.gouv.fr/entreprise/aaa-${parsed.employeur.siret?.slice(0,9)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 -mt-1"
                        >
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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
                    </p>
                </li>
                <li><strong>Adresse :</strong> {parsed.employeur.adresse}</li>
                </ul>
            </Section>

            {/* Montants */}
            <Section title="Montants"
                help="Les montants présentent les valeurs clés du bulletin :
                    le salaire brut avant déductions,
                    le net imposable utilisé pour le calcul du prélèvement à la source,
                    et le net à payer correspondant à la somme réellement versée."
            >
                <ul className="space-y-1">
                <li className="text-blue-500"><strong>Brut :</strong> {parsed.montants.brut} €</li>
                <li className="text-red-500"><strong>Net imposable :</strong> {parsed.montants.net_imposable} €</li>
                <li className="text-green-500"><strong>Net à payer :</strong> {parsed.montants.net_a_payer} €</li>
                <li><strong>Heures travaillées :</strong> {parsed.montants.heures_travaillees}</li>
                <li><strong>Taux horaire :</strong> {parsed.montants.taux_horaire} €</li>
                </ul>
            </Section>

            {/* Primes */}
            <Section title="Primes"
                help="Les primes regroupent les compléments de rémunération versés en plus du salaire brut, comme les avantages, remboursements ou gratifications ponctuelles."
            >
                {parsed.primes.length === 0 ? (
                <p className="text-gray-500">Aucune prime</p>
                ) : (
                <ul className="space-y-2">
                    {parsed.primes.map((p: any, i: number) => (
                    <li key={i}>
                        <strong>{p.intitule} :</strong> <span className="">{p.montant} €</span>
                    </li>
                    ))}
                    <li><strong>Total primes :</strong> <span className="text-green-500">{parsed.total_primes.montant} €</span></li>
                </ul>
                )}
            </Section>

            {/* Retenues */}
            <Section title="Retenues"
                help="Les retenues regroupent les montants déduits du salaire brut, comme les cotisations salariales, le prélèvement à la source ou les participations aux avantages."
            >
                {parsed.retenues.length === 0 ? (
                <p className="text-gray-500">Aucune retenue</p>
                ) : (
                <ul className="space-y-2">
                    {parsed.retenues.map((r: any, i: number) => (
                    <li key={i}>
                        <strong>{r.intitule} :</strong> <span className="">{r.montant} €</span>
                    </li>
                    ))}
                    <li><strong>Total retenues :</strong> <span className="text-red-500">{parsed.total_retenues.montant} €</span></li>
                </ul>
                )}
            </Section>

            {/* Cotisations */}
            <Section title="Cotisations employeur"
                help="Les cotisations employeur regroupent l’ensemble des charges patronales versées par l’entreprise pour financer la protection sociale et les contributions obligatoires."
            >
                {cotisationsEmployeur.length === 0 ? (
                <p className="text-gray-500">Aucune cotisation</p>
                ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">Intitulé</th>
                            <th className="text-right">Base</th>
                            <th className="text-right">Taux</th>
                            <th className="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotisationsEmployeur.map((c: any, i: number) => (
                            <tr key={i} className={c.intitule == "Total des cotisations et contributions" ? "border-b border-black text-red-500" : "border-b"}>
                                <td className="py-2">{c.intitule == "Total des cotisations et contributions" ? "Total des cotisations patronales" : c.intitule}</td>
                                <td className="text-right">{c.base == "0" ? "-" : c.base}</td>
                                <td className="text-right">{c.taux == "0" ? "-" : c.taux}</td>
                                <td className="text-right">{c.montant_patronal}</td>
                            </tr>
                        ))}
                        <tr className="border-b border-black text-red-500">
                            <td className="py-2 text-right" colSpan={3}>Total des cotisations patronales</td>
                            <td className="text-right">{totalCotisationsEmployeur}</td>
                        </tr>
                    </tbody>
                </table>
                )}
            </Section>

            {/* Cotisations */}
            <Section title="Cotisations salarié"
                help="Les cotisations salarié correspondent aux prélèvements effectués sur le salaire brut pour financer la protection sociale, les assurances obligatoires et le prélèvement à la source."
            >
                {cotisationsSalarie.length === 0 ? (
                <p className="text-gray-500">Aucune cotisation</p>
                ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">Intitulé</th>
                            <th className="text-right">Base</th>
                            <th className="text-right">Taux</th>
                            <th className="text-right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cotisationsSalarie.map((c: any, i: number) => (
                            <tr key={i} className={c.intitule == "Total des cotisations et contributions" ? "border-b border-black text-red-500" : "border-b"}>
                                <td className="py-2">{c.intitule == "Total des cotisations et contributions" ? "Total des cotisations salariales" : c.intitule}</td>
                                <td className="text-right">{c.base == "0" ? "-" : c.base}</td>
                                <td className="text-right">{c.taux == "0" ? "-" : c.taux}</td>
                                <td className="text-right">{c.montant_salarial}</td>
                            </tr>
                        ))}
                        <tr className="border-b border-black text-red-500">
                            <td className="py-2 text-right" colSpan={3}>Total des cotisations salariales</td>
                            <td className="text-right">{totalCotisationsSalarie}</td>
                        </tr>
                    </tbody>
                </table>
                )}
            </Section>

            {/* Anomalies */}
            <Section title="Anomalies détectées"
                help=""
            >
                {parsed.anomalies.length === 0 ? (
                <p className="text-green-600">Aucune anomalie détectée</p>
                ) : (
                <ul className="space-y-3">
                    {parsed.anomalies.map((a: any, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                        <AnomalyBadge gravite={a.gravite} />
                        <div>
                        <strong>{a.type}</strong>
                        <p className="text-gray-700">{a.description}</p>
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </Section>

            {/* Debug JSON */}
            <Section title="JSON complet (debug)">
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(bulletin, null, 2)}
                </pre>
            </Section>
        </div>
    );
}
