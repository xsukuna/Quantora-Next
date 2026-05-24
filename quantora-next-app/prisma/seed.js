const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database contents...');
  await prisma.comment.deleteMany({});
  await prisma.paperVersion.deleteMany({});
  await prisma.paper.deleteMany({});
  await prisma.insight.deleteMany({});
  await prisma.rndChallenge.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Pioneer Users...');
  const aditya = await prisma.user.create({
    data: {
      username: 'aditya_k',
      name: 'Aditya Kaushik',
      email: 'scarfaceatwork@outlook.com',
      role: 'ADMIN',
      reputation: 980,
      badge: 'Genesis Founder & Policy Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
    }
  });

  const elena = await prisma.user.create({
    data: {
      username: 'elena_r',
      name: 'Dr. Elena Rostova',
      email: 'elena@quantora.org',
      role: 'CONTRIBUTOR',
      reputation: 850,
      badge: 'Chief AI Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
    }
  });

  const alistair = await prisma.user.create({
    data: {
      username: 'alistair_v',
      name: 'Alistair Vance',
      email: 'alistair@quantora.org',
      role: 'CONTRIBUTOR',
      reputation: 720,
      badge: 'Senior Macro Strategist',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
    }
  });

  console.log('Seeding Forensic Exposé & Research Publications...');
  const paper1 = await prisma.paper.create({
    data: {
      title: '26-Year Forensic Analysis of Indian Agricultural Budget & Credit Flows',
      abstract: 'This forensic policy paper audits 26 years of central agricultural budgets and credit lines in India. It uncovers systemic diversions of subvention-backed loans away from actual marginal farmers and into high-value urban corporate accounts. Using geographical data models, we map the credit leakage pathways and propose a smart-contract decentralized subvention ledger to enforce destination accountability.',
      category: 'Policy & Audit',
      authorId: aditya.id,
      institution: 'Delhi Technological University',
      country: 'India',
      tags: 'Agriculture,Budget-Audit,Credit-Flows,Sovereign-Policy',
      references: 'Reserve Bank of India (RBI) Credit Statistics (2000-2026), NABARD Annual Financial Outlays (1998-2025), India Union Budgets (2000-2026).',
      fileUrl: '/report.pdf',
      fileName: 'Agricultural_Budget_Audit_2026.pdf',
      fileSize: '841 KB',
      status: 'APPROVED',
      citations: 28,
      downloads: 412,
      likes: 184,
      peerReviewed: true,
      aiSummary: '• Analyzes 26 years of central Indian budget datasets (2000-2026) covering agricultural credit outlays.\n• Pinpoints a 42% leakage index where subvention-backed farm loans flow into non-farm corporate sectors.\n• Maps systemic regional discrepancies, showing disproportionate credit flows to urbanized municipal zones.\n• Recommends an immutable destination-validated ledger framework to verify real farmer identity.',
      trustLabel: 'VERIFIED_RESEARCH'
    }
  });

  const paper2 = await prisma.paper.create({
    data: {
      title: 'Neural Transformers for Automated Macro-Economic Modeling',
      abstract: 'Conventional macroeconomic forecasting relies on vector autoregressions that fail under structural breaks. We present a novel neural transformer architecture specifically trained on multi-source macroeconomic time series. The model captures long-range interdependencies across international bond yields, inflation gauges, and supply indices, outperforming classical VAR models by 34% in medium-term forecasts.',
      category: 'Artificial Intelligence',
      authorId: elena.id,
      institution: 'Institute of Mathematical Modeling, Munich',
      country: 'Germany',
      tags: 'Neural-Networks,Transformers,Macro-Forecasting,VAR-Alternative',
      references: 'Vaswani et al. (2017) Attention Is All You Need, IMF World Economic Outlook Databases, Federal Reserve Economic Data (FRED).',
      fileUrl: '#',
      fileName: 'Neural_Macro_Transformers_2026.pdf',
      fileSize: '1.2 MB',
      status: 'APPROVED',
      citations: 14,
      downloads: 245,
      likes: 92,
      peerReviewed: true,
      aiSummary: '• Proposes a specialized generative attention framework for multivariate macroeconomic index forecasting.\n• Outperforms vector autoregression (VAR) methods by over 34% in out-of-sample forecast accuracy.\n• Encodes multi-scale attention layers to capture global debt and commodity price lag phases.\n• Demonstrates architectural stability across historical inflation hikes and supply-chain blockages.',
      trustLabel: 'COMMUNITY_REVIEWED'
    }
  });

  const paper3 = await prisma.paper.create({
    data: {
      title: 'Stress-Testing Sovereign Debt Portfolios Under Global Supply Chain Disruption',
      abstract: 'This paper establishes an analytical stress-testing index for sovereign debt portfolios in emerging economies. By simulating multi-node maritime shipping blockages and localized fab delays, we trace interest-rate transmission channels. The research exposes high-risk debt refinancing cycles that could trigger sovereign defaults if transport cost increases exceed a 120-day duration.',
      category: 'Macroeconomics',
      authorId: alistair.id,
      institution: 'London School of Economics',
      country: 'United Kingdom',
      tags: 'Sovereign-Debt,Refinancing,Maritime-Stress,emerging-markets',
      references: 'World Bank Debt Report 2025, Baltic Dry Index Refinitiv Feed, LSE Sovereign Risk Database.',
      fileUrl: '#',
      fileName: 'Sovereign_Debt_Stress_Test.pdf',
      fileSize: '954 KB',
      status: 'APPROVED',
      citations: 22,
      downloads: 310,
      likes: 128,
      peerReviewed: true,
      aiSummary: '• Formulates a mathematical risk index mapping shipping transit delays to sovereign credit default swap margins.\n• Focuses on emerging market portfolios vulnerable to short-term commercial refinancing bottlenecks.\n• Exposes systemic risk thresholds showing extreme stress if freight rates remain inflated past 120 days.\n• Provides a concrete hedging blueprint using commodity-linked sovereign debt certificates.',
      trustLabel: 'VERIFIED_RESEARCH'
    }
  });

  console.log('Seeding R&D Challenges...');
  await prisma.rndChallenge.create({
    data: {
      title: 'WEF Supply Chain Logistical Stress-Testing',
      sponsor: 'World Economic Forum',
      logo: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=80&auto=format&fit=crop',
      description: 'Design and deploy dynamic network models mapping global container vessel choke points. Solutions must predict freight price volatility under 15%, 30%, and 50% passage capacity constraints.',
      reward: '$50,000 + 200 REP',
      repAward: 200,
      category: 'Macroeconomics',
      difficulty: 'Expert',
      teamsCount: 14,
      solutionsCount: 3,
      details: 'This challenge is designed in cooperation with global shipping alliances. Deployed pipelines should integrate AIS live transponder feeds and commodity pricing terminals. Winning solutions will be presented at the Davos Summit.'
    }
  });

  await prisma.rndChallenge.create({
    data: {
      title: 'NABARD Rural Credit Disbursement Auditing',
      sponsor: 'NABARD India',
      logo: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?q=80&w=80&auto=format&fit=crop',
      description: 'Implement a destination-validated blockchain or decentralized database prototype ensuring that agricultural credit allocations reach certified landholding farmers in rural zones.',
      reward: '$35,000 + 150 REP',
      repAward: 150,
      category: 'Policy & Audit',
      difficulty: 'Advanced',
      teamsCount: 8,
      solutionsCount: 1,
      details: 'Based on Aditya Kaushik\'s 26-year budget exposé, NABARD is sponsoring an open R&D initiative to build a bulletproof auditing system. Prototypes must run locally on SQLite/PostgreSQL and demonstrate secure identity verification.'
    }
  });

  await prisma.rndChallenge.create({
    data: {
      title: 'Quantora Book-to-Transformer Fine-Tuning',
      sponsor: 'Quantora Labs',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=80&auto=format&fit=crop',
      description: 'Create an optimized fine-tuning pipeline that digests large-format macroeconomic textbooks and outputs low-latency, context-grounded mathematical inference adapters.',
      reward: '$20,000 + 100 REP',
      repAward: 100,
      category: 'Artificial Intelligence',
      difficulty: 'Intermediate',
      teamsCount: 19,
      solutionsCount: 5,
      details: 'We seek extremely lightweight parameter adapters (LoRA) built on Llama-3 or Mistral. Adaptation must be validated using the Quantora benchmark dataset.'
    }
  });

  console.log('Seeding Macro Insights...');
  await prisma.insight.create({
    data: {
      authorId: alistair.id,
      content: 'Early trading shows sovereign bond yields in emerging markets diverging sharply by 45 basis points. Refinancing stress is mounting on short-term corporate debt portfolios as shipping freight rates remain elevated for the 5th consecutive week.',
      tags: 'Sovereign-Debt,Refinancing,Freight-Pricing,Emerging-Markets',
      category: 'Macroeconomics',
      upvotesCount: 42,
      commentsCount: 3
    }
  });

  await prisma.insight.create({
    data: {
      authorId: aditya.id,
      content: 'The NABARD agritech ledger prototype is now fully coded in our sandbox. Local test nodes are successfully verifying crop landholdings using decentralized identity hashes before issuing subvention approvals. This directly addresses the 42% leakage path documented in our agricultural budget audit exposé.',
      tags: 'Agritech,Auditing,NABARD,Smart-Contracts',
      category: 'Policy & Audit',
      upvotesCount: 89,
      commentsCount: 11
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
