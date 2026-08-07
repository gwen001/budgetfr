import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
    title: "Subventions associations",
    description: "Statistiques des subventions votées",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
        <body className="min-h-screen">
            <div className="max-w-6xl mx-auto py-8">
                {children}
            </div>
        </body>
        </html>
    );
}
