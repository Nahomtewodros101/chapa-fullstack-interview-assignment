import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/jwt";
import { emailService } from "@/lib/email-service";

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");

    const body = await request.json();
    console.log("Request body received:", {
      email: body.email,
      hasPassword: !!body.password,
    });

    const { email, password } = body;

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Attempting to find user with email:", email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(
      "User found:",
      user
        ? {
            id: user.id,
            email: user.email,
            isActive: user.isActive,
            balance: user.balance,
          }
        : null
    );

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log("User is inactive");
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    console.log("Verifying password");

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Generating JWT token");

    // Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("Token generated successfully");

    // Send login notification email
    try {
      await emailService.sendLoginNotification(
        user.email,
        user.name,
        new Date()
      );
      console.log("📧 Login notification sent successfully");
    } catch (emailError) {
      console.error("📧 Failed to send login notification:", emailError);
      // Don't fail login if email fails
    }

    // Return user data and token
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: user.balance,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Unknown error"
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}
