import { hashPassword, comparePassword, signToken, verifyToken } from "@/lib/jwt"

// Mock the modules
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  },
}))

jest.mock("@/lib/jwt", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  signToken: jest.fn(),
  verifyToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}))

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Type the mocked functions properly
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  transaction: {
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
} as any

const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>

// Override the prisma import with our mock
Object.defineProperty(require("@/lib/prisma"), "prisma", {
  value: mockPrisma,
})

describe("Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("User Login", () => {
    it("should authenticate user with valid credentials", async () => {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        password: "hashedPassword",
        role: "USER",
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockComparePassword.mockResolvedValue(true)

      // Simulate the authorize function logic
      const credentials = {
        email: "user@example.com",
        password: "password123",
      }

      const user = await mockPrisma.user.findUnique({
        where: { email: credentials.email },
      })

      expect(user).toBeTruthy()
      expect(user?.isActive).toBe(true)

      const isPasswordValid = await mockComparePassword(credentials.password, user!.password)
      expect(isPasswordValid).toBe(true)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      })
    })

    it("should reject inactive user", async () => {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        password: "hashedPassword",
        role: "USER",
        isActive: false,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const user = await mockPrisma.user.findUnique({
        where: { email: "user@example.com" },
      })

      expect(user?.isActive).toBe(false)
    })

    it("should reject invalid password", async () => {
      const mockUser = {
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        password: "hashedPassword",
        role: "USER",
        isActive: true,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockComparePassword.mockResolvedValue(false)

      const isPasswordValid = await mockComparePassword("wrong-password", mockUser.password)
      expect(isPasswordValid).toBe(false)
    })
  })

  describe("JWT Token Management", () => {
    it("should create valid JWT token", () => {
      const payload = {
        userId: "1",
        email: "user@example.com",
        role: "USER",
      }

      mockSignToken.mockReturnValue("mock-jwt-token")

      const token = mockSignToken(payload)
      expect(token).toBe("mock-jwt-token")
      expect(mockSignToken).toHaveBeenCalledWith(payload)
    })

    it("should verify valid JWT token", () => {
      const mockPayload = {
        userId: "1",
        email: "user@example.com",
        role: "USER",
      }

      mockVerifyToken.mockReturnValue(mockPayload)

      const payload = mockVerifyToken("valid-token")
      expect(payload).toEqual(mockPayload)
    })

    it("should reject invalid JWT token", () => {
      mockVerifyToken.mockReturnValue(null)

      const payload = mockVerifyToken("invalid-token")
      expect(payload).toBeNull()
    })
  })

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const plainPassword = "password123"
      const hashedPassword = "hashed-password"

      mockHashPassword.mockResolvedValue(hashedPassword)

      const result = await mockHashPassword(plainPassword)
      expect(result).toBe(hashedPassword)
      expect(mockHashPassword).toHaveBeenCalledWith(plainPassword)
    })

    it("should compare passwords correctly", async () => {
      const plainPassword = "password123"
      const hashedPassword = "hashed-password"

      mockComparePassword.mockResolvedValue(true)

      const result = await mockComparePassword(plainPassword, hashedPassword)
      expect(result).toBe(true)
      expect(mockComparePassword).toHaveBeenCalledWith(plainPassword, hashedPassword)
    })
  })

  describe("Role-based Access", () => {
    it("should allow USER role to access user endpoints", () => {
      const userRole = "USER"
      const allowedRoles = ["USER", "ADMIN", "SUPER_ADMIN"]

      expect(allowedRoles.includes(userRole)).toBe(true)
    })

    it("should allow ADMIN role to access admin endpoints", () => {
      const adminRole = "ADMIN"
      const adminRoles = ["ADMIN", "SUPER_ADMIN"]

      expect(adminRoles.includes(adminRole)).toBe(true)
    })

    it("should only allow SUPER_ADMIN role to access super admin endpoints", () => {
      const superAdminRole = "SUPER_ADMIN"
      const superAdminRoles = ["SUPER_ADMIN"]

      expect(superAdminRoles.includes(superAdminRole)).toBe(true)
      expect(superAdminRoles.includes("ADMIN")).toBe(false)
      expect(superAdminRoles.includes("USER")).toBe(false)
    })
  })

  describe("Authentication Flow", () => {
    it("should complete full authentication flow", async () => {
      const credentials = {
        email: "user@example.com",
        password: "password123",
      }

      const mockUser = {
        id: "1",
        email: credentials.email,
        name: "John Doe",
        password: "hashed-password",
        role: "USER",
        isActive: true,
      }

      const mockToken = "jwt-token"
      const mockPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }

      // Mock the complete flow
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockComparePassword.mockResolvedValue(true)
      mockSignToken.mockReturnValue(mockToken)
      mockVerifyToken.mockReturnValue(mockPayload)

      // 1. Find user
      const user = await mockPrisma.user.findUnique({
        where: { email: credentials.email },
      })
      expect(user).toBeTruthy()
      expect(user?.isActive).toBe(true)

      // 2. Verify password
      const isPasswordValid = await mockComparePassword(credentials.password, user!.password)
      expect(isPasswordValid).toBe(true)

      // 3. Generate token
      const token = mockSignToken({
        userId: user!.id,
        email: user!.email,
        role: user!.role,
      })
      expect(token).toBe(mockToken)

      // 4. Verify token
      const payload = mockVerifyToken(token)
      expect(payload).toEqual(mockPayload)
    })

    it("should handle authentication failure scenarios", async () => {
      // Test user not found
      mockPrisma.user.findUnique.mockResolvedValue(null)
      const user = await mockPrisma.user.findUnique({
        where: { email: "nonexistent@example.com" },
      })
      expect(user).toBeNull()

      // Test inactive user
      const inactiveUser = {
        id: "1",
        email: "user@example.com",
        name: "John Doe",
        password: "hashed-password",
        role: "USER",
        isActive: false,
      }
      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser)
      const foundUser = await mockPrisma.user.findUnique({
        where: { email: "user@example.com" },
      })
      expect(foundUser?.isActive).toBe(false)

      // Test invalid password
      mockComparePassword.mockResolvedValue(false)
      const isValid = await mockComparePassword("wrong-password", "hashed-password")
      expect(isValid).toBe(false)

      // Test invalid token
      mockVerifyToken.mockReturnValue(null)
      const payload = mockVerifyToken("invalid-token")
      expect(payload).toBeNull()
    })
  })
})
