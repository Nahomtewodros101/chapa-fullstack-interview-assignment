import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user is super admin
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    // Fetch all data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
    });

    // Create CSV content
    const usersCsv = [
      "ID,Name,Email,Role,Active,Balance,Created,Updated",
      ...users.map(
        (user) =>
          `${user.id},"${user.name}","${user.email}",${user.role},${
            user.isActive
          },${
            user.balance
          },${user.createdAt.toISOString()},${user.updatedAt.toISOString()}`
      ),
    ].join("\n");

    const transactionsCsv = [
      "ID,Amount,Description,Status,Type,Sender,Receiver,Created",
      ...transactions.map(
        (tx) =>
          `${tx.id},${tx.amount},"${tx.description || ""}",${tx.status},${
            tx.type
          },"${tx.sender?.name || ""}","${
            tx.receiver?.name || ""
          }",${tx.createdAt.toISOString()}`
      ),
    ].join("\n");

    const fullCsv = `USERS\n${usersCsv}\n\nTRANSACTIONS\n${transactionsCsv}`;

    return new NextResponse(fullCsv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="system-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
