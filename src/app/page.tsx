import SearchBar from "@/components/SearchBar";

const EXEMPLES = [
  { name: "Paris",      lat: 48.8566, lon: 2.3522  },
  { name: "Lyon",       lat: 45.7640, lon: 4.8357  },
  { name: "Bordeaux",   lat: 44.8378, lon: -0.5792 },
  { name: "Marseille",  lat: 43.2965, lon: 5.3698  },
  { name: "Strasbourg", lat: 48.5734, lon: 7.7521  },
  { name: "Reims",      lat: 49.2583, lon: 4.0317  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <span className="text-5xl sm:text-7xl mb-6 block">🌤️</span>

        <h1 className="text-3xl sm:text-5xl font-light text-slate-800 mb-3 tracking-tight">
          Météo Agrégée
        </h1>
        <p className="text-slate-400 font-light text-sm mb-1">
          5 sources indépendantes · Analyse IA · Mode professionnel
        </p>
        <div className="w-12 h-px bg-sky-300 mx-auto my-5" />

        <div className="w-full max-w-lg">
          <SearchBar autoFocus />
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {EXEMPLES.map((v) => (
            <a
              key={v.name}
              href={`/ville/${v.name.toLowerCase()}?lat=${v.lat}&lon=${v.lon}&city=${encodeURIComponent(v.name)}`}
              className="px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 text-sm transition-all shadow-sm min-h-[44px] flex items-center"
            >
              {v.name}
            </a>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-4xl mx-auto px-4 pb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "📡", title: "5 sources agrégées",   desc: "Moyenne pondérée selon la réputation de chaque source. Plus fiable qu'une seule prévision." },
          { icon: "🤖", title: "Analyse IA",            desc: "Claude synthétise les données en 3-4 phrases adaptées à votre métier." },
          { icon: "⭐", title: "Réputation dynamique",  desc: "Vos votes terrain améliorent la pondération. L'app apprend avec le temps." },
          { icon: "🍇", title: "Mode Viticulteur",      desc: "Gel, mildiou, ETP, fenêtre de traitement — indicateurs terrain spécifiques." },
          { icon: "🏗️", title: "Mode Pro",              desc: "BTP, Transport, Événementiel, Nautisme — adapté à votre activité." },
          { icon: "🗳️", title: "Vote communautaire",    desc: "Un retour en 1 clic qui améliore la précision pour tous les utilisateurs." },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl">{f.icon}</span>
            <h3 className="text-slate-700 font-medium mt-3 mb-1 text-sm">{f.title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
