INSERT INTO rnd_challenges (title, description, details, category, difficulty, reward, rep_award, sponsor, deadline, is_active, teams_count, solutions_count)
VALUES
(
  'AI-Driven Crop Yield Prediction for Indian Agriculture',
  'Build a ML model predicting district-level crop yields using satellite imagery and weather data for 5 major crops across 3 states.',
  'Dataset from ICRISAT and IMD. Deliverable: working API + model card + accuracy report. Winner featured in Quantora Annual Research Report.',
  'Public Policy',
  'Advanced',
  '₹2,00,000 + Publication Credit',
  500,
  'QUANTORA-NEXT Institute',
  NOW() + INTERVAL '60 days',
  TRUE,
  0,
  0
),
(
  'Sovereign Debt Stress Index for Emerging Markets',
  'Develop a real-time composite index measuring sovereign debt stress across 20+ emerging markets using bond yield, CDS spread, and reserve data.',
  'Use IMF and World Bank data. Deliverable: methodology paper + live dashboard. Judged on index validity and explanatory power.',
  'Macroeconomics',
  'Expert',
  '$5,000 USD + Co-authorship',
  750,
  'Global Finance Research Consortium',
  NOW() + INTERVAL '45 days',
  TRUE,
  0,
  0
),
(
  'Geopolitical Risk Quantification Tool',
  'Create a scoring framework quantifying geopolitical risk for bilateral trade relationships using NLP on news sources and UN voting records.',
  'Deliverable: Python library + scoring methodology + validation. Data sources: GDELT, UN comtrade, ACLED.',
  'Geopolitics',
  'Intermediate',
  '₹75,000 + Platform Badge',
  300,
  'QUANTORA-NEXT',
  NOW() + INTERVAL '30 days',
  TRUE,
  0,
  0
),
(
  'India Infrastructure Spend Efficiency Audit',
  'Analyze 10 years of government infrastructure expenditure and build a district-level efficiency score comparing planned vs actual completion.',
  'Data: CAG reports, Ministry of Finance budget documents. Deliverable: interactive visualization + statistical report.',
  'Public Policy',
  'Beginner',
  '₹25,000 + Certificate',
  150,
  'QUANTORA-NEXT',
  NOW() + INTERVAL '90 days',
  TRUE,
  0,
  0
),
(
  'Rare Earth Supply Chain Vulnerability Model',
  'Map global rare earth mineral supply chains and build a vulnerability score for 15 critical minerals with disruption scenarios.',
  'Use USGS and IEA data. Deliverable: network graph + Monte Carlo disruption simulation + policy brief.',
  'Climate Finance',
  'Advanced',
  '$3,000 USD + Research Credit',
  600,
  'Critical Minerals Research Fund',
  NOW() + INTERVAL '50 days',
  TRUE,
  0,
  0
)
ON CONFLICT DO NOTHING;

SELECT COUNT(*) || ' total challenges in database' AS result FROM rnd_challenges;
