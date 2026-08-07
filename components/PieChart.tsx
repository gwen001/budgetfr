"use client";

import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    TooltipItem
} from "chart.js";
import { Subvention } from "@/lib/supabase";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    data: Subvention[];
    selectedCategory: string | null;
    onCategoryClick: (category: string | null) => void;
};

export function PieChart({ data, selectedCategory, onCategoryClick }: Props) {
    // Agrégation des montants par catégorie
    const byCategory = data.reduce<Record<string, number>>((acc, s) => {
        const key = s.secteurs_d_activites_definies_par_l_association || "Non renseigné";
        acc[key] = (acc[key] || 0) + (s.montant_vote || 0);
        return acc;
    }, {});

    const [hiddenSlices, setHiddenSlices] = useState<string[]>([]);

    // Tri DESC par montant_vote
    const sorted = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1]);

    const labels = sorted.map(([label]) => label);
    // const values = sorted.map(([_, value]) => value);

    // const values = labels.map((label) =>
    //     hiddenSlices.includes(label)
    //         ? null // 👈 segment masqué
    //         : data.filter(
    //             (s) =>
    //                 (s.secteurs_d_activites_definies_par_l_association || "Non renseigné") === label
    //         )
    //         .reduce((sum, s) => sum + (s.montant_vote || 0), 0)
    // );

    // const realValues = labels.map((label) =>
    //     data
    //         .filter(
    //         (s) =>
    //             (s.secteurs_d_activites_definies_par_l_association || "Non renseigné") === label
    //         )
    //         .reduce((sum, s) => sum + (s.montant_vote || 0), 0)
    //     );

    const realValues = labels.map((label) =>
        data
            .filter(
            (s) =>
                (s.secteurs_d_activites_definies_par_l_association || "Non renseigné") === label
            )
            .reduce((sum, s) => sum + (s.montant_vote || 0), 0)
        );

    // 👉 total global, toutes catégories confondues
    const totalAll = realValues.reduce((a, b) => a + b, 0);

    const values = labels.map((label) =>
        data
            .filter(
            (s) =>
                (s.secteurs_d_activites_definies_par_l_association || "Non renseigné") === label
            )
            .reduce((sum, s) => sum + (s.montant_vote || 0), 0)
        );


    // const values = labels.map((label, index) =>
    //   hiddenSlices.includes(label) ? null : realValues[index]
    // );
    // const values = labels.map((label, index) =>
    //     hiddenSlices.includes(label) ? null : realValues[index]
    // );

    // const totalVisible = values
    //     .filter((v) => v !== null)
    //     .reduce((a, b) => a + b, 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    "#DD0000",
                    "#FF3300",
                    "#FF6600",
                    "#FF9900",
                    "#FFCC00",
                    "#EEEE00",
                    "#CCFF00",
                    "#99FF00",
                    "#00FF99",
                    "#00FFCC",
                    "#00FFFF",
                    "#00CCFF",
                    "#0099FF",
                    "#0066FF",
                    "#0000FF",
                    "#3300CC",
                    "#6600CC",
                    "#9900CC",
                    "#CC00CC",
                    "#FF00CC",
                    "#FF33CC",
                    "#FF66CC",
                    "#FF99CC",
                    "#FFCCFF",

                ],
            },
        ],
    };

    const legend = labels
        .map((label, index) => ({
            label,
            value: realValues[index], // toujours une vraie valeur
            color: chartData.datasets[0].backgroundColor[index],
            hidden: hiddenSlices.includes(label),
            percent: ((realValues[index] / totalAll) * 100).toFixed(1),
        }))
        .sort((a, b) => b.value - a.value);

    // const legend = labels.map((label, index) => ({
    //     label,
    //     value: values[index],
    //     color: chartData.datasets[0].backgroundColor[index],
    // }))
    // .sort((a, b) => b.value - a.value);

    const options = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                borderColor: "white",
                borderWidth: 1,
                callbacks: {
                    title: function (context: TooltipItem<"pie">[]) {
                        const item = context[0];
                        const value = item.raw as number;
                        // const total = item.chart._metasets[0].total;
                        const percent = ((value / totalAll) * 100).toFixed(1);
                        return `${item.label}`;
                        return `${item.label} (${percent} %)`;
                    },
                    label: function (context: TooltipItem<"pie">) {
                        const value = context.raw as number;
                        // const total = context.chart._metasets[0].total;
                        const percent = ((value / totalAll) * 100).toFixed(1);
                        return (
                            " " +
                            value.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) +
                            " eur " +
                            `(${percent} %)`
                        );
                    },
                },
            },
        },

        onClick: (_: any, elements: any[]) => {
            if (!elements.length) return;
            const index = elements[0].index;
            const category = labels[index] || null;
            onCategoryClick(category);
        },
    };

    const toggleSlice = (label: string) => {
        setHiddenSlices((prev) =>
            prev.includes(label)
            ? prev.filter((l) => l !== label) // réafficher
            : [...prev, label]                // masquer
        );
    };

    const handleLegendClick = (label: string) => {
        if (selectedCategory === label) {
            onCategoryClick(null); // 👈 re-clic = reset
        } else {
            onCategoryClick(label); // 👈 sélection normale
        }
    };

    // const options = {
    //     onClick: (_: any, elements: any[]) => {
    //         if (!elements.length) return;
    //         const index = elements[0].index;
    //         const category = labels[index] || null;
    //         onCategoryClick(category);
    //     },
    // };

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
                Répartition des montants par secteur d'activité
            </h2>

            <div className="flex gap-6 items-start border-0 justify-center">
                <div className="w-1/2 border-0">
                    <Pie data={chartData} options={options} />
                </div>
                <div className="w-1/3 text-xs border-0">
                    <div className="bg-white border-0">
                        {legend.map((item) => (
                            <div
                                key={item.label}
                                className={
                                    "flex items-center justify-between gap-2 cursor-pointer p-1 rounded " +
                                    (selectedCategory === item.label
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100")
                                }
                                onClick={() => handleLegendClick(item.label)}
                                >
                                {/* Pastille couleur */}
                                <div className="flex items-center gap-2">
                                    <span
                                    className="inline-block w-3 h-3 rounded"
                                    style={{ backgroundColor: item.color }}
                                    ></span>

                                    <span>
                                    <strong>{item.label}</strong> :{" "}
                                    {item.value.toLocaleString("fr-FR")} EUR{" "}
                                    <span className="text-gray-600">({item.percent} %)</span>
                                    </span>
                                </div>

                                {/* {selectedCategory === item.label && (
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // évite de recliquer la ligne
                                        onCategoryClick(null); // reset du filtre
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold text-base"
                                    title="Réinitialiser le filtre"
                                    >×</button>
                                )} */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
