-- ============================================================
-- QUANTORA-NEXT — Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights          ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_upvotes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rnd_challenges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rnd_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rnd_submissions   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Profiles: public read" ON profiles;
CREATE POLICY "Profiles: public read" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles: insert own" ON profiles;
CREATE POLICY "Profiles: insert own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: update own" ON profiles;
CREATE POLICY "Profiles: update own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- PAPERS
-- ============================================================
DROP POLICY IF EXISTS "Papers: public read approved" ON papers;
CREATE POLICY "Papers: public read approved" ON papers
  FOR SELECT USING (
    status = 'APPROVED'
    OR auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Papers: authenticated insert" ON papers;
CREATE POLICY "Papers: authenticated insert" ON papers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = author_id
  );

DROP POLICY IF EXISTS "Papers: author or admin update" ON papers;
CREATE POLICY "Papers: author or admin update" ON papers
  FOR UPDATE USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Papers: author or admin delete" ON papers;
CREATE POLICY "Papers: author or admin delete" ON papers
  FOR DELETE USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================================
-- PAPER VERSIONS
-- ============================================================
DROP POLICY IF EXISTS "Versions: public read" ON paper_versions;
CREATE POLICY "Versions: public read" ON paper_versions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Versions: author insert" ON paper_versions;
CREATE POLICY "Versions: author insert" ON paper_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM papers WHERE id = paper_id AND author_id = auth.uid())
  );

-- ============================================================
-- COMMENTS
-- ============================================================
DROP POLICY IF EXISTS "Comments: public read" ON comments;
CREATE POLICY "Comments: public read" ON comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Comments: authenticated insert" ON comments;
CREATE POLICY "Comments: authenticated insert" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Comments: author delete" ON comments;
CREATE POLICY "Comments: author delete" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- INSIGHTS
-- ============================================================
DROP POLICY IF EXISTS "Insights: public read" ON insights;
CREATE POLICY "Insights: public read" ON insights
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insights: authenticated insert" ON insights;
CREATE POLICY "Insights: authenticated insert" ON insights
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Insights: author update" ON insights;
CREATE POLICY "Insights: author update" ON insights
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Insights: author or admin delete" ON insights;
CREATE POLICY "Insights: author or admin delete" ON insights
  FOR DELETE USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================================
-- INSIGHT UPVOTES
-- ============================================================
DROP POLICY IF EXISTS "Upvotes: public read" ON insight_upvotes;
CREATE POLICY "Upvotes: public read" ON insight_upvotes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Upvotes: authenticated insert" ON insight_upvotes;
CREATE POLICY "Upvotes: authenticated insert" ON insight_upvotes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Upvotes: owner delete" ON insight_upvotes;
CREATE POLICY "Upvotes: owner delete" ON insight_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- R&D CHALLENGES
-- ============================================================
DROP POLICY IF EXISTS "Challenges: public read" ON rnd_challenges;
CREATE POLICY "Challenges: public read" ON rnd_challenges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Challenges: admin all" ON rnd_challenges;
CREATE POLICY "Challenges: admin all" ON rnd_challenges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================================
-- R&D PARTICIPANTS
-- ============================================================
DROP POLICY IF EXISTS "Participants: public read" ON rnd_participants;
CREATE POLICY "Participants: public read" ON rnd_participants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants: authenticated join" ON rnd_participants;
CREATE POLICY "Participants: authenticated join" ON rnd_participants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants: owner leave" ON rnd_participants;
CREATE POLICY "Participants: owner leave" ON rnd_participants
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- R&D SUBMISSIONS
-- ============================================================
DROP POLICY IF EXISTS "Submissions: owner or admin read" ON rnd_submissions;
CREATE POLICY "Submissions: owner or admin read" ON rnd_submissions
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

DROP POLICY IF EXISTS "Submissions: authenticated insert" ON rnd_submissions;
CREATE POLICY "Submissions: authenticated insert" ON rnd_submissions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run after creating buckets in dashboard)
-- ============================================================
-- Create these buckets in Supabase Dashboard → Storage:
-- 1. "research-papers" (public: true, file size limit: 52428800 = 50MB)
-- 2. "avatars" (public: true, file size limit: 5242880 = 5MB)

-- Storage policies (run after bucket creation)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'research-papers',
  'research-papers',
  true,
  52428800,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;
