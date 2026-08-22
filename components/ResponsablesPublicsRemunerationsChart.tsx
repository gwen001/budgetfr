import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ResponsableRemunerationCompute } from "@/lib/supabase";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    data: ResponsableRemunerationCompute[];
    onSliceClick: (fonctionNom: string | null) => void;
    selectedFonction: string | null;
};

const COLORS = [
    "#DD0000",
    "#FF6600",
    "#FFCC00",
    "#EEEE00",
    "#99FF00",
    "#00FFFF",
    "#0066FF",
    "#CC00CC",
    "#DDDDDD",
];

function capitalizeWords(str: string | null | undefined) {
    if( !str || !str.length ) {
        return "";
    }
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
}

export default function ResponsablesPublicsRemunerationsChart({data, onSliceClick, selectedFonction, }: Props) {
    const agg = useMemo(() => {
        const map = new Map();

        data.forEach((row) => {
            if (!row.fonctionId) return;

            const existing = map.get(row.fonctionId);
            if (!existing) {
                map.set(row.fonctionId, {
                    fonctionId: row.fonctionId,
                    fonctionNom: row.fonctionNom,
                    totalRemuneration: row.montant,
                });
            } else {
                existing.totalRemuneration += row.montant;
            }
        });

        return Array.from(map.values());
    }, [data]);

    const sorted = Object.values(agg).sort(
        // (a, b) => b.totalRemuneration - a.totalRemuneration
        (a, b) => a.fonctionId - b.fonctionId
    );

    const chartData = useMemo(
        () => ({
        labels: sorted.map((d) => d.fonctionNom),
        datasets: [
            {
                data: sorted.map((d) => d.totalRemuneration),
                backgroundColor: sorted.map((_, i) => COLORS[i % COLORS.length]),
                borderColor: "#ffffff",
                borderWidth: 2,
            },
        ],
        }),
        [sorted]
    );


    const totalAll = sorted.reduce((sum, s) => sum + (s.totalRemuneration || 0), 0)

     const options = {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => {
                        const value = ctx.raw || 0;
                        const percent = ((value / totalAll) * 100).toFixed(1);
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
            if (!elements?.length) {
                onSliceClick(null);
                return;
            }
            const idx = elements[0].index;
            const fonction = sorted[idx];
            onSliceClick(fonction.fonctionNom);
        },
    };

    return (
        <div className="bg-white rounded-xl shadow p-2 sm:p-8">
            <h2 className="text-center lg:text-left text-xl font-semibold mb-4">
                Rémunération des responsables publics par fonction
            </h2>

            <div className="flex flex-col lg:flex-row gap-6 border-0 items-center lg:items-start lg:justify-center">
                <div className="w-2/3 lg:w-1/2 border-0">
                    <Pie data={chartData} options={options} />
                </div>
                <div className="w-full lg:w-1/3 text-xs justify-center border-0 grid grid-cols-2 lg:grid-cols-1">
                    {sorted.map((d, i) => {
                        const color = COLORS[i % COLORS.length];
                        const isSelected = selectedFonction === d.fonctionNom;

                        return (
                            <div
                                key={d.fonctionId}
                                className={
                                    "flex items-center justify-between gap-2 cursor-pointer p-1 rounded " +
                                    (selectedFonction === d.fonctionNom
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100")
                                }
                                onClick={() => onSliceClick(isSelected ? null : d.fonctionNom)}
                                >
                                <div className="flex items-center gap-2"> {/* Pastille couleur */}
                                    <span
                                    className="inline-block w-3 h-3 rounded mb-5 lg:mb-0"
                                    style={{ backgroundColor: color }}
                                    />
                                    <div className="flex flex-col lg:flex-row gap-1">
                                        <span className="p-0 m-0 border-0 text-xs">
                                            <strong>{d.fonctionNom}</strong> :{" "}
                                        </span>
                                        <span className="p-0 m-0 border-0">
                                            {d.totalRemuneration.toLocaleString("fr-FR")} eur{" "}
                                            {/* <span className="text-gray-600">({item.percent} %)</span> */}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
