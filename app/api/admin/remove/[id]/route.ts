import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const adminId = params.id;

    // Check if admin exists and is not a super admin
    const adminToRemove = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminToRemove) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (adminToRemove.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot remove super admin" },
        { status: 403 }
      );
    }

    if (adminToRemove.role !== "ADMIN") {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    // Change role to USER instead of deleting
    await prisma.user.update({
      where: { id: adminId },
      data: { role: "USER" },
    });

    return NextResponse.json({ message: "Admin removed successfully" });
  } catch (error) {
    console.error("Admin removal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
