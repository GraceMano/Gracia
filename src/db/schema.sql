-- Schema pour les observations et discussions publiques sur le territoire de Kabare
-- Compatible PostgreSQL / Neon Serverless (Vercel)

CREATE TABLE IF NOT EXISTS zone_observations (
  id VARCHAR(64) PRIMARY KEY,
  zone_id INTEGER NOT NULL,
  author_name VARCHAR(128) NOT NULL,
  author_role VARCHAR(64) NOT NULL,
  finding_type VARCHAR(64) NOT NULL,
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par zone géographique
CREATE INDEX IF NOT EXISTS idx_zone_observations_zone_id ON zone_observations(zone_id);

-- Données initiales représentatives (seed)
INSERT INTO zone_observations (id, zone_id, author_name, author_role, finding_type, comment, timestamp)
VALUES
  ('obs-1', 615, 'Justin Birindwa', 'agronomist', 'conservation_success', 'Plantation réussie de haies vives de Calliandra calothyrsus et de Vétiver sur les courbes de niveau. Forte réduction du ruissellement observée après les fortes averses d''octobre.', '2026-11-10T08:30:00Z'),
  ('obs-2', 1042, 'Dr. Pascal Murhula', 'researcher', 'gully_erosion', 'Apparition d''un ravinement actif de 1.8 mètre de profondeur en bordure de parcelle sur forte pente. Nécessité urgente d''un fascinage en bois et de fossés d''infiltration.', '2026-11-12T14:15:00Z'),
  ('obs-3', 2100, 'Anselme Bahati', 'farmer', 'general_note', 'Pratique du paillage avec tiges de maïs et fanes de haricot généralisée sur 3 hectares riverains. Meilleure humidité résiduelle du sol.', '2026-11-14T09:45:00Z')
ON CONFLICT (id) DO NOTHING;
