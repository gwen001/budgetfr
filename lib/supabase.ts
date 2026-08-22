import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export type SubventionVotee = {
    id: number;
    numero_de_dossier: string | null;
    annee_budgetaire: number | null;
    collectivite: string | null;
    nom_beneficiaire: string | null;
    numero_siret: string | null;
    objet_du_dossier: string | null;
    montant_vote: number | null;
    direction: string | null;
    nature_de_la_subvention: string | null;
    secteurs_d_activites_definies_par_l_association: string | null;
};

export type SubventionVersee = {
    id: number;
    publication: number | null;
    collectivite: string | null;
    categorie_du_beneficiaire: string | null;
    nature_juridique_du_beneficiaire: string | null;
    nom_organisme_beneficiaire: string | null;
    montant_de_la_subvention: number | null;
    prestations_en_nature: number | null;
    montant_verse: number | null;
};

export type ResponsableDeclaration = {
  id: number;
  responsable_public: number;
  employeur: string;
  description: string;
  annee: number;
  montant: number;
  categorie: string;
};

export type ResponsablePublic = {
  id: number;
  civilite: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  photo: string;
  declarations: ResponsableDeclaration[];
};

export type ResponsableRemuneration = {
    id: number;
    responsable_public: number;
    employeur: string | null;
    description: string | null;
    annee: number;
    montant: number;
    dto: string;
    fonction: {
        id: number;
        nom: string;
    } | null;
    responsable: {
        id: number;
        civilite: string;
        nom: string;
        prenom: string;
        photo: string | null;
    };
};

export type ResponsableRemunerationCompute = {
    responsableId: number;
    civilite: string;
    nom: string;
    prenom: string;
    photo: string | null;
    employeur: string | null;
    description: string | null;
    montant: number;
    annee: number;
    fonctionId: number | null;
    fonctionNom: string;
    textCNP: string;
    textED: string;
};

