import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
    title: "Subventions aux associations",
    description: "Statistiques des subventions votées par la ville de Paris",
    keywords: [
        "data",
        "visualisation",
        "subventions",
        "associations",
        "Paris",
        "social",
        "environnement",
        "culture",
        "éducation",
        "santé",
    ],
    authors: [{ name: "Gwendal Le Coguic" }],
    openGraph: {
        title: "Subventions aux associations",
        description: "Statistiques des subventions votées par la ville de Paris",
        url: "https://www.budgetfr.info/",
        siteName: "Subventions explorer",
        locale: "fr_FR",
        type: "website",
        images: [{
            url: "https://www.budgetfr.info/img/preview.png",
            width: 1500,
            height: 920,
            alt: "Subventions aux associations",
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Subventions aux associations",
        description: "Statistiques des subventions votées par la ville de Paris",
        site: "https://www.budgetfr.info/",
        images: ["https://www.budgetfr.info/img/preview.png"],
        creator: "@gwendallecoguic",
    },
    robots: {
        index: true,
        follow: true,
    },
};

import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({ children }: { children: ReactNode }) {
    const enableAnalytics = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
    return (
        <html lang="fr">
            <body className="min-h-screen">
                <div className="max-w-6xl mx-auto py-8">
                    {children}
                </div>
                {enableAnalytics && <Analytics />}
            </body>
        </html>
    );
}
