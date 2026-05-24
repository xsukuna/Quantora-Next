// Quantora Platform Persistent Database Service

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  reputation: number;
}

export interface PaperVersion {
  version: string;
  date: string;
  summary: string;
  author: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  category: 'Macroeconomics' | 'Quantitative Finance' | 'Public Policy' | 'Geopolitics' | 'Economic Policy' | 'Technology Insights';
  author: string;
  institution: string;
  country: string;
  tags: string[];
  references: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  date: string;
  status: 'Approved' | 'Pending Review' | 'Rejected';
  citations: number;
  downloads: number;
  likes: number;
  upvotedBy: string[]; // List of user IDs who upvoted
  bookmarkedBy: string[]; // List of user IDs who bookmarked
  peerReviewed: boolean;
  aiSummary: string;
  comments: Comment[];
  
  // Evolved Platform Fields
  trustLabel?: 'Verified Research' | 'Community Reviewed' | 'Independent Submission' | 'Experimental Research' | 'Open Draft';
  forkedFrom?: string; // ID of parent paper
  versions?: PaperVersion[];
  ratings?: { userId: string; rating: number }[];
  averageRating?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Contributor' | 'Guest';
  reputation: number;
  badge: string;
  avatarUrl?: string;
  bookmarks: string[];
  uploadedPapers: string[];
}

export interface RndChallenge {
  id: string;
  title: string;
  sponsor: string;
  logo: string;
  description: string;
  reward: string;
  repAward: number;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  teamsCount: number;
  solutionsCount: number;
  joinedUsers: string[]; // List of userIds who joined the challenge
  details: string;
}

export interface Insight {
  id: string;
  author: string;
  avatarUrl?: string;
  role: string;
  badge: string;
  reputation: number;
  content: string;
  tags: string[];
  category: string;
  timestamp: string;
  upvotes: number;
  upvotedBy: string[];
  commentsCount: number;
}

const DEFAULT_PAPERS: Paper[] = [
  {
    id: 'paper-5',
    title: 'Broken Promises in the Fields: ₹127,290 Crore and Farmers Are Still Dying',
    abstract: "A 26-year forensic analysis (FY 2000–2026) of India's agricultural budget expenditure across three governments — and the inconvenient truth that money alone cannot fix a structurally broken system. Despite a 580% increase in government spending, farmer suicides remain endemic, rural indebtedness exceeds 51%, and the average farm household earns less than a daily-wage urban worker.",
    category: 'Public Policy',
    author: 'Aditya Kaushik',
    institution: 'Independent Research',
    country: 'India',
    tags: ['Agriculture', 'Rural Economy', 'Public Expenditure', 'Farmer Welfare', 'India'],
    references: 'Kaushik, A. (2026). Broken Promises in the Fields: 26-Year Analysis of Indian Agricultural Expenditure and Farmer Welfare. Independent Research.',
    fileUrl: '/report.pdf',
    fileName: 'broken_promises_fields_2026.pdf',
    fileSize: '1.2 MB',
    date: '2026-05-22',
    status: 'Approved',
    citations: 128,
    downloads: 3450,
    likes: 912,
    upvotedBy: [],
    bookmarkedBy: [],
    peerReviewed: true,
    aiSummary: '• Analyzes nominal agricultural budget expansion (580% increase) vs real welfare metrics from FY 2000 to FY 2026.\n• Exposes systemic gaps: agricultural credit leakage, ineffective MSP implementation, extreme land fragmentation, and catastrophic out-of-pocket health costs.\n• Shows that MGNREGA rural employment guarantee has empirically been the single most effective safety-net in reducing distress suicides.',
    comments: [
      { id: 'c-5-1', author: 'Dr. Ramesh Sen (NABARD)', text: 'Groundbreaking analysis. The regional credit inequality data and KCC health spending leakage correlation is highly accurate.', timestamp: '2026-05-22', reputation: 94 },
      { id: 'c-5-2', author: 'Prof. Amartya Rao', text: 'This is the most comprehensive 26-year forensic audit of agricultural budgets I have read. Excellent work on the scissors index.', timestamp: '2026-05-22', reputation: 88 }
    ],
    trustLabel: 'Verified Research',
    versions: [
      { version: '1.0.0', date: '2026-05-20', summary: 'Initial Research Draft', author: 'Aditya Kaushik' },
      { version: '1.1.0', date: '2026-05-22', summary: 'Added regional credit inequality vectors', author: 'Aditya Kaushik' }
    ],
    ratings: [
      { userId: 'user-2', rating: 5 }
    ],
    averageRating: 5.0
  },
  {
    id: 'paper-1',
    title: 'The Great Decoupling: Sovereign Debt Cycles (2026-2030)',
    abstract: 'This paper analyzes the structural decoupling of sovereign debt regimes between G7 nations and emerging market blocks. Utilizing alternative capital flow indexing and multi-asset volatility modeling, we demonstrate the emergence of multi-currency clearing architectures and their impact on long-term treasury benchmarks.',
    category: 'Macroeconomics',
    author: 'Dr. Alistair Vance',
    institution: 'Quantora Analytics Institute',
    country: 'United Kingdom',
    tags: ['Sovereign Debt', 'Macroeconomics', 'Yield Curves', 'Decoupling'],
    references: 'Vance, A. (2025). The Future of G7 Treasury Liquidity. Journal of Monetary Policy, 14(2), 112-140.',
    fileUrl: '#',
    fileName: 'decoupling_debt_cycles_2026.pdf',
    fileSize: '4.2 MB',
    date: '2026-05-12',
    status: 'Approved',
    citations: 42,
    downloads: 890,
    likes: 245,
    upvotedBy: ['user-2'],
    bookmarkedBy: [],
    peerReviewed: true,
    aiSummary: '• Analyzes G7 monetary decoupling and the emergence of competing global debt clearing circles.\n• Predicts a structural rise in G7 long-term yields due to localized sovereign containment policies.\n• Outlines robust asset allocations for sovereign funds under multi-currency sovereign regimes.',
    comments: [
      { id: 'c-1', author: 'Sarah Jenkins (WEF)', text: 'Exceptional modeling. The empirical analysis on EM clearing corridors matches our recent internal reports perfectly.', timestamp: '2026-05-13', reputation: 98 },
      { id: 'c-2', author: 'Prof. Kenji Sato', text: 'Does this hold under severe inflation shock? The simulation should consider extreme supply shocks.', timestamp: '2026-05-15', reputation: 85 }
    ],
    trustLabel: 'Verified Research',
    versions: [
      { version: '1.0.0', date: '2026-05-12', summary: 'Released sovereign debt simulation models', author: 'Dr. Alistair Vance' }
    ]
  },
  {
    id: 'paper-2',
    title: 'Neural Alpha: Multi-Agent Deep Reinforcement Learning in Volatile Regimes',
    abstract: 'We introduce Neural Alpha, a multi-agent deep reinforcement learning framework for algorithmic signal generation and market-making under extreme volatility. By mapping Order Book depth matrices into spatial-temporal graph networks, our model outperforms standard Transformer baselines by 45%.',
    category: 'Quantitative Finance',
    author: 'Elena Rostova',
    institution: 'MIT Media Lab',
    country: 'United States',
    tags: ['Machine Learning', 'Quantitative Finance', 'Market Making', 'Deep Learning'],
    references: 'Rostova, E., & Miller, J. (2025). Deep reinforcement architectures in non-stationary order books. Quantitative Finance Letters, 8(4), 211-229.',
    fileUrl: '#',
    fileName: 'neural_alpha_reinforcement.pdf',
    fileSize: '6.8 MB',
    date: '2026-04-29',
    status: 'Approved',
    citations: 18,
    downloads: 1240,
    likes: 412,
    upvotedBy: [],
    bookmarkedBy: ['user-1'],
    peerReviewed: true,
    aiSummary: '• Presents a novel reinforcement learning architecture optimized for non-stationary market states.\n• Shows a 2.45 Information Ratio in simulated out-of-sample backtests under extreme drawdowns.\n• Implements graph network abstractions to map order book liquidity and counterparty risk.',
    comments: [
      { id: 'c-3', author: 'Dr. Chen Wei (HKUST)', text: 'The out-of-sample IR of 2.45 is highly impressive. Have you made the training weights open-source?', timestamp: '2026-04-30', reputation: 92 }
    ],
    trustLabel: 'Verified Research',
    versions: [
      { version: '1.0.0', date: '2026-04-29', summary: 'Neural Alpha Core Weights Released', author: 'Elena Rostova' }
    ]
  },
  {
    id: 'paper-3',
    title: 'Geopolitical Supply Fractures: Lithium & Transition Elements Pipeline Strategy',
    abstract: 'This research presents a network flow optimization model mapping global lithium and rare-earth element supply chains. We stress-test this supply grid against diplomatic fractures, nationalization waves, and bilateral trade sanctions, proposing a strategic stockpile framework for industrial resilience.',
    category: 'Public Policy',
    author: 'Marcus Aurelius Vance',
    institution: 'London School of Economics',
    country: 'United Kingdom',
    tags: ['Critical Minerals', 'Energy Transition', 'Geopolitics', 'Supply Chain'],
    references: 'Vance, M. A. (2026). Lithium Pipeline Fragilities. Global Resources Policy Review, 19(1), 45-78.',
    fileUrl: '#',
    fileName: 'lithium_supply_fractures_2026.pdf',
    fileSize: '5.1 MB',
    date: '2026-05-02',
    status: 'Approved',
    citations: 29,
    downloads: 512,
    likes: 189,
    upvotedBy: [],
    bookmarkedBy: [],
    peerReviewed: true,
    aiSummary: '• Stress-tests rare-earth supply networks against high-risk trade containment policies.\n• Identifies three key choke-points in Southeast Asian processing hubs that represent single-points-of-failure.\n• Provides a policy blueprint for multi-national public-private stockpile partnerships.',
    comments: [],
    trustLabel: 'Verified Research',
    versions: [
      { version: '1.0.0', date: '2026-05-02', summary: 'Lithium logistical pipeline stress draft', author: 'Marcus Aurelius Vance' }
    ]
  },
  {
    id: 'paper-4',
    title: 'Cryptographic Sovereignty: Central Bank Digital Currencies vs Decentralized Protocols',
    abstract: 'We contrast the systemic stability, privacy guarantees, and monetary transmission efficiency of centralized CBDCs with next-generation decentralized liquidity protocols. We analyze the balance between compliance frameworks and sovereign autonomy in emerging market economies.',
    category: 'Technology Insights',
    author: 'Dr. Amara Dianu',
    institution: 'Singapore Fintech Lab',
    country: 'Singapore',
    tags: ['CBDC', 'Blockchain', 'Monetary Policy', 'Privacy'],
    references: 'Dianu, A. (2025). The Cryptographic State: Sovereignty in the Age of Tokens. Singapore Journal of Financial Innovation, 3(1), 12-34.',
    fileUrl: '#',
    fileName: 'cryptographic_sovereignty_cbdc.pdf',
    fileSize: '3.9 MB',
    date: '2026-05-18',
    status: 'Approved',
    citations: 15,
    downloads: 403,
    likes: 130,
    upvotedBy: [],
    bookmarkedBy: [],
    peerReviewed: false,
    aiSummary: '• Compares central bank led ledger models with permissionless proof-of-stake networks.\n• Evaluates the transactional privacy trade-offs of digital cash versus audit compliance requirements.\n• Develops an algorithmic framework for cross-border multi-CBDC liquidity routing.',
    comments: [],
    trustLabel: 'Community Reviewed',
    versions: [
      { version: '1.0.0', date: '2026-05-18', summary: 'Core CBDC protocol simulation paper', author: 'Dr. Amara Dianu' }
    ]
  }
];

const DEFAULT_USER: User = {
  id: 'user-1',
  name: 'Aditya Kaushik',
  email: 'aditya.kaushik@quantora.org',
  role: 'Admin',
  reputation: 980,
  badge: 'Lead Architect',
  avatarUrl: '/aditya.png',
  bookmarks: ['paper-2'],
  uploadedPapers: ['paper-5']
};

const DEFAULT_CHALLENGES: RndChallenge[] = [
  {
    id: 'ch-1',
    title: 'Rare-Earth Mineral Logistics Models',
    sponsor: 'World Economic Forum',
    logo: 'WEF',
    description: 'Establish stress-test flow graph networks modeling regional supply disruptions on lithium processing hubs in Southeast Asia.',
    reward: '$25,000 Grant',
    repAward: 500,
    category: 'Geopolitics',
    difficulty: 'Expert',
    teamsCount: 8,
    solutionsCount: 3,
    joinedUsers: [],
    details: 'This challenge aims to map out potential trade choke-points using quantitative spatial flow graphs. Winners will receive institutional publishing clearance on the WEF Global Risk Matrix and a dedicated research subsidy.'
  },
  {
    id: 'ch-2',
    title: 'Agricultural Credit Leakage Analysis',
    sponsor: 'NABARD',
    logo: 'NAB',
    description: 'Design digital analytical tracking tools analyzing out-of-pocket health costs leaking from KCC agricultural lines.',
    reward: 'Fellowship Position',
    repAward: 400,
    category: 'Public Policy',
    difficulty: 'Expert',
    teamsCount: 14,
    solutionsCount: 5,
    joinedUsers: ['user-1'],
    details: 'Researchers must use microeconomic household parameters and local credit lines to evaluate regional discrepancies. NABARD will subsidize a 12-month sovereign research fellowship in New Delhi for the best proposal.'
  },
  {
    id: 'ch-3',
    title: 'High-Frequency Order Book Graph Transformers',
    sponsor: 'Quantora Labs',
    logo: 'QL',
    description: 'Design deep order book transformers parsing extreme volatility spreads for market-making multi-agent architectures.',
    reward: '$10,000 Award',
    repAward: 300,
    category: 'Quantitative Finance',
    difficulty: 'Expert',
    teamsCount: 19,
    solutionsCount: 2,
    joinedUsers: [],
    details: 'This project targets spatial-temporal representation models mapping out-of-sample Order Book limits. The winning code will be licensed and deployed directly across Quantora’s clearing gateways.'
  },
  {
    id: 'ch-4',
    title: 'Carbon-Neutral Decoupled Ledger System',
    sponsor: 'Green Climate Alliance',
    logo: 'GCA',
    description: 'Formulate light-weight, highly energy-efficient cross-chain synchronization scripts to minimize network overhead.',
    reward: '$15,000 Award',
    repAward: 350,
    category: 'Technology Insights',
    difficulty: 'Intermediate',
    teamsCount: 6,
    solutionsCount: 1,
    joinedUsers: [],
    details: 'Integrate carbon-aware API routers dynamically dispatching validator nodes. Proposals must detail precise computational footprints per transaction block.'
  }
];

const DEFAULT_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    author: 'Aditya Kaushik',
    avatarUrl: '/aditya.png',
    role: 'Admin',
    badge: 'Lead Architect',
    reputation: 980,
    content: 'Bilateral metal sanctions stress-test indicators show a structural 22% supply deficit for rare-earth and lithium processing hubs by Q4 2026. G7 countries are structurally unprepared for strategic sovereign decoupling.',
    tags: ['Lithium', 'SupplyChains', 'Geopolitics'],
    category: 'Geopolitics',
    timestamp: '2026-05-24',
    upvotes: 42,
    upvotedBy: ['user-2'],
    commentsCount: 3
  },
  {
    id: 'ins-2',
    author: 'Dr. Alistair Vance',
    role: 'Contributor',
    badge: 'Sovereign Analyst',
    reputation: 820,
    content: 'Emerging market clearing indices flag an unprecedented capital reallocation. Over $140B in central bank assets migrated into non-G7 backed physical sovereign deposits during the last trading cycle.',
    tags: ['SovereignDebt', 'YieldCurves', 'CapitalFlight'],
    category: 'Macroeconomics',
    timestamp: '2026-05-23',
    upvotes: 28,
    upvotedBy: [],
    commentsCount: 1
  },
  {
    id: 'ins-3',
    author: 'Elena Rostova',
    role: 'Contributor',
    badge: 'Neural Architect',
    reputation: 720,
    content: 'Our Deep RL backtests just confirmed a 2.45 Information Ratio on out-of-sample order book spreads under high volatility regimes. The spatial-temporal graph models outperform traditional transformer vectors by a clean 45%.',
    tags: ['Algorithmic', 'OrderBook', 'ReinforcementLearning'],
    category: 'Quantitative Finance',
    timestamp: '2026-05-22',
    upvotes: 56,
    upvotedBy: ['user-1'],
    commentsCount: 4
  }
];

// Initialize localStorage DB
export const initializeDB = () => {
  if (!localStorage.getItem('quantora_papers')) {
    localStorage.setItem('quantora_papers', JSON.stringify(DEFAULT_PAPERS));
  }
  if (!localStorage.getItem('quantora_user')) {
    localStorage.setItem('quantora_user', JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem('quantora_users')) {
    localStorage.setItem('quantora_users', JSON.stringify([DEFAULT_USER, {
      id: 'user-2',
      name: 'Elena Rostova',
      email: 'e.rostova@mit.edu',
      role: 'Contributor',
      reputation: 720,
      badge: 'Neural Architect',
      bookmarks: [],
      uploadedPapers: ['paper-2']
    }]));
  }
  if (!localStorage.getItem('quantora_challenges')) {
    localStorage.setItem('quantora_challenges', JSON.stringify(DEFAULT_CHALLENGES));
  }
  if (!localStorage.getItem('quantora_insights')) {
    localStorage.setItem('quantora_insights', JSON.stringify(DEFAULT_INSIGHTS));
  }
};

export const resetDB = () => {
  localStorage.setItem('quantora_papers', JSON.stringify(DEFAULT_PAPERS));
  localStorage.setItem('quantora_user', JSON.stringify(DEFAULT_USER));
  localStorage.setItem('quantora_challenges', JSON.stringify(DEFAULT_CHALLENGES));
  localStorage.setItem('quantora_insights', JSON.stringify(DEFAULT_INSIGHTS));
  return getPapers();
};

// Papers core API
export const getPapers = (): Paper[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_papers') || '[]');
};

export const savePapers = (papers: Paper[]) => {
  localStorage.setItem('quantora_papers', JSON.stringify(papers));
};

export const addPaper = (paper: Omit<Paper, 'id' | 'date' | 'status' | 'citations' | 'downloads' | 'likes' | 'upvotedBy' | 'bookmarkedBy' | 'comments' | 'aiSummary'> & { trustLabel?: Paper['trustLabel']; forkedFrom?: string }): Paper => {
  const papers = getPapers();
  
  // AI summary simulation
  const bullet1 = `• Addresses empirical key factors under the category of ${paper.category}.`;
  const bullet2 = `• Synthesized analytical patterns from researchers at ${paper.institution}.`;
  const bullet3 = `• Validates custom models with specialized focus in keywords: ${paper.tags.join(', ')}.`;
  const aiSummary = `${bullet1}\n${bullet2}\n${bullet3}`;

  const newPaper: Paper = {
    ...paper,
    id: `paper-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending Review',
    citations: 0,
    downloads: 0,
    likes: 0,
    upvotedBy: [],
    bookmarkedBy: [],
    aiSummary,
    comments: [],
    trustLabel: paper.trustLabel || 'Independent Submission',
    forkedFrom: paper.forkedFrom,
    versions: [
      { version: '1.0.0', date: new Date().toISOString().split('T')[0], summary: 'Initial Submission', author: paper.author }
    ],
    ratings: [],
    averageRating: 0
  };

  papers.push(newPaper);
  savePapers(papers);
  
  // Add to active user's upload list
  const user = getCurrentUser();
  if (user) {
    user.uploadedPapers.push(newPaper.id);
    saveCurrentUser(user);
  }

  return newPaper;
};

// Fork paper helper
export const forkPaper = (parentPaperId: string): Paper | null => {
  const papers = getPapers();
  const parent = papers.find(p => p.id === parentPaperId);
  const user = getCurrentUser();
  if (!parent || !user) return null;

  const forked: Omit<Paper, 'id' | 'date' | 'status' | 'citations' | 'downloads' | 'likes' | 'upvotedBy' | 'bookmarkedBy' | 'comments' | 'aiSummary'> & { trustLabel?: Paper['trustLabel']; forkedFrom?: string } = {
    title: `Fork of: ${parent.title}`,
    abstract: `Forked research branch investigating enhancements. Parent Abstract:\n${parent.abstract}`,
    category: parent.category,
    author: user.name,
    institution: user.badge || 'Independent Fellow',
    country: parent.country,
    tags: [...parent.tags, 'Fork'],
    references: parent.references,
    fileUrl: parent.fileUrl,
    fileName: parent.fileName,
    fileSize: parent.fileSize,
    peerReviewed: false,
    trustLabel: 'Open Draft',
    forkedFrom: parent.id
  };

  return addPaper(forked);
};

// Add revision version helper
export const addPaperVersion = (id: string, version: string, summary: string): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  const user = getCurrentUser();
  if (index !== -1 && user) {
    const paper = papers[index];
    if (!paper.versions) paper.versions = [];
    paper.versions.push({
      version,
      date: new Date().toISOString().split('T')[0],
      summary,
      author: user.name
    });
    papers[index] = paper;
    savePapers(papers);
    return paper;
  }
  return null;
};

// Rating helper
export const ratePaper = (paperId: string, rating: number): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === paperId);
  const user = getCurrentUser();
  if (index !== -1 && user && rating >= 1 && rating <= 5) {
    const paper = papers[index];
    if (!paper.ratings) paper.ratings = [];
    
    // remove existing rating from user
    paper.ratings = paper.ratings.filter(r => r.userId !== user.id);
    paper.ratings.push({ userId: user.id, rating });
    
    const sum = paper.ratings.reduce((s, r) => s + r.rating, 0);
    paper.averageRating = Number((sum / paper.ratings.length).toFixed(1));
    
    papers[index] = paper;
    savePapers(papers);
    return paper;
  }
  return null;
};

export const updatePaperStatus = (id: string, status: 'Approved' | 'Rejected'): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  if (index !== -1) {
    papers[index].status = status;
    if (status === 'Approved') {
      papers[index].trustLabel = 'Verified Research';
    }
    savePapers(papers);
    return papers[index];
  }
  return null;
};

export const updatePaperMetadata = (id: string, updatedData: Partial<Paper>): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  if (index !== -1) {
    papers[index] = { ...papers[index], ...updatedData };
    savePapers(papers);
    return papers[index];
  }
  return null;
};

export const upvotePaper = (id: string, userId: string): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  if (index !== -1) {
    const paper = papers[index];
    const upvoteIndex = paper.upvotedBy.indexOf(userId);
    
    if (upvoteIndex === -1) {
      paper.upvotedBy.push(userId);
      paper.likes += 1;
      
      // Update contributor reputation
      const users = getAllUsers();
      const authorUserIndex = users.findIndex(u => u.name === paper.author || u.uploadedPapers.includes(id));
      if (authorUserIndex !== -1) {
        users[authorUserIndex].reputation += 10;
        localStorage.setItem('quantora_users', JSON.stringify(users));
      }
    } else {
      paper.upvotedBy.splice(upvoteIndex, 1);
      paper.likes = Math.max(0, paper.likes - 1);
    }
    
    papers[index] = paper;
    savePapers(papers);
    return paper;
  }
  return null;
};

export const bookmarkPaper = (id: string, userId: string): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  const user = getCurrentUser();
  
  if (index !== -1 && user && user.id === userId) {
    const paper = papers[index];
    const bookmarkIndex = paper.bookmarkedBy.indexOf(userId);
    const userBookmarkIndex = user.bookmarks.indexOf(id);

    if (bookmarkIndex === -1) {
      paper.bookmarkedBy.push(userId);
      user.bookmarks.push(id);
    } else {
      paper.bookmarkedBy.splice(bookmarkIndex, 1);
      if (userBookmarkIndex !== -1) {
        user.bookmarks.splice(userBookmarkIndex, 1);
      }
    }
    
    papers[index] = paper;
    savePapers(papers);
    saveCurrentUser(user);
    return paper;
  }
  return null;
};

export const incrementDownloads = (id: string): number => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  if (index !== -1) {
    papers[index].downloads += 1;
    savePapers(papers);
    return papers[index].downloads;
  }
  return 0;
};

export const addComment = (paperId: string, author: string, text: string): Comment | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === paperId);
  if (index !== -1) {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author,
      text,
      timestamp: new Date().toISOString().split('T')[0],
      reputation: 50
    };
    papers[index].comments.push(newComment);
    savePapers(papers);
    return newComment;
  }
  return null;
};

export const deletePaper = (id: string): boolean => {
  const papers = getPapers();
  const filtered = papers.filter(p => p.id !== id);
  if (filtered.length !== papers.length) {
    savePapers(filtered);
    return true;
  }
  return false;
};

// Users core API
export const getCurrentUser = (): User | null => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_user') || 'null');
};

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('quantora_user', JSON.stringify(user));
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('quantora_users', JSON.stringify(users));
    }
  } else {
    localStorage.removeItem('quantora_user');
  }
};

export const getAllUsers = (): User[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_users') || '[]');
};

export const handleMockAuth = (email: string, _method: 'Google' | 'GitHub' | 'OTP'): User => {
  const users = getAllUsers();
  
  const isDeveloperEmail = [
    'scarfaceatwork@outlook.com',
    'aditya.kaushik@gmail.com',
    'aditya.kaushik@github.com',
    'aditya@quantora.org'
  ].includes(email.toLowerCase());
  
  let existingUser: User | undefined;
  if (isDeveloperEmail) {
    existingUser = users.find(u => u.role === 'Admin');
    if (existingUser) {
      existingUser.email = email;
      saveCurrentUser(existingUser);
      return existingUser;
    }
  }

  existingUser = users.find(u => u.email === email);
  
  if (!existingUser) {
    const name = email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    existingUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'Contributor',
      reputation: 10,
      badge: 'Fellow Contributor',
      bookmarks: [],
      uploadedPapers: []
    };
    users.push(existingUser);
    localStorage.setItem('quantora_users', JSON.stringify(users));
  }
  
  saveCurrentUser(existingUser);
  return existingUser;
};

// Challenges core API
export const getChallenges = (): RndChallenge[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_challenges') || '[]');
};

export const saveChallenges = (challenges: RndChallenge[]) => {
  localStorage.setItem('quantora_challenges', JSON.stringify(challenges));
};

export const joinChallenge = (challengeId: string, userId: string): RndChallenge | null => {
  const challenges = getChallenges();
  const index = challenges.findIndex(c => c.id === challengeId);
  if (index !== -1) {
    const challenge = challenges[index];
    if (!challenge.joinedUsers.includes(userId)) {
      challenge.joinedUsers.push(userId);
      challenge.teamsCount += 1;
      challenges[index] = challenge;
      saveChallenges(challenges);
      
      // increment user reputation slightly
      const users = getAllUsers();
      const userIdx = users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
        users[userIdx].reputation += 15;
        localStorage.setItem('quantora_users', JSON.stringify(users));
        const current = getCurrentUser();
        if (current && current.id === userId) {
          current.reputation += 15;
          saveCurrentUser(current);
        }
      }
      return challenge;
    }
  }
  return null;
};

export const submitChallengeSolution = (challengeId: string, userId: string): RndChallenge | null => {
  const challenges = getChallenges();
  const index = challenges.findIndex(c => c.id === challengeId);
  if (index !== -1) {
    const challenge = challenges[index];
    challenge.solutionsCount += 1;
    challenges[index] = challenge;
    saveChallenges(challenges);

    // increment reputation
    const users = getAllUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx].reputation += 50;
      localStorage.setItem('quantora_users', JSON.stringify(users));
      const current = getCurrentUser();
      if (current && current.id === userId) {
        current.reputation += 50;
        saveCurrentUser(current);
      }
    }
    return challenge;
  }
  return null;
};

// Insights core API
export const getInsights = (): Insight[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_insights') || '[]');
};

export const saveInsights = (insights: Insight[]) => {
  localStorage.setItem('quantora_insights', JSON.stringify(insights));
};

export const addInsight = (content: string, tags: string[], category: string): Insight | null => {
  const user = getCurrentUser();
  if (!user) return null;

  const newInsight: Insight = {
    id: `ins-${Date.now()}`,
    author: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    badge: user.badge,
    reputation: user.reputation,
    content,
    tags,
    category,
    timestamp: new Date().toISOString().split('T')[0],
    upvotes: 0,
    upvotedBy: [],
    commentsCount: 0
  };

  const insights = getInsights();
  insights.unshift(newInsight);
  saveInsights(insights);

  // increase reputation for sharing insights
  const users = getAllUsers();
  const userIdx = users.findIndex(u => u.id === user.id);
  if (userIdx !== -1) {
    users[userIdx].reputation += 5;
    localStorage.setItem('quantora_users', JSON.stringify(users));
    user.reputation += 5;
    saveCurrentUser(user);
  }

  return newInsight;
};

export const upvoteInsight = (id: string, userId: string): Insight | null => {
  const insights = getInsights();
  const index = insights.findIndex(ins => ins.id === id);
  if (index !== -1) {
    const insight = insights[index];
    const upIdx = insight.upvotedBy.indexOf(userId);
    if (upIdx === -1) {
      insight.upvotedBy.push(userId);
      insight.upvotes += 1;
      
      // increase author reputation
      const users = getAllUsers();
      const authorIdx = users.findIndex(u => u.name === insight.author);
      if (authorIdx !== -1) {
        users[authorIdx].reputation += 2;
        localStorage.setItem('quantora_users', JSON.stringify(users));
      }
    } else {
      insight.upvotedBy.splice(upIdx, 1);
      insight.upvotes = Math.max(0, insight.upvotes - 1);
    }
    insights[index] = insight;
    saveInsights(insights);
    return insight;
  }
  return null;
};
