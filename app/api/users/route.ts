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

    // Check if user has admin privileges
    const roleCheck = requireRole(["ADMIN", "SUPER_ADMIN"])(user);
    if (roleCheck) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: roleCheck.status }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        balance: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        sentTransactions: {
          select: {
            id: true,
            amount: true,
            description: true,
            status: true,
            type: true,
            createdAt: true,
            receiver: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 transactions
        },
        receivedTransactions: {
          select: {
            id: true,
            amount: true,
            description: true,
            status: true,
            type: true,
            createdAt: true,
            sender: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Latest 10 transactions
        },
        _count: {
          select: {
            sentTransactions: true,
            receivedTransactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
