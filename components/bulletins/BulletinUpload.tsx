"use client";

import { useState } from "react";
import Loader from "@/components/LoaderLight";
import { CheckIcon } from "@/components/bulletins/CheckIcon";
import { MiniLoader } from "@/components/bulletins/MiniLoader";

export default function BulletinUpload() {
    const [loadingUpload, setloadingUpload] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingAnalyze, setLoadingAnalyze] = useState(false);
    const [bulletinId, setBulletinId] = useState<string | null>(null);
    const [analyzeMessage, setAnalyzeMessage] = useState<string | null>(null);
    const [analysisDone, setAnalysisDone] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [lastStep, setLastStep] = useState(-1);
    const [stepsDone, setStepsDone] = useState<number[]>([]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset affichage
        setFileName(null);
        setFileContent(null);
        setErrorMessage(null);
        setAnalyzeMessage(null);
        setAnalysisDone(false);
        setBulletinId(null);
        setCurrentStep(-1);
        setLastStep(-1);
        setStepsDone([]);

        // Loader ON
        setloadingUpload(true);

        const formData = new FormData();
        formData.append("file", file);

        // Appel API
        const res = await fetch("/api/bulletins", {
            method: "POST",
            body: formData,
        });

        const json = await res.json();

        // Loader OFF
        setloadingUpload(false);

        // Erreur API → afficher message d’erreur
        if (!res.ok) {
            setErrorMessage(json.error || "Erreur lors de l'upload.");
            return;
        }

        // Succès API → lire le fichier localement
        setBulletinId(json.bulletin.id);
        setFileName(file.name);

        const text = await file.text();
        setFileContent(text);
    };

    const stepLabels = [
        "Extraction des données du salarié",
        "Extraction des données de l'employeur",
        "Extraction des montants",
        "Extraction des cotisations",
        "Recherche d'anomalies",
    ];

    const handleAnalyze = async () => {
        if (!bulletinId) return;

        setAnalysisDone(false);
        setLoadingAnalyze(true);
        setAnalyzeMessage(null);
        setErrorMessage(null);
        setCurrentStep(-1);
        setStepsDone([]);

        const stepNumbers = Object.keys(stepLabels).map(Number);
        setLastStep( stepNumbers.length-1 );

        stepNumbers.forEach((step, index) => {
            setTimeout(() => {
                setCurrentStep(step);

                // Après un petit délai, on valide l’étape
                setTimeout(() => {
                    setStepsDone(prev => [...prev, step]);
                }, 900);
            }, index * 1500); // chaque étape apparaît toutes les 1.5s
        });

        const res = await fetch("/api/bulletins/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bulletinId }),
        });

        const json = await res.json();

        setLoadingAnalyze(false);
        setAnalysisDone(true);

        if (!res.ok) {
            setErrorMessage(json.error || "Erreur lors de l'analyse.");
            return;
        }

        setAnalyzeMessage("Analyse terminée avec succès.");
        // plus tard : tu pourras afficher json.analysis, json.summary, etc.
    };

    return (
        <div className="p-0">
            <div className="bg-white rounded-xl shadow p-2 sm:p-8">
                <label className="block">
                    <span className="font-medium">Importez un bulletin de salaire (<span className="italiccc">format PDF</span>) :</span>
                </label>

                <div className="flex gap-4">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleUpload}
                        className="mt-2 block w-1/2 text-sm rounded border-1 p-2 bg-gray-100 border-gray-400"
                    />
                    {loadingUpload && <Loader />}
                </div>
            </div>

            {/* Affiché si succès */}
            {fileName && (
                <div className="mt-6 p-3 bg-green-50 text-green-700 rounded border border-green-500">
                    <p><span className="font-semibold">Fichier importé :</span> <span className="italiccc">{fileName}</span></p>

                    {loadingAnalyze ? (
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={!bulletinId || loadingAnalyze}
                                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-blue-500 text-white disabled:bg-gray-400"
                            >
                                Analyse en cours...
                            </button>
                            {/* <Loader /> */}
                        </div>
                    ) : analysisDone && bulletinId ? (
                            <a
                                href={`/bulletins/${bulletinId}`}
                                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-orange-500 text-white hover:bg-orange-600"
                            >
                                Voir le résultat de l'analyse
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={!bulletinId || loadingAnalyze}
                                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-blue-500 text-white disabled:bg-gray-400"
                            >
                                Lancer l'analyse du bulletin
                            </button>
                    )}

                    {/* {analyzeMessage && (
                        <p className="mt-3 text-sm text-red-600 mt-2">{analyzeMessage}</p>
                    )} */}
                </div>
            )}

            <div className="mt-4 space-y-3 text-sm">
                {Object.entries(stepLabels).map(([stepNumber, label]) => {
                    const step = Number(stepNumber);

                    // Étape affichée seulement si elle est en cours ou terminée
                    if (step > currentStep) return null;

                    const isDone = stepsDone.includes(step);

                    return (
                        <div key={step} className="mt-0 mb-2 flex items-center gap-2">
                            {!isDone || (step == currentStep && currentStep == lastStep && !analysisDone) ? (
                                <MiniLoader />
                            ) : (
                                <CheckIcon />
                            )}
                            <span>{label}</span>
                        </div>
                    );
                })}

                {/* Message final */}
                {analysisDone && bulletinId && (
                    <div className="flex items-center gap-2">
                        <CheckIcon />
                        <span>Analyse terminée !</span>
                    </div>
                )}
            </div>

            {/* Lien vers la page d’analyse */}
            {/* {analysisDone && bulletinId && (
                <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckIcon />
                        <span>Analyse terminée avec succès !</span>
                    </div>
                </div>
            )} */}

            {/* Affichage erreur */}
            {errorMessage && (
                <div className="mt-6 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                    {errorMessage}
                    {/* Une erreur est survenue. */}
                </div>
            )}

            {/* Contenu affiché uniquement si succès */}
            {/* {fileContent && (
            <div className="mt-6 p-3 bg-gray-100 rounded border border-gray-400">
                <pre className="text-sm whitespace-pre-wrap">{fileContent}</pre>
            </div>
            )} */}
        </div>
    );
}
