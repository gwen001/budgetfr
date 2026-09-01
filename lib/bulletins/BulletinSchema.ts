import { z } from "zod";

/**
 * Normalise une valeur numérique potentiellement renvoyée en string par Claude :
 * - "3000"        -> 3000
 * - "3 000,50"    -> 3000.5
 * - "3000,50 €"   -> 3000.5
 * - "3000 €"      -> 3000
 */
const numberFromString = z.preprocess((val) => {
  if (typeof val === "string") {
    return Number(
      val
        .replace(/\s/g, "")
        .replace("€", "")
        .replace(",", ".")
        .trim()
    );
  }
  return val;
}, z.number().default(0));

export const BulletinSchema = z.object({
    employe: z.object({
        nom: z.string().default(""),
        prenom: z.string().default(""),
        poste: z.string().default(""),
        matricule: z.string().default(""),
        convention_collective: z.string().default(""),
    }),

    employeur: z.object({
        raison_sociale: z.string().default(""),
        siret: z.string().default(""),
        adresse: z.string().default(""),
    }),

    periode: z.object({
        mois: z.string().default(""),
        annee: z.string().default(""),
        date_paiement: z.string().default(""),
    }),

    montants: z.object({
        brut: numberFromString,
        net_imposable: numberFromString,
        net_a_payer: numberFromString,
        heures_travaillees: numberFromString,
        taux_horaire: numberFromString,
    }),

    primes: z
        .array(
            z.object({
            intitule: z.string().default(""),
            montant: numberFromString,
            })
        )
        .default([]),

    total_primes: z
        .object({
            montant: numberFromString,
        })
        .default({ montant: 0 }),

    retenues: z
        .array(
            z.object({
            intitule: z.string().default(""),
            montant: numberFromString,
            })
        )
        .default([]),

    total_retenues: z
        .object({
            montant: numberFromString,
        })
        .default({ montant: 0 }),

//   retenues: z
//     .array(
//       z.object({
//         intitule: z.string().default(""),
//         montant: numberFromString,
//       })
//     )
//     .default([]),

    cotisations: z
        .array(
        z.object({
            intitule: z.string().default(""),
            base: numberFromString,
            taux: numberFromString,
            montant_salarial: numberFromString,
            montant_patronal: numberFromString,
        })
        )
        .default([]),

    anomalies: z
        .array(
        z.object({
            type: z.string().default(""),
            description: z.string().default(""),
            gravite: z.enum(["info", "warning", "critical"]).default("info"),
        })
        )
        .default([]),

    resume: z.string().default(""),
});

export type BulletinAnalysis = z.infer<typeof BulletinSchema>;
