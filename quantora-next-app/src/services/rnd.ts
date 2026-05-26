import prisma from '@/lib/prisma';

export interface ChallengeResponse {
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
  joined: boolean;
  submitted: boolean;
}

export async function getChallenges(userEmail?: string): Promise<ChallengeResponse[]> {
  try {
    const challenges = await prisma.rndChallenge.findMany({
      include: {
        joinedUsers: true,
      },
    });

    return challenges.map((ch) => {
      const isJoined = userEmail 
        ? ch.joinedUsers.some((u) => u.email === userEmail) 
        : false;

      return {
        id: ch.id,
        title: ch.title,
        sponsor: ch.sponsor,
        logo: ch.sponsor.split(' ').map((n) => n[0]).join('').toUpperCase(),
        description: ch.description,
        reward: ch.reward,
        repAward: ch.repAward,
        category: ch.category,
        difficulty: ch.difficulty as any,
        teamsCount: ch.teamsCount,
        solutionsCount: ch.solutionsCount,
        joined: isJoined,
        submitted: false, // Standard dynamic default session state
      };
    });
  } catch (error) {
    console.error('getChallenges service error:', error);
    return [];
  }
}

export async function joinChallenge(challengeId: string, email: string): Promise<any> {
  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: `challenger_${Date.now()}`,
          name: email.split('@')[0],
          email,
        },
      });
    }

    const challenge = await prisma.rndChallenge.update({
      where: { id: challengeId },
      data: {
        joinedUsers: {
          connect: { id: user.id },
        },
        teamsCount: {
          increment: 1,
        },
      },
    });

    return challenge;
  } catch (error) {
    console.error('joinChallenge service error:', error);
    throw error;
  }
}

export async function submitChallengeSolution(challengeId: string): Promise<any> {
  try {
    const challenge = await prisma.rndChallenge.update({
      where: { id: challengeId },
      data: {
        solutionsCount: {
          increment: 1,
        },
      },
    });
    return challenge;
  } catch (error) {
    console.error('submitChallengeSolution service error:', error);
    throw error;
  }
}
