import { MetadataRoute } from "next";

const VILLES = [
  { slug: "paris",        lat: 48.8566,  lon: 2.3522   },
  { slug: "marseille",    lat: 43.2965,  lon: 5.3698   },
  { slug: "lyon",         lat: 45.7640,  lon: 4.8357   },
  { slug: "toulouse",     lat: 43.6047,  lon: 1.4442   },
  { slug: "nice",         lat: 43.7102,  lon: 7.2620   },
  { slug: "nantes",       lat: 47.2184,  lon: -1.5536  },
  { slug: "montpellier",  lat: 43.6119,  lon: 3.8772   },
  { slug: "strasbourg",   lat: 48.5734,  lon: 7.7521   },
  { slug: "bordeaux",     lat: 44.8378,  lon: -0.5792  },
  { slug: "lille",        lat: 50.6292,  lon: 3.0573   },
  { slug: "rennes",       lat: 48.1147,  lon: -1.6794  },
  { slug: "reims",        lat: 49.2583,  lon: 4.0317   },
  { slug: "grenoble",     lat: 45.1885,  lon: 5.7245   },
  { slug: "dijon",        lat: 47.3220,  lon: 5.0415   },
  { slug: "angers",       lat: 47.4784,  lon: -0.5632  },
  { slug: "nimes",        lat: 43.8367,  lon: 4.3601   },
  { slug: "aix-en-provence", lat: 43.5297, lon: 5.4474 },
  { slug: "brest",        lat: 48.3905,  lon: -4.4860  },
  { slug: "tours",        lat: 47.3941,  lon: 0.6848   },
  { slug: "amiens",       lat: 49.8942,  lon: 2.2957   },
  { slug: "limoges",      lat: 45.8315,  lon: 1.2578   },
  { slug: "clermont-ferrand", lat: 45.7772, lon: 3.0870 },
  { slug: "villeurbanne", lat: 45.7676,  lon: 4.8796   },
  { slug: "besancon",     lat: 47.2378,  lon: 6.0241   },
  { slug: "metz",         lat: 49.1193,  lon: 6.1727   },
  { slug: "perpignan",    lat: 42.6986,  lon: 2.8954   },
  { slug: "caen",         lat: 49.1829,  lon: -0.3707  },
  { slug: "pau",          lat: 43.2951,  lon: -0.3708  },
  { slug: "bayonne",      lat: 43.4833,  lon: -1.4833  },
  { slug: "avignon",      lat: 43.9493,  lon: 4.8055   },
  { slug: "colmar",       lat: 48.0793,  lon: 7.3585   },
  { slug: "poitiers",     lat: 46.5802,  lon: 0.3404   },
  { slug: "la-rochelle",  lat: 46.1591,  lon: -1.1520  },
  { slug: "annecy",       lat: 45.8992,  lon: 6.1294   },
  { slug: "chamonix",     lat: 45.9237,  lon: 6.8694   },
  { slug: "biarritz",     lat: 43.4832,  lon: -1.5586  },
  { slug: "cannes",       lat: 43.5528,  lon: 7.0174   },
  { slug: "saint-etienne",lat: 45.4347,  lon: 4.3900   },
  { slug: "le-havre",     lat: 49.4938,  lon: 0.1079   },
  { slug: "toulon",       lat: 43.1242,  lon: 5.9280   },
  { slug: "rouen",        lat: 49.4432,  lon: 1.0993   },
  { slug: "mulhouse",     lat: 47.7508,  lon: 7.3359   },
  { slug: "nancy",        lat: 48.6921,  lon: 6.1844   },
  { slug: "quimper",      lat: 47.9960,  lon: -4.1003  },
  { slug: "lorient",      lat: 47.7485,  lon: -3.3599  },
  { slug: "ajaccio",      lat: 41.9267,  lon: 8.7369   },
  { slug: "bastia",       lat: 42.7031,  lon: 9.4504   },
  // Grandes régions viticoles
  { slug: "epernay",      lat: 49.0400,  lon: 3.9600   },
  { slug: "beaune",       lat: 47.0250,  lon: 4.8400   },
  { slug: "cognac",       lat: 45.6961,  lon: -0.3292  },
  { slug: "chablis",      lat: 47.8139,  lon: 3.7958   },
];

const BASE = "https://meteovision.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/carte`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/reputation`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/feedback`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const ville_pages: MetadataRoute.Sitemap = VILLES.map(({ slug, lat, lon }) => ({
    url: `${BASE}/ville/${slug}?lat=${lat}&lon=${lon}&city=${encodeURIComponent(slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.9,
  }));

  return [...static_pages, ...ville_pages];
}
