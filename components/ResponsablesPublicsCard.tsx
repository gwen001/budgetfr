import { ResponsablePublic } from "@/lib/supabase";
import ResponsablesPublicsChart from "@/components/ResponsablesPublicsChart";

function capitalizeWords(str: string) {
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
}

export function buildPhotoFilename(nom: string, prenom: string): string {
  const sanitize = (str: string) =>
    str
      .normalize("NFD")                 // enlève les accents
      .replace(/[\u0300-\u036f]/g, "")  // supprime les diacritiques
      .replace(/[^a-zA-Z]/g, "-")       // remplace tout ce qui n'est pas A-Z par '-'
      .replace(/-+/g, "-")              // évite les '----'
      .replace(/^-|-$/g, "")            // enlève les '-' au début/fin
      .toLowerCase();

  const nomClean = sanitize(nom);
  const prenomClean = sanitize(prenom);

  return `${nomClean}-${prenomClean}.jpg`;
}

export default function ResponsablesPublicsCard({ responsable, isFirst }) {
    const age =
        new Date().getFullYear() -
        new Date(responsable.date_naissance).getFullYear();
    const photoName = buildPhotoFilename(responsable.nom, responsable.prenom);

    const Couronne = () => (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="#fbbf24"   // jaune/orange Tailwind amber-400
        className="w-7 h-7"
        >
        <path d="M5 20h14l-1-9-4 3-3-6-3 6-4-3-1 9z" />
        </svg>
    );

    return (
        <div className="relative flex gap-0 border border-gray-300 p-0 rounded-lg shadow-sm bg-sky-50 max-w-md w-full">
            {/* <img
                src={`${responsable.civilite}` == "mme" ? "/img/woman.png" : "/img/man.png"}
                alt={`${responsable.prenom} ${responsable.nom}`}
                className="pt-0 w-35 object-cover rounded-l-md"
            /> */}
            <img
                src={`/img/responsables-publics/${photoName}`}
                alt={`${responsable.prenom} ${responsable.nom}`}
                className="pt-0 w-35 object-cover rounded-l-md"
            />
            <div className="flex flex-col justify-between flex-1 pl-2 pt-2 pr-1">
                    <div className="">
                        <h3 className="text-lg font-semibold leading-tight mb-1">
                            {capitalizeWords(responsable.civilite)}{""} {capitalizeWords(responsable.nom)}{""} {capitalizeWords(responsable.prenom)}{""}
                        </h3>
                        {/* <p className="text-gray-600 text-sm">Âge : {age} ans</p> */}
                        {isFirst && (
                        <div className="absolute top-0 right-2">
                            <Couronne />
                        </div>
                        )}
                    </div>

                    <div className="w-70">
                        <ResponsablesPublicsChart declarations={responsable.declarations} />
                    </div>
                </div>
        </div>
    );
}
