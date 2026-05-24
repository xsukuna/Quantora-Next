// Quantora Platform Persistent Database Service

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  reputation: number;
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
    ]
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
    comments: []
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
    comments: []
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
  uploadedPapers: []
};

// Initialize localStorage DB if empty
export const initializeDB = () => {
  if (!localStorage.getItem('quantora_papers')) {
    localStorage.setItem('quantora_papers', JSON.stringify(DEFAULT_PAPERS));
  } else {
    // Migration: Update existing paper-5 to use /report.pdf
    try {
      const papers = JSON.parse(localStorage.getItem('quantora_papers') || '[]');
      let updated = false;
      const updatedPapers = papers.map((p: any) => {
        if (p.id === 'paper-5' && (!p.fileUrl || p.fileUrl === '#')) {
          p.fileUrl = '/report.pdf';
          updated = true;
        }
        return p;
      });
      if (updated) {
        localStorage.setItem('quantora_papers', JSON.stringify(updatedPapers));
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (!localStorage.getItem('quantora_user')) {
    localStorage.setItem('quantora_user', JSON.stringify(DEFAULT_USER));
  } else {
    // Migration: Update existing user to use the premium professional avatar
    try {
      const u = JSON.parse(localStorage.getItem('quantora_user') || '{}');
      if (u.id === 'user-1' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
        u.avatarUrl = '/aditya.png';
        localStorage.setItem('quantora_user', JSON.stringify(u));
      }
    } catch (e) {
      console.error(e);
    }
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
  } else {
    // Migration: Update in users list
    try {
      const users = JSON.parse(localStorage.getItem('quantora_users') || '[]');
      let updated = false;
      const updatedUsers = users.map((u: any) => {
        if (u.id === 'user-1' && (!u.avatarUrl || u.avatarUrl.includes('unsplash.com'))) {
          u.avatarUrl = '/aditya.png';
          updated = true;
        }
        return u;
      });
      if (updated) {
        localStorage.setItem('quantora_users', JSON.stringify(updatedUsers));
      }
    } catch (e) {
      console.error(e);
    }
  }
};

// Clear DB to default values
export const resetDB = () => {
  localStorage.setItem('quantora_papers', JSON.stringify(DEFAULT_PAPERS));
  localStorage.setItem('quantora_user', JSON.stringify(DEFAULT_USER));
  return getPapers();
};

export const getPapers = (): Paper[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_papers') || '[]');
};

export const savePapers = (papers: Paper[]) => {
  localStorage.setItem('quantora_papers', JSON.stringify(papers));
};

export const addPaper = (paper: Omit<Paper, 'id' | 'date' | 'status' | 'citations' | 'downloads' | 'likes' | 'upvotedBy' | 'bookmarkedBy' | 'comments' | 'aiSummary'>): Paper => {
  const papers = getPapers();
  
  // High-fidelity Mock AI Summary generation
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
    comments: []
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

export const updatePaperStatus = (id: string, status: 'Approved' | 'Rejected'): Paper | null => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === id);
  if (index !== -1) {
    papers[index].status = status;
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
      reputation: 50 // starting reputation for commenters
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

export const getCurrentUser = (): User | null => {
  initializeDB();
  return JSON.parse(localStorage.getItem('quantora_user') || 'null');
};

export const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('quantora_user', JSON.stringify(user));
    // update in users list as well
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
  
  // High-privilege clearance mapping for developer's direct credentials
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
    // Register new user
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
