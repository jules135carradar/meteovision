import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cityName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const title = `Météo ${cityName} — Prévisions consolidées 5 sources | MétéoVision`;
  const description = `Prévisions météo pour ${cityName} agrégées depuis 5+ sources indépendantes (Météo-France, ECMWF, GFS…). Données spécialisées viticulteurs, agriculteurs, BTP, sport outdoor.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "MétéoVision",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://meteovision.vercel.app/ville/${slug}`,
    },
  };
}

export default function VilleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
