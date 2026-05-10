import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import ServiceWorkerInit from "@/components/ServiceWorkerInit";
import InstallButton from "@/components/InstallButton";
import Script from "next/script";

export const metadata: Metadata = {
  title: "MétéoVision — Météo agrégée 5 sources, mode professionnel",
  description: "Prévisions météo consolidées depuis 5+ sources indépendantes (Météo-France, ECMWF, GFS, Yr.no…). Mode professionnel pour viticulteurs, agriculteurs, BTP, sport outdoor.",
  keywords: ["météo", "prévisions météo", "météo france", "météo agriculteur", "météo viticulteur", "météo BTP", "météo professionnel", "agrégateur météo"],
  authors: [{ name: "MétéoVision" }],
  openGraph: {
    title: "MétéoVision — Météo agrégée 5 sources",
    description: "Prévisions météo consolidées depuis 5+ sources indépendantes. Mode professionnel pour viticulteurs, agriculteurs, BTP, sport outdoor.",
    type: "website",
    locale: "fr_FR",
    siteName: "MétéoVision",
    url: "https://meteovision.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "MétéoVision — Météo agrégée 5 sources",
    description: "Prévisions météo consolidées depuis 5+ sources indépendantes. Mode professionnel.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "VB0F_rQMHrDzD-w8CRytm28Z96ZeobEWLB0eEpJuuqs",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-D2W60XM7K1" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-D2W60XM7K1');
        `}</Script>
      </head>
      <body className="min-h-screen text-slate-800">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg text-slate-800 hover:text-emerald-500 transition-colors">
              <Logo size={26} />
              <span>MétéoVision</span>
            </Link>
            <div className="flex items-center gap-1">
              <InstallButton />
              <Link
                href="/carte"
                className="text-slate-500 hover:text-emerald-500 text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/>
                  <line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
                <span className="hidden sm:inline">Carte</span>
              </Link>
              <Link
                href="/reputation"
                className="text-slate-500 hover:text-emerald-500 text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" opacity=".5"/>
                  <rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor" opacity=".7"/>
                  <rect x="11" y="1" width="3" height="14" rx="1" fill="currentColor"/>
                </svg>
                <span className="hidden sm:inline">Réputation</span>
              </Link>
              <Link
                href="/feedback"
                className="text-slate-500 hover:text-emerald-500 text-sm font-medium transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span className="hidden sm:inline">Avis</span>
              </Link>
            </div>
          </div>
        </nav>

        <ServiceWorkerInit />
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
