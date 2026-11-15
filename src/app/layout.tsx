import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/contexts/LocaleContext";

export const metadata: Metadata = {
  title: "Observatoire de l'Erosion des Sols - Kabare",
  description:
    "Plateforme de cartographie des pertes en terres et aide à la décision agro-environnementale pour le territoire de Kabare (Sud-Kivu, RDC).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full bg-slate-950">
      <body className="h-full antialiased overflow-hidden text-slate-100 flex flex-col">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
