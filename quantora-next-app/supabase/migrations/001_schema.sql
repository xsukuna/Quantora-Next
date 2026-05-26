-- ============================================================
-- QUANTORA-NEXT — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT        UNIQUE NOT NULL,
  name        TEXT        NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'CONTRIBUTOR',
  reputation  INTEGER     NOT NULL DEFAULT 10,
  badge       TEXT        NOT NULL DEFAULT 'Fellow Contributor',
  avatar_url  TEXT,
  bio         TEXT,
  institution TEXT,
  country     TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || floor(random()*9000+1000)::text)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PAPERS
-- ============================================================
CREATE TABLE IF NOT EXISTS papers (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  abstract        TEXT        NOT NULL,
  category        TEXT        NOT NULL,
  author_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution     TEXT        NOT NULL,
  country         TEXT        NOT NULL DEFAULT 'India',
  tags            TEXT        NOT NULL DEFAULT '',
  references_text TEXT,
  file_url        TEXT        NOT NULL,
  file_name       TEXT        NOT NULL,
  file_size       TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'PENDING',
  citations       INTEGER     NOT NULL DEFAULT 0,
  downloads       INTEGER     NOT NULL DEFAULT 0,
  likes           INTEGER     NOT NULL DEFAULT 0,
  peer_reviewed   BOOLEAN     NOT NULL DEFAULT FALSE,
  ai_summary      TEXT,
  ai_keywords     TEXT,
  trust_label     TEXT        NOT NULL DEFAULT 'INDEPENDENT_SUBMISSION',
  forked_from_id  UUID        REFERENCES papers(id),
  search_vector   TSVECTOR,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS papers_search_idx ON papers USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS papers_author_idx ON papers(author_id);
CREATE INDEX IF NOT EXISTS papers_status_idx ON papers(status);
CREATE INDEX IF NOT EXISTS papers_category_idx ON papers(category);

-- Auto-update tsvector
CREATE OR REPLACE FUNCTION papers_tsvector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.abstract, '') || ' ' ||
    COALESCE(NEW.tags, '') || ' ' ||
    COALESCE(NEW.institution, '')
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS papers_tsvector_trigger ON papers;
CREATE TRIGGER papers_tsvector_trigger
  BEFORE INSERT OR UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION papers_tsvector_update();

-- ============================================================
-- PAPER VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS paper_versions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id   UUID        NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  version    TEXT        NOT NULL DEFAULT '1.0.0',
  summary    TEXT        NOT NULL,
  author     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id   UUID        NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text       TEXT        NOT NULL,
  reputation INTEGER     NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_paper_idx ON comments(paper_id);

-- ============================================================
-- INSIGHTS (short-form research posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS insights (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT        NOT NULL,
  tags           TEXT        NOT NULL DEFAULT '',
  category       TEXT        NOT NULL DEFAULT 'General',
  upvotes_count  INTEGER     NOT NULL DEFAULT 0,
  comments_count INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS insights_author_idx ON insights(author_id);
CREATE INDEX IF NOT EXISTS insights_created_idx ON insights(created_at DESC);

-- ============================================================
-- INSIGHT UPVOTES (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS insight_upvotes (
  insight_id UUID        NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (insight_id, user_id)
);

-- Auto-sync upvote counter
CREATE OR REPLACE FUNCTION sync_insight_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE insights SET upvotes_count = upvotes_count + 1 WHERE id = NEW.insight_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE insights SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.insight_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insight_upvotes_counter ON insight_upvotes;
CREATE TRIGGER insight_upvotes_counter
  AFTER INSERT OR DELETE ON insight_upvotes
  FOR EACH ROW EXECUTE FUNCTION sync_insight_upvotes();

-- ============================================================
-- R&D CHALLENGES
-- ============================================================
CREATE TABLE IF NOT EXISTS rnd_challenges (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  sponsor         TEXT        NOT NULL,
  logo_url        TEXT,
  description     TEXT        NOT NULL,
  details         TEXT        NOT NULL DEFAULT '',
  reward          TEXT        NOT NULL,
  rep_award       INTEGER     NOT NULL DEFAULT 100,
  category        TEXT        NOT NULL,
  difficulty      TEXT        NOT NULL DEFAULT 'Expert',
  deadline        TIMESTAMPTZ,
  teams_count     INTEGER     NOT NULL DEFAULT 0,
  solutions_count INTEGER     NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- R&D PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS rnd_participants (
  challenge_id UUID        NOT NULL REFERENCES rnd_challenges(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (challenge_id, user_id)
);

-- Auto-sync participants counter
CREATE OR REPLACE FUNCTION sync_rnd_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rnd_challenges SET teams_count = teams_count + 1 WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rnd_challenges SET teams_count = GREATEST(teams_count - 1, 0) WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rnd_participants_counter ON rnd_participants;
CREATE TRIGGER rnd_participants_counter
  AFTER INSERT OR DELETE ON rnd_participants
  FOR EACH ROW EXECUTE FUNCTION sync_rnd_participants();

-- ============================================================
-- R&D SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS rnd_submissions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID        NOT NULL REFERENCES rnd_challenges(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  file_url     TEXT,
  status       TEXT        NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED: Initial R&D Challenges
-- ============================================================
INSERT INTO rnd_challenges (title, sponsor, description, details, reward, rep_award, category, difficulty, teams_count)
VALUES
  (
    'Agricultural Credit Leakage Analysis',
    'NABARD',
    'Develop analytical spatial tracking metrics to analyze out-of-pocket health costs leaking from rural agricultural accounts in New Delhi.',
    'Build spatial data pipelines that correlate agricultural credit disbursement with rural health expenditure patterns across 50+ districts. Must use open government datasets.',
    'Fellowship Position',
    500,
    'Public Policy',
    'Expert',
    12
  ),
  (
    'High-Frequency Order Book Graph Transformers',
    'QUANTORA LABS',
    'Build deep order book transformers parsing order flow imbalances under volatile regimes for sovereign multi-agent grids.',
    'Implement a spatial-temporal graph neural network that processes Level 2 order book data at microsecond resolution. Must outperform LSTM baseline by 15% Sharpe.',
    '$10,000 Grant',
    1000,
    'Quant Strategy',
    'Expert',
    8
  ),
  (
    'Climate Risk Pricing Model for Indian Insurance Markets',
    'IRDAI Research',
    'Create actuarial models incorporating satellite-derived climate risk indices into retail insurance premium calculations.',
    'Use ESG satellite data and historical claims to build a stochastic risk pricing model. Validated against real claims data from 3 public insurers.',
    '₹8,00,000 + Publication',
    750,
    'Climate Finance',
    'Advanced',
    5
  )
ON CONFLICT DO NOTHING;
