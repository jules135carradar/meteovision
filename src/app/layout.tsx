import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MétéoVision — Prévisions consolidées de 5+ sources",
  description: "Application météo agrégée : 5 sources indépendantes, synthèse IA Claude, mode professionnel.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen text-slate-800">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-slate-800 hover:text-sky-500 transition-colors">
              <span>🌤️</span>
              <span>MétéoVision</span>
            </Link>
            <Link
              href="/reputation"
              className="text-slate-500 hover:text-sky-500 text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Réputation des sources</span>
            </Link>
          </div>
        </nav>

        <main className="pt-14 relative z-10">
          {children}
        </main>

        <footer className="mt-12 border-t border-slate-100 py-6 text-center text-slate-400 text-xs px-4">
          <p>Open-Meteo (ECMWF, GFS, ICON) · Yr.no · wttr.in</p>
          <p className="mt-1">Synthèse IA Claude · Anthropic — Sources citées conformément à leurs CGU</p>
          <p className="mt-1 text-slate-300">Les prévisions sont indicatives.</p>
        </footer>
      </body>
    </html>
  );
}
