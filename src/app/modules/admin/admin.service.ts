import { prisma } from "../../lib/prisma";

const getAdminStats = async () => {
  const [totalUsers, totalIdeas, totalRevenue, activeSessions] = await Promise.all([
    prisma.user.count(),
    prisma.idea.count(),
    prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalIdeas,
    totalPayments: totalRevenue._sum.amount || 0,
    activeSessions,
  };
};

export const AdminService = {
  getAdminStats,
};
