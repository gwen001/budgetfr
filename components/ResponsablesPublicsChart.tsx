"use client";

import { Bar } from "react-chartjs-2";
import { ResponsableDeclaration } from "@/lib/supabase";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from "chart.js";

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


export default function ResponsablesPublicsChart({ declarations }: { declarations: ResponsableDeclaration[]}) {
    const lastYears = [2020, 2021, 2022, 2023, 2024, 2025];

      // Palette de couleurs pour chaque rémunération
    const STACK_COLORS = [
                    // "#DD0000",
                    // "#FF3300",
                    // "#FF6600",
                    // "#FF9900",
                    // "#FFCC00",
                    // "#EEEE00",
                    // "#CCFF00",
                    // "#99FF00",
                    // "#00FF99",
                    // "#00FFCC",
                    // "#00FFFF",
                    // "#00CCFF",
                    // "#0099FF",
                    // "#0066FF",
                    // "#0000FF",
                    // "#3300CC",
                    // "#6600CC",
                    // "#9900CC",
                    // "#CC00CC",
                    // "#FF00CC",
                    // "#FF33CC",
                    // "#FF66CC",
                    // "#FF99CC",
                    // "#FFCCFF",

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

    // const byYear = lastYears.map((year) =>
    //   declarations.filter((d) => d.annee === year)
    // );

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

    function externalTooltipHandler(context) {
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
        // if (tooltip.body) {
        //     const titleLines = tooltip.title || [];
        //     const bodyLines = tooltip.body.map(b => b.lines).flat();

        //     tooltipEl.innerHTML = `
        //       <div class="font-semibold mb-1">
        //         ${titleLines.join("<br>")}
        //       </div>
        //       <div>
        //         ${bodyLines.join("<br>")}
        //       </div>
        //     `;
        // }
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


    const options = {
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
          external: externalTooltipHandler,
          callbacks: {
            // Titre : l'année complète
            title: function (context) {
              const year = this.chart.data.labels[context[0].dataIndex];
              const chart = context[0].chart;
              const index = context[0].dataIndex;

              const total = chart.data.datasets.reduce((sum, ds) => {
                return sum + (ds.data[index] || 0);
              }, 0);

              return `Rémunérations ${year}: ${formatAmount(total)} €`;
            },
            // Labels groupés : toutes les rémunérations de l'année
            label: function (context) {
              const ds = context.dataset;
              const rawLabel = ds.metaLabels[context.dataIndex];
              const label = truncateLabel(rawLabel, 70);
              const value = context.raw;

              if (!value) return null;

              return `${label}: ${value.toLocaleString("fr-FR")} €`;
            },
            // label: function (context) {
            //   const ds = context.dataset;
            //   const rawLabel = ds.metaLabels[context.dataIndex];
            //   const label = truncateLabel(rawLabel, 70);
            //   const value = context.raw;

            //   if (!value) return null;

            //   return `${label}: ${value.toLocaleString("fr-FR")} €`;
            // },

            // 🔥🔥🔥 C’est CE callback qui désactive le formateur interne
            labelTextColor: function() {
              return "#fff"; // n'importe quelle couleur
            },

            // Footer : total annuel
            footer: function (context) {
              return;
              const chart = context[0].chart;
              const index = context[0].dataIndex;

              const total = chart.data.datasets.reduce((sum, ds) => {
                return sum + (ds.data[index] || 0);
              }, 0);

              return `Total: ${formatAmount(total)} €`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            display: true, // masque les années
            // callback: (value, index, ticks) => {
            //   const chart = ticks[index].chart;
            //   const label = chart.data.labels[index];
            //   return label.toString().slice(-2); // 2024 -> 24
            // },
            callback: function (value, index) {
              const label = this.chart.data.labels[index];
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
            callback: (value) => formatK(Number(value)),
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
