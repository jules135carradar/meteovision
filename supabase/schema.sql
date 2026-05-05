-- ============================================================
-- Météo Agrégée — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table des votes utilisateurs
CREATE TABLE IF NOT EXISTS votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ville       VARCHAR(100) NOT NULL,
  date        DATE NOT NULL,
  vote        VARCHAR(20) NOT NULL CHECK (vote IN ('oui', 'partiellement', 'non')),
  metier      VARCHAR(50) DEFAULT 'grand_public',
  ip_hash     VARCHAR(64),
  source      VARCHAR(50) DEFAULT 'aggregated',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la vérification anti-spam (1 vote / IP / ville / jour)
CREATE INDEX IF NOT EXISTS votes_antispam_idx
  ON votes (ip_hash, ville, date);

-- Index pour les statistiques par ville/date
CREATE INDEX IF NOT EXISTS votes_ville_date_idx
  ON votes (ville, date);


-- Table des scores de réputation par source
CREATE TABLE IF NOT EXISTS reputations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source        VARCHAR(50) UNIQUE NOT NULL,
  score         DECIMAL(5,2) DEFAULT 50.00 CHECK (score >= 0 AND score <= 100),
  nb_votes      INTEGER DEFAULT 0,
  nb_correct    INTEGER DEFAULT 0,
  nb_partial    INTEGER DEFAULT 0,
  nb_incorrect  INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Initialisation des sources avec score neutre (50/100)
INSERT INTO reputations (source, score) VALUES
  ('open-meteo-ecmwf', 50),
  ('open-meteo-gfs',   50),
  ('open-meteo-icon',  50),
  ('yr-no',            50),
  ('wttr-in',          50),
  ('openweathermap',   50),
  ('weatherapi',       50),
  ('tomorrow-io',      50),
  ('visual-crossing',  50),
  ('accuweather',      50),
  ('pirate-weather',   50),
  ('meteofrance',      50)
ON CONFLICT (source) DO NOTHING;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reputations_updated_at
  BEFORE UPDATE ON reputations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- Row Level Security (RLS) — recommandé pour la production
-- ============================================================

-- Activer RLS sur les tables
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputations ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique des réputations
CREATE POLICY "reputations_read_public"
  ON reputations FOR SELECT
  USING (true);

-- Politique : lecture publique des statistiques de votes (sans IP)
CREATE POLICY "votes_read_public"
  ON votes FOR SELECT
  USING (true);

-- Note : Les écritures (INSERT, UPDATE) se font via la clé service_role
-- côté serveur Next.js, jamais depuis le navigateur.
