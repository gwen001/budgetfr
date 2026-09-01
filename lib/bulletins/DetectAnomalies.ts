// lib/analysis/detectAnomalies.ts
import { BulletinAnalysis } from "./BulletinSchema";

export function DetectAnomalies(b: BulletinAnalysis) {
  const anomalies: BulletinAnalysis["anomalies"] = [];

  // --- Cohérence brut/net ---
  if (b.montants.net_a_payer > b.montants.brut) {
    anomalies.push({
      type: "coherence_brut_net",
      description: "Le net à payer est supérieur au brut.",
      gravite: "critical",
    });
  }

  if (b.montants.net_imposable > b.montants.brut) {
    anomalies.push({
      type: "coherence_brut_net",
      description: "Le net imposable est supérieur au brut.",
      gravite: "warning",
    });
  }

  // --- Cohérence heures / taux ---
  if (b.montants.heures_travaillees > 0 && b.montants.taux_horaire > 0) {
    const expectedBrut = b.montants.heures_travaillees * b.montants.taux_horaire;
    const diff = Math.abs(expectedBrut - b.montants.brut);
    const diffPct = diff / b.montants.brut;

    if (diffPct > 0.20) {
      anomalies.push({
        type: "coherence_heures_taux",
        description: "Écart > 20% entre brut et heures × taux.",
        gravite: "critical",
      });
    } else if (diffPct > 0.10) {
      anomalies.push({
        type: "coherence_heures_taux",
        description: "Écart > 10% entre brut et heures × taux.",
        gravite: "warning",
      });
    }
  }

  // --- Cotisations ---
  for (const c of b.cotisations) {
    if (c.base > b.montants.brut) {
      anomalies.push({
        type: "cotisation_base_incoherente",
        description: `Base de cotisation supérieure au brut (${c.intitule}).`,
        gravite: "warning",
      });
    }

    if (c.taux > 0.5) {
      anomalies.push({
        type: "cotisation_taux_eleve",
        description: `Taux de cotisation > 50% (${c.intitule}).`,
        gravite: "warning",
      });
    }

    if (c.montant_salarial + c.montant_patronal > b.montants.brut) {
      anomalies.push({
        type: "cotisation_montant_excessif",
        description: `Montant total de cotisation supérieur au brut (${c.intitule}).`,
        gravite: "critical",
      });
    }
  }

  // --- Primes ---
  for (const p of b.primes) {
    if (p.montant > b.montants.brut) {
      anomalies.push({
        type: "prime_excessive",
        description: `Prime supérieure au brut (${p.intitule}).`,
        gravite: "warning",
      });
    }
    if (p.montant < 0) {
      anomalies.push({
        type: "prime_negative",
        description: `Prime négative (${p.intitule}).`,
        gravite: "critical",
      });
    }
  }

  // --- Retenues ---
  for (const r of b.retenues) {
    if (r.montant > b.montants.brut) {
      anomalies.push({
        type: "retenue_excessive",
        description: `Retenue supérieure au brut (${r.intitule}).`,
        gravite: "warning",
      });
    }
    if (r.montant < 0) {
      anomalies.push({
        type: "retenue_negative",
        description: `Retenue négative (${r.intitule}).`,
        gravite: "critical",
      });
    }
  }

  // --- Règles SYNTEC ---
  const SMIC_2026 = 11.65;

  if (b.montants.taux_horaire < SMIC_2026) {
    anomalies.push({
      type: "taux_horaire_smic",
      description: "Taux horaire inférieur au SMIC.",
      gravite: "critical",
    });
  }

  if (b.montants.heures_travaillees < 140 || b.montants.heures_travaillees > 200) {
    anomalies.push({
      type: "heures_incoherentes",
      description: "Nombre d'heures incohérent pour un mois complet.",
      gravite: "warning",
    });
  }

  return anomalies;
}
