import SearchBar from "@/components/SearchBar";

const EXEMPLES = [
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Lyon", lat: 45.7640, lon: 4.8357 },
  { name: "Bordeaux", lat: 44.8378, lon: -0.5792 },
  { name: "Marseille", lat: 43.2965, lon: 5.3698 },
  { name: "Strasbourg", lat: 48.5734, lon: 7.7521 },
  { name: "Reims", lat: 49.2583, lon: 4.0317 },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8">
          <span className="text-8xl">🌤️</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          Météo Agrégée
        </h1>

        <p className="text-sky-200 text-lg md:text-xl max-w-2xl mb-3">
          La météo la plus fiable — consolidée depuis{" "}
          <strong className="text-white">5 sources indépendantes</strong> et analysée par l'IA.
        </p>
        <p className="text-sky-400 text-sm mb-10 max-w-xl">
          Open-Meteo (ECMWF, GFS, ICON) · Yr.no · wttr.in — Synthèse Claude · Mode Pro disponible
        </p>

        {/* Barre de recherche */}
        <div className="w-full max-w-xl">
          <SearchBar autoFocus />
        </div>

        {/* Villes exemples */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {EXEMPLES.map((ville) => (
            <a
              key={ville.name}
              href={`/ville/${ville.name.toLowerCase()}?lat=${ville.lat}&lon=${ville.lon}&city=${encodeURIComponent(ville.name)}`}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sky-300 hover:bg-white/10 hover:text-white text-sm transition-all"
            >
              📍 {ville.name}
            </a>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-5xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-6">
        <FeatureCard
          icon="📡"
          title="5 sources agrégées"
          desc="Température, vent et précipitations calculés par moyenne pondérée selon la réputation de chaque source."
        />
        <FeatureCard
          icon="🤖"
          title="Analyse IA — Claude"
          desc="Synthèse en français de 3-4 phrases, adaptée à votre métier, avec détection des divergences critiques."
        />
        <FeatureCard
          icon="⭐"
          title="Réputation dynamique"
          desc="Les scores des sources évoluent selon vos votes terrain. L'agrégation s'améliore avec le temps."
        />
        <FeatureCard
          icon="🍇"
          title="Mode Viticulteur"
          desc="Risque gel, risque mildiou, ETP, fenêtre de traitement — indicateurs spécifiques à la viticulture."
        />
        <FeatureCard
          icon="🏗️"
          title="Mode BTP & Transport"
          desc="Seuils vent grue/échafaudage, risque verglas, brouillard — adapté aux professionnels du terrain."
        />
        <FeatureCard
          icon="🗳️"
          title="Vote communautaire"
          desc="Votre retour terrain améliore la pondération des sources pour les prochains utilisateurs."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
      <span className="text-3xl">{icon}</span>
      <h3 className="text-white font-bold mt-3 mb-2">{title}</h3>
      <p className="text-sky-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
