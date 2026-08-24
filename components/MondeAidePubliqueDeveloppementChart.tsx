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
import { AidePubliqueDeveloppement } from "@/lib/supabase";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    data: AidePubliqueDeveloppement[];
    selectedCategory: string | null;
    onCategoryClick: (category: string | null) => void;
    countByCategory: Record<string, number>;
};

export default function MondeAidePubliqueDeveloppementChart({ data, selectedCategory, onCategoryClick, countByCategory }: Props) {
    const [hiddenSlices, setHiddenSlices] = useState<string[]>([]);

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow w-full h-64 flex items-center justify-center text-gray-500">
                Données indisponibles
            </div>
        );
    }

    // // Agrégation des montants par catégorie
    // const byCategory = data.reduce<Record<string, number>>((acc, s) => {
    //     const key = s.region || "Non spécifié";
    //     acc[key] = (acc[key] || 0) + (s.montant || 0);
    //     return acc;
    // }, {});

    // // Tri DESC par montant
    // const sorted = Object.entries(byCategory)
    //     .sort((a, b) => b[1] - a[1]);

    const COLORS = {
        "Afrique, régional":            "#DD0000",
        "Afrique du Nord":              "#FF3300",
        "Afrique sub-saharienne":       "#FF6600",
        "Amériques":                    "#0000FF",
        "Amériques, régional":          "#0099FF",
        "Amérique du Nord et centrale": "#00CCFF",
        "Asie, régional":               "#00c86B",
        "Asie du Sud et centrale":      "#CCFF00",
        "Europe":                       "#EEEE00",
        "Extrême-Orient":               "#FFCC00",
        "Moyen-Orient":                 "#FF9900",
        "Océanie":                      "#FF99CC",
        "Multilatéral":                 "#CC00CC",
        "Non spécifié":                 "#DDDDDD",
    };

    // 1. Ordre imposé
    const REGION_ORDER = Object.keys(COLORS) as (keyof typeof COLORS)[];

    // 2. Montants par région
    const amountsByRegion = data.reduce<Record<string, number>>((acc, item) => {
        const region = item.region || "Non spécifié";
        const montant = item.montant || 0;

        acc[region] = (acc[region] || 0) + montant;
        return acc;
    }, {});

    // 3. Filtrer les régions dont le montant > 0
    const FILTERED_REGIONS = REGION_ORDER.filter(
    (region) => (amountsByRegion[region] || 0) > 0
    );

    // 4. Dataset dans l’ordre filtré
    const labels = FILTERED_REGIONS;

    const values = FILTERED_REGIONS.map((region) => amountsByRegion[region]);

    const backgroundColor = FILTERED_REGIONS.map((region) => COLORS[region]);

    // const REGION_ORDER = Object.keys(COLORS);

    // const amountsByRegion = data.reduce((acc, item) => {
    //     const region = item.region || "Non spécifié";
    //     const montant = item.montant || 0;
    //     acc[region] = (acc[region] || 0) + montant;
    //     return acc;
    // }, {});

    // const labels = REGION_ORDER;

    // const values = REGION_ORDER.map((region) => {
    //     return amountsByRegion[region] || 0;
    // });

    // const backgroundColor = REGION_ORDER.map((region) => COLORS[region]);

    // const labels = sorted.map(([label]) => label);

    // const values = labels.map((label) =>
    //     data
    //         .filter(
    //         (s) =>
    //             (s.region || "Non spécifié") === label
    //         )
    //         .reduce((sum, s) => sum + (s.montant || 0), 0)
    //     );

    // total global, toutes catégories confondues
    const totalAll = values.reduce((a, b) => a + b, 0);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor,
            },
        ],
    };

    // const chartData = {
    //     labels,
    //     datasets: [
    //         {
    //             data: values,
    //             borderColor: "#ffffff",
    //             borderWidth: 2,
    //             backgroundColor: [
    //                 "#DD0000",
    //                 "#FF3300",
    //                 "#FF6600",
    //                 "#FF9900",
    //                 "#FFCC00",
    //                 "#EEEE00",
    //                 "#CCFF00",
    //                 "#99FF00",
    //                 "#00FF99",
    //                 "#00FFCC",
    //                 "#00FFFF",
    //                 "#00CCFF",
    //                 "#0099FF",
    //                 "#0066FF",
    //                 "#0000FF",
    //                 "#3300CC",
    //                 "#6600CC",
    //                 "#9900CC",
    //                 "#CC00CC",
    //                 "#FF00CC",
    //                 "#FF33CC",
    //                 "#FF66CC",
    //                 "#FF99CC",
    //                 "#FFCCFF",
    //             ],
    //         },
    //     ],
    // };

    // const legend = labels
    //     .map((label, index) => ({
    //         label,
    //         value: values[index], // toujours une vraie valeur
    //         color: chartData.datasets[0].backgroundColor[index],
    //         hidden: hiddenSlices.includes(label),
    //         percent: ((values[index] / totalAll) * 100).toFixed(1),
    //     }))
    //     .sort((a, b) => b.value - a.value);

    const legend = FILTERED_REGIONS.map((region) => ({
        label: region,
        value: amountsByRegion[region] || 0,
        color: COLORS[region],
    }));//.sort((a, b) => b.value - a.value);

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
                        // const percent = ((value / totalAll) * 100).toFixed(1);
                        const label = item.label || "Non renseigné";                        // const label = label || "Non renseigné";
                        const count = countByCategory[label] || 0;
                        // return `${item.label}`;
                        return `${item.label} - ${count} aides`;
                    },
                    label: function (context: TooltipItem<"pie">) {
                        const value = context.raw as number;
                        // const total = context.chart._metasets[0].total;
                        const percent = ((value / totalAll) * 100).toFixed(1);
                        // const label = context.label || "Non renseigné";                        // const label = label || "Non renseigné";
                        // const count = countByCategory[label] || 0;
                        return (
                            " " +
                            value.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) +
                            " eur " +
                            `- ${percent}%`
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

    return (
        <div className="bg-white rounded-xl shadow p-2 sm:p-8">
            <h2 className="text-center lg:text-left text-xl font-semibold mb-4">
                Répartition des aides par région
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 border-0 items-center lg:items-start lg:justify-center">
                <div className="w-2/3 lg:w-1/2 border-0">
                    <Pie data={chartData} options={options} />
                </div>
                <div className="w-full lg:w-1/3 text-xs justify-center border-0 grid grid-cols-2 lg:grid-cols-1">
                    {legend.map((item,index) => (
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
                                <div className="flex items-center gap-2"> {/* Pastille couleur */}
                                    <span
                                    className="inline-block w-3 h-3 rounded mb-5 lg:mb-0"
                                    style={{ backgroundColor: item.color }}
                                    ></span>
                                    <div className="flex flex-col lg:flex-row gap-1">
                                        <span className="p-0 m-0 border-0 text-xs">
                                            <strong>{item.label}</strong> :{" "}
                                        </span>
                                        <span className="p-0 m-0 border-0">
                                            {item.value.toLocaleString("fr-FR")} eur{" "}
                                            {/* <span className="text-gray-600">({item.percent} %)</span> */}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
