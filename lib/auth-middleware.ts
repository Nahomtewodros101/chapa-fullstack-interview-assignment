import type { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "No token provided", status: 401 };
    }

    const token = authHeader.substring(7);

    if (!token || token === "null" || token === "undefined") {
      return { error: "Invalid token", status: 401 };
    }

    const payload = verifyToken(token);

    if (!payload) {
      return { error: "Invalid token", status: 401 };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        balance: true,
        profilePicture: true,
      },
    });

    if (!user || !user.isActive) {
      return { error: "User not found or inactive", status: 401 };
    }

    return { user, payload };
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: { role: string }) => {
    if (!allowedRoles.includes(user.role)) {
      return { error: "Insufficient permissions", status: 403 };
    }
    return null;
  };
}
