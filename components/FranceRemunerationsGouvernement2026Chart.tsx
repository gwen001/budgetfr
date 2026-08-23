"use client";

import { Bar } from "react-chartjs-2";
import { ResponsableDeclaration } from "@/lib/supabase";
import {
    Chart as ChartJS,
    ChartOptions,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    TooltipModel,
    TooltipItem,
    ChartDataset,
    Scale,
    Tick,
} from "chart.js";

// type TickContext = {
//   chart: ChartJS;
//   index: number;
//   scale: Scale;
//   tick: any; // Chart.js ne typait pas les ticks avant v4.4
// };

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

// export function truncateLabel(label: string, max = 70): string {
//   if (label.length <= max) return label;

//   const truncated = label.slice(0, max);
//   const lastSpace = truncated.lastIndexOf(" ");

//   return truncated.slice(0, lastSpace) + "…";
// }
function truncateLabel(label: string, max = 70): string {
  if (label.length <= max) return label;
  return label.slice(0, max) + "...";
}


function formatK(value: number) {
  if (value >= 1000000) {
    const k = value / 1000000;
    // 1500 -> 1.5k, 10000 -> 10k, 10500 -> 10.5k
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}m`;
  }
  else
  if (value >= 1000) {
    const k = value / 1000;
    // 1500 -> 1.5k, 10000 -> 10k, 10500 -> 10.5k
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  } else {
    return '';
  }

  return value.toString();
}

export function formatAmount(value: number | string): string {
  // Convertir en string
  let str = String(value);

  // Nettoyage : enlever tout sauf les chiffres
  str = str.replace(/\D/g, "");

  // Si vide → retour direct
  if (!str) return "0";

  // On construit le résultat à l’envers
  let out = "";
  let count = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    out = str[i] + out;
    count++;

    // Tous les 3 chiffres → on insère un espace
    if (count === 3 && i !== 0) {
      out = " " + out;
      count = 0;
    }
  }

  return out;
}


export default function FranceRemunerationsGouvernement2026Chart({ declarations }: { declarations: ResponsableDeclaration[]}) {
    const lastYears = [2020, 2021, 2022, 2023, 2024, 2025];

      // Palette de couleurs pour chaque rémunération
    const STACK_COLORS = [
        "#EF4444",
        "#F59E0B",
        "#EEEE00",
        "#10B981",
        "#00CCFF",
        "#3B82F6",
        "#1E3A8A",
        "#8B5CF6",
        "#D946EF",
        "#FF99CC",
    ];

    const byYear = lastYears.map((year) =>
      declarations
          .filter((d) => d.annee === year)
          .sort((a, b) => b.montant - a.montant)
    );

    const maxStacks = Math.max(...byYear.map((arr) => arr.length));

    const datasets = Array.from({ length: maxStacks }, (_, stackIndex) => {
      return {
        label: `Rémunération ${stackIndex + 1}`,
        backgroundColor: STACK_COLORS[stackIndex],
        data: lastYears.map((_, yearIndex) => {
          const remuneration = byYear[yearIndex][stackIndex];
          return remuneration ? remuneration.montant : 0;
        }),
        metaLabels: lastYears.map((_, yearIndex) => {
          const r = byYear[yearIndex][stackIndex];
          if (!r) return "";
          return r.employeur?.trim()
            ? r.employeur
            : r.description?.trim()
            ? r.description
            : `Rémunération ${stackIndex + 1}`;
        }),
      };
    });

    const data = {
      labels: lastYears,
      datasets,
    };

    function externalTooltipHandler(context: { chart: ChartJS<"bar">; tooltip: TooltipModel<"bar"> }) {
        const {chart, tooltip} = context;

        // Créer l'élément si nécessaire
        let tooltipEl = document.getElementById("chartjs-tooltip");

        if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.className = "pointer-events-none bg-black text-xs text-white rounded-md shadow-lg p-2";
            tooltipEl.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            document.body.appendChild(tooltipEl);
        }

        // Si la tooltip est cachée
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
        }

        // Contenu
        if (tooltip.body) {
            const titleLines = tooltip.title || [];
            const body = tooltip.body.map(b => b.lines).flat();
            const colors = tooltip.labelColors || [];

            const rows = body.map((line, i) => {
              const color = colors[i] || colors[0];
              const boxStyle = `
                display:inline-block;
                width:10px;
                height:10px;
                margin-right:6px;
                border-radius:2px;
                background:${color.backgroundColor};
                border:1px solid ${color.borderColor};
              `;
              return `
                <div style="display:flex;align-items:center;margin-top:2px;">
                  <span style="${boxStyle}"></span>
                  <span>${line}</span>
                </div>
              `;
            }).join("");

            tooltipEl.innerHTML = `
              <div class="font-semibold mb-1">
                ${titleLines.join("<br>")}
              </div>
              ${rows}
            `;
        }

        // Positionnement relatif au canvas
        const {canvas} = chart;
        const rect = canvas.getBoundingClientRect();

        const left = rect.left + window.scrollX + tooltip.caretX;
        const top  = rect.top  + window.scrollY + tooltip.caretY;

        tooltipEl.style.opacity = "1";
        tooltipEl.style.position = "absolute";
        tooltipEl.style.left = left + "px";
        tooltipEl.style.top = top + "px";
        tooltipEl.style.zIndex = "9999";
    }

    const options: ChartOptions<"bar"> = {
        maintainAspectRatio: false,
        // devicePixelRatio: 1,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                mode: "index",
                intersect: false,
                external: (context: {
                    chart: ChartJS<"bar">;
                    tooltip: TooltipModel<"bar">;
                }): void => {
                    // ton externalTooltipHandler ici, typé "bar"
                    externalTooltipHandler(context);
                },
                callbacks: {
                    // Titre : l'année complète
                    title: (context: TooltipItem<"bar">[]): string => {
                        const chart = context[0].chart;
                        const labels = chart.data.labels ?? [];
                        const year = labels[context[0].dataIndex] as string;
                        const index = context[0].dataIndex;

                        const total = chart.data.datasets.reduce((sum, ds) => {
                            return sum + Number(ds.data[index] || 0);
                        }, 0);

                        return `Rémunérations ${year}: ${formatAmount(total)} €`;
                    },
                    // Labels groupés : toutes les rémunérations de l'année
                    label: (context: TooltipItem<"bar">): string => {
                        const ds = context.dataset as ChartDataset<"pie"> & { metaLabels?: string[] };
                        const rawLabel = ds.metaLabels?.[context.dataIndex] ?? context.label ?? "";
                        const label = truncateLabel(rawLabel, 70);
                        const value = Number(context.raw) || 0;

                        if (!value) return "";

                        return `${label}: ${value.toLocaleString("fr-FR")} €`;
                    },
                    labelTextColor: function() {
                    return "#fff"; // n'importe quelle couleur
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    display: true, // masque les années
                    callback(this: Scale, tickValue: string | number, index: number, ticks: Tick[]): string {
                        const chart = this.chart;
                        const labels = chart.data.labels ?? [];
                        const label = labels[index] as string;
                        return label.toString().slice(-2); // 2020 -> 20
                    },
                },
                grid: {
                    display: false, // enlève les lignes verticales
                },
            },
            y: {
                stacked: true,
                ticks: {
                    callback(this: Scale, tickValue: string | number, index: number, ticks: Tick[]): string {
                        const num = typeof tickValue === "number" ? tickValue : Number(tickValue) || 0;
                        return formatK(num);
                    }
                    // callback: (value: number) => formatK(Number(value)),
                },
                grid: {
                    display: true, // enlève les lignes horizontales
                },
            },
        },
    };

    return (
        <div className="mt-0">
            <Bar data={data} options={options} />
        </div>
    );
}
