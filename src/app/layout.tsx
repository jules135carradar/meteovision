import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MétéoVision — Prévisions consolidées de 5+ sources",
  description:
    "Application météo agrégée : température, vent, pluie issus de 5 sources indépendantes. Synthèse IA Claude, mode professionnel (viticulteur, BTP, transport…).",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-white hover:text-sky-300 transition-colors">
              <span>🌤️</span>
              <span>MétéoVision</span>
            </Link>
            <Link
              href="/reputation"
              className="text-sky-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Réputation des sources</span>
            </Link>
          </div>
        </nav>

        <main className="pt-14 sm:pt-16">
          {children}
        </main>

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-sky-400 text-xs px-4">
          <p>Open-Meteo (ECMWF, GFS, ICON) · Yr.no · wttr.in</p>
          <p className="mt-1 text-sky-500">Synthèse IA Claude · Anthropic</p>
          <p className="mt-1 text-sky-600">Les prévisions sont indicatives.</p>
        </footer>
      </body>
    </html>
  );
}
