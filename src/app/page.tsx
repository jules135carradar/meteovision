import SearchBar from "@/components/SearchBar";
import FavoritesSection from "@/components/FavoritesSection";
import Logo from "@/components/Logo";

const EXEMPLES = [
  { name: "Paris",      lat: 48.8566, lon: 2.3522  },
  { name: "Lyon",       lat: 45.7640, lon: 4.8357  },
  { name: "Bordeaux",   lat: 44.8378, lon: -0.5792 },
  { name: "Marseille",  lat: 43.2965, lon: 5.3698  },
  { name: "Strasbourg", lat: 48.5734, lon: 7.7521  },
  { name: "Reims",      lat: 49.2583, lon: 4.0317  },
];

const FEATURES = [
  {
    icon: "📡",
    title: "10 sources agrégées",
    desc: "ECMWF, GFS, Météo-France, Yr.no et plus — moyenne pondérée pour une prévision plus fiable qu'une seule source.",
  },
  {
    icon: "🤖",
    title: "Synthèse par IA",
    desc: "Claude analyse toutes les données et vous donne un résumé en langage naturel, adapté à votre métier.",
  },
  {
    icon: "⭐",
    title: "Réputation dynamique",
    desc: "Vos retours terrain ajustent le poids de chaque source. L'application s'améliore avec le temps.",
  },
];

const METIERS = [
  { icon: "🍇", label: "Viticulteur",      desc: "Gel, mildiou, ETP, indice Winkler, fenêtre de traitement" },
  { icon: "🌾", label: "Agriculteur",       desc: "Sol, humidité, semis, irrigation, cumul pluie" },
  { icon: "🌱", label: "Grandes cultures",  desc: "Gel tardif, vent, récolte, conditions terrain" },
  { icon: "🐝", label: "Apiculture",        desc: "Vol des abeilles, risque de gelée, conditions butinage" },
  { icon: "🌲", label: "Forestier",         desc: "Risque tempête, exploitation, conditions de travail" },
  { icon: "🏗️", label: "BTP",              desc: "Coulée béton, grue, conditions chantier" },
  { icon: "🏃", label: "Sport outdoor",     desc: "Confort thermique, vent, précipitations, UV" },
  { icon: "⛵", label: "Nautisme",          desc: "Vent, vagues, visibilité, conditions de navigation" },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-12 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
          Mis à jour toutes les 10 minutes
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <Logo size={40} />
          <h1 className="text-4xl sm:text-6xl font-light text-slate-800 tracking-tight">
            MétéoVision
          </h1>
        </div>

        <p className="text-slate-500 text-lg sm:text-xl font-light max-w-xl mb-2">
          La météo qui croise <strong className="text-slate-700 font-semibold">10 sources indépendantes</strong> pour vous donner la prévision la plus fiable.
        </p>
        <p className="text-slate-400 text-sm mb-8">
          Avec un mode professionnel pour viticulteurs, agriculteurs, BTP et plus.
        </p>

        {/* Search */}
        <div className="w-full max-w-xl mb-4">
          <SearchBar autoFocus />
        </div>

        <FavoritesSection />

        {/* Villes exemples */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {EXEMPLES.map((v) => (
            <a
              key={v.name}
              href={`/ville/${v.name.toLowerCase()}?lat=${v.lat}&lon=${v.lon}&city=${encodeURIComponent(v.name)}`}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 text-sm transition-all shadow-sm"
            >
              {v.name}
            </a>
          ))}
        </div>
      </section>

      {/* Pourquoi MétéoVision */}
      <section className="bg-slate-50 border-y border-slate-100 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-light text-slate-700 mb-2">
            Pourquoi MétéoVision ?
          </h2>
          <p className="text-center text-slate-400 text-sm mb-10">
            Une seule source peut se tromper. Dix sources agrégées, c'est plus difficile.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
                <span className="text-4xl block mb-4">{f.icon}</span>
                <h3 className="text-slate-700 font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mode professionnel */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-light text-slate-700 mb-2">
            Conçu pour les professionnels
          </h2>
          <p className="text-center text-slate-400 text-sm mb-10">
            Indicateurs spécialisés selon votre activité — bien au-delà de la météo grand public.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {METIERS.map((m) => (
              <div key={m.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                <span className="text-2xl block mb-2">{m.icon}</span>
                <h3 className="text-slate-700 font-semibold text-sm mb-1">{m.label}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-emerald-50 to-sky-50 border-t border-slate-100 py-14 px-4 text-center">
        <h2 className="text-2xl font-light text-slate-700 mb-3">
          Prêt à consulter la météo autrement ?
        </h2>
        <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
          Gratuit, sans compte, sans publicité. Tapez simplement le nom de votre ville.
        </p>
        <div className="w-full max-w-lg mx-auto">
          <SearchBar />
        </div>
      </section>

    </div>
  );
}
