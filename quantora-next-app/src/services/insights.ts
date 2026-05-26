import prisma from '@/lib/prisma';

export interface InsightResponse {
  id: string;
  author: string;
  avatar: string;
  role: string;
  reputation: number;
  content: string;
  tags: string[];
  category: string;
  timestamp: string;
  upvotes: number;
  commentsCount: number;
  upvotedByUser: boolean; // Mock-linked on client
}

export async function getInsightsFeed(): Promise<InsightResponse[]> {
  try {
    const insights = await prisma.insight.findMany({
      include: {
        author: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return insights.map((ins) => ({
      id: ins.id,
      author: ins.author.name,
      avatar: ins.author.name.split(' ').map((n) => n[0]).join('').toUpperCase(),
      role: ins.author.role === 'ADMIN' ? 'Lead Architect' : 'Fellow Analyst',
      reputation: ins.author.reputation,
      content: ins.content,
      tags: ins.tags.split(',').map((t) => t.trim()).filter(Boolean),
      category: ins.category,
      timestamp: 'Recently active', // Standard friendly display
      upvotes: ins.upvotesCount,
      commentsCount: ins.commentsCount,
      upvotedByUser: false,
    }));
  } catch (error) {
    console.error('getInsightsFeed service error:', error);
    return [];
  }
}

export async function createInsight(data: {
  authorEmail: string;
  content: string;
  tags: string[];
  category: string;
}): Promise<any> {
  try {
    let user = await prisma.user.findUnique({
      where: { email: data.authorEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `analyst_${Date.now()}`,
          name: data.authorEmail.split('@')[0],
          email: data.authorEmail,
        },
      });
    }

    const insight = await prisma.insight.create({
      data: {
        authorId: user.id,
        content: data.content,
        tags: data.tags.join(','),
        category: data.category,
      },
    });

    return insight;
  } catch (error) {
    console.error('createInsight service error:', error);
    throw error;
  }
}

export async function upvoteInsight(id: string): Promise<number | null> {
  try {
    const insight = await prisma.insight.update({
      where: { id },
      data: {
        upvotesCount: {
          increment: 1,
        },
      },
    });
    return insight.upvotesCount;
  } catch (error) {
    console.error('upvoteInsight service error:', error);
    return null;
  }
}
