import { type NextRequest, NextResponse } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;

    // Check if user has super admin privileges
    const roleCheck = requireRole(["SUPER_ADMIN"])(user);
    if (roleCheck) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
      );
    }

    const [totalUsers, activeUsers, totalTransactions, totalPayments] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.transaction.count(),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { status: "COMPLETED" },
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalTransactions,
      totalPayments: totalPayments._sum.amount || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
