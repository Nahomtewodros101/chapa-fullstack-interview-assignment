import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/jwt"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Register API called")

    const body = await request.json()
    console.log("Request body received:", {
      email: body.email,
      name: body.name,
      hasPassword: !!body.password,
    })

    const { email, password, name } = body

    if (!email || !password || !name) {
      console.log("Missing required fields")
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    console.log("Checking if user already exists:", email)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    console.log("Hashing password")

    // Hash password
    const hashedPassword = await hashPassword(password)

    console.log("Creating new user")

    // Create new user with proper starting balance
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // Default role
        balance: 1000, // Starting balance
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        balance: true,
        isActive: true,
        profilePicture: true,
      },
    })

    console.log("User created successfully:", { id: newUser.id, email: newUser.email, balance: newUser.balance })

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(newUser.email, newUser.name)
      console.log("📧 Welcome email sent successfully")
    } catch (emailError) {
      console.error("📧 Failed to send welcome email:", emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: "User registered successfully",
      user: newUser,
    })
  } catch (error) {
    console.error("Registration error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "Unknown error")

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
      { status: 500 },
    )
  }
}
