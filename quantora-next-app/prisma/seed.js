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

  console.log('Seeding Forensic Exposé & Research Publications...');
  await prisma.paper.create({
    data: {
      title: '26-Year Forensic Analysis of Indian Agricultural Budget & Credit Flows',
      abstract: 'This forensic policy paper audits 26 years of central agricultural budgets and credit lines in India. It uncovers systemic diversions of subvention-backed loans away from actual marginal farmers and into high-value urban corporate accounts. Using geographical data models, we map the credit leakage pathways and propose a smart-contract decentralized subvention ledger to enforce destination accountability.',
      category: 'Public Policy',
      authorId: aditya.id,
      institution: 'Delhi Technological University',
      country: 'India',
      tags: 'Agriculture,Budget-Audit,Credit-Flows,Sovereign-Policy',
      references: 'Reserve Bank of India (RBI) Credit Statistics (2000-2026), NABARD Annual Financial Outlays (1998-2025), India Union Budgets (2000-2026).',
      fileUrl: '/report.html',
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

  await prisma.paper.create({
    data: {
      title: 'Sovereign Debt Volatility & Refinancing Cycles in Emerging Economies',
      abstract: 'This research establishes an analytical stress-testing index for sovereign debt portfolios in emerging economies. By simulating interest-rate transmission channels under global macroeconomic shocks, we identify high-risk debt refinancing cycles and suggest a concrete hedging framework utilizing commodity-linked sovereign certificates.',
      category: 'Macroeconomics',
      authorId: aditya.id,
      institution: 'Delhi Technological University',
      country: 'India',
      tags: 'Sovereign-Debt,Refinancing,Macroeconomics,Emerging-Markets',
      references: 'World Bank Debt Reports, Baltic Dry Index Feeds, Reserve Bank of India Credit statistics.',
      fileUrl: '/report.pdf',
      fileName: 'Sovereign_Debt_Stress_Test.pdf',
      fileSize: '954 KB',
      status: 'APPROVED',
      citations: 12,
      downloads: 180,
      likes: 64,
      peerReviewed: true,
      aiSummary: '• Formulates a mathematical risk index mapping global bond volatility to sovereign credit default swap margins.\n• Focuses on emerging market portfolios vulnerable to short-term commercial refinancing bottlenecks.\n• Provides a concrete hedging blueprint using commodity-linked sovereign debt certificates.',
      trustLabel: 'VERIFIED_RESEARCH'
    }
  });

  console.log('Seeding Macro Insights...');
  await prisma.insight.create({
    data: {
      authorId: aditya.id,
      content: 'Early trading shows sovereign bond yields in emerging markets adjusting to new federal credit policies. Volatility is mounting on short-term debt portfolios as sovereign clearing corridors undergo structural changes.',
      tags: 'Sovereign-Debt,Refinancing,Macroeconomics',
      category: 'Macroeconomics',
      upvotesCount: 42,
      commentsCount: 3
    }
  });

  await prisma.insight.create({
    data: {
      authorId: aditya.id,
      content: 'The destination-validated agritech ledger prototype is now fully coded in our sandbox. Local test nodes are successfully verifying crop landholdings using decentralized identity hashes before issuing subvention approvals. This directly addresses the 42% leakage path documented in our agricultural budget audit exposé.',
      tags: 'Agritech,Auditing,Budget-Analysis',
      category: 'Public Policy',
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
