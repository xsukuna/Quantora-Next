import prisma from '@/lib/prisma';

export interface PaperResponse {
  id: string;
  title: string;
  abstract: string;
  category: string;
  author: string;
  institution: string;
  country: string;
  tags: string[];
  date: string;
  downloads: number;
  citations: number;
  likes: number;
  trustLabel: string;
  peerReviewed: boolean;
  fileUrl: string;
}

const labelMapping: Record<string, string> = {
  VERIFIED_RESEARCH: 'Verified Research',
  COMMUNITY_REVIEWED: 'Community Reviewed',
  INDEPENDENT_SUBMISSION: 'Independent Submission',
};

export async function getAllPapers(): Promise<PaperResponse[]> {
  try {
    const papers = await prisma.paper.findMany({
      include: {
        author: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return papers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      category: paper.category,
      author: paper.author.name,
      institution: paper.institution,
      country: paper.country,
      tags: paper.tags.split(',').map((t) => t.trim()).filter(Boolean),
      date: paper.date.toISOString().split('T')[0],
      downloads: paper.downloads,
      citations: paper.citations,
      likes: paper.likes,
      trustLabel: labelMapping[paper.trustLabel] || paper.trustLabel,
      peerReviewed: paper.peerReviewed,
      fileUrl: paper.fileUrl,
    }));
  } catch (error) {
    console.error('getAllPapers service error:', error);
    return [];
  }
}

export async function getPaperById(id: string): Promise<PaperResponse | null> {
  try {
    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!paper) return null;

    return {
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      category: paper.category,
      author: paper.author.name,
      institution: paper.institution,
      country: paper.country,
      tags: paper.tags.split(',').map((t) => t.trim()).filter(Boolean),
      date: paper.date.toISOString().split('T')[0],
      downloads: paper.downloads,
      citations: paper.citations,
      likes: paper.likes,
      trustLabel: labelMapping[paper.trustLabel] || paper.trustLabel,
      peerReviewed: paper.peerReviewed,
      fileUrl: paper.fileUrl,
    };
  } catch (error) {
    console.error('getPaperById service error:', error);
    return null;
  }
}

export async function createPaper(data: {
  title: string;
  abstract: string;
  category: string;
  institution: string;
  country: string;
  tags: string[];
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  authorEmail: string;
  trustLabel?: string;
  aiSummary?: string;
}): Promise<any> {
  try {
    // Resolve user by email, or create default
    let user = await prisma.user.findUnique({
      where: { email: data.authorEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `author_${Date.now()}`,
          name: data.authorEmail.split('@')[0],
          email: data.authorEmail,
        },
      });
    }

    const paper = await prisma.paper.create({
      data: {
        title: data.title,
        abstract: data.abstract,
        category: data.category,
        institution: data.institution,
        country: data.country,
        tags: data.tags.join(','),
        fileUrl: data.fileUrl || '/report.pdf',
        fileName: data.fileName || 'manuscript.pdf',
        fileSize: data.fileSize || '420 KB',
        authorId: user.id,
        trustLabel: data.trustLabel || 'INDEPENDENT_SUBMISSION',
        status: 'APPROVED', // Approve automatically for instant dynamic demo feedback
        aiSummary: data.aiSummary,
      },
    });

    return paper;
  } catch (error) {
    console.error('createPaper service error:', error);
    throw error;
  }
}

export async function upvotePaper(id: string): Promise<number | null> {
  try {
    const paper = await prisma.paper.update({
      where: { id },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    return paper.likes;
  } catch (error) {
    console.error('upvotePaper service error:', error);
    return null;
  }
}

export async function addPaperComment(paperId: string, email: string, text: string): Promise<any> {
  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
        },
      });
    }

    const comment = await prisma.comment.create({
      data: {
        paperId,
        userId: user.id,
        text,
      },
    });

    return comment;
  } catch (error) {
    console.error('addPaperComment service error:', error);
    return null;
  }
}

export async function updatePaperStatus(id: string, status: string): Promise<any> {
  try {
    const paper = await prisma.paper.update({
      where: { id },
      data: {
        status: status.toUpperCase() === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      },
    });
    return paper;
  } catch (error) {
    console.error('updatePaperStatus service error:', error);
    return null;
  }
}

export async function deletePaper(id: string): Promise<boolean> {
  try {
    await prisma.paper.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('deletePaper service error:', error);
    return false;
  }
}

export async function updatePaperMetadata(
  id: string,
  data: { title: string; abstract: string; tags: string[] }
): Promise<any> {
  try {
    const paper = await prisma.paper.update({
      where: { id },
      data: {
        title: data.title,
        abstract: data.abstract,
        tags: data.tags.join(','),
      },
    });
    return paper;
  } catch (error) {
    console.error('updatePaperMetadata service error:', error);
    return null;
  }
}

