import { prisma } from "../../lib/prisma";

const getAdminStatsFromDB = async () => {
  const [totalUsers, totalIdeas, totalPayments] = await Promise.all([
    prisma.user.count({
      where: {
        isDeleted: false,
      },
    }),
    prisma.idea.count(),
    prisma.payment.count({
      where: {
        status: "COMPLETED",
      },
    }),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const recentIdeas = await prisma.idea.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  // Combine and sort recent activity
  const recentActivity = [
    ...recentUsers.map((u) => ({
      id: u.id,
      type: "USER_JOINED",
      message: `New user joined: ${u.name}`,
      timestamp: u.createdAt,
    })),
    ...recentIdeas.map((i) => ({
      id: i.id,
      type: "IDEA_CREATED",
      message: `New idea created: ${i.title} by ${i.author.name}`,
      timestamp: i.createdAt,
    })),
    ...recentPayments.map((p) => ({
      id: p.id,
      type: "PAYMENT_RECEIVED",
      message: `Payment received: $${p.amount / 100} from ${p.user.name}`,
      timestamp: p.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 10);

  return {
    totalUsers,
    totalIdeas,
    totalPayments,
    recentActivity,
  };
};

export const AdminService = {
  getAdminStatsFromDB,
};
