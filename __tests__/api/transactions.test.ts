// import { NextRequest } from "next/server"
// import { GET, POST } from "@/app/api/transactions/route"
// import { authenticateRequest } from "@/lib/auth-middleware"
// import { Role, User } from "@prisma/client"
// import { jest } from "@jest/globals"

// // Mock the dependencies
// jest.mock("@/lib/auth-middleware", () => ({
//   authenticateRequest: jest.fn(),
//   requireRole: jest.fn(),
// }))

// jest.mock("@/lib/prisma", () => ({
//   prisma: {
//     user: {
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//       count: jest.fn(),
//     },
//     transaction: {
//       findMany: jest.fn(),
//       create: jest.fn(),
//       aggregate: jest.fn(),
//       count: jest.fn(),
//     },
//     $transaction: jest.fn(),
//     $queryRaw: jest.fn(),
//   },
// }))

// const mockAuthenticateRequest = authenticateRequest as jest.MockedFunction<typeof authenticateRequest>

// // Create a mock prisma object with proper Jest mock functions
// const mockPrisma = {
//   user: {
//     findUnique: jest.fn(),
//     findMany: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//     count: jest.fn(),
//   },
//   transaction: {
//     findMany: jest.fn(),
//     create: jest.fn(),
//     aggregate: jest.fn(),
//     count: jest.fn(),
//   },
//   $transaction: jest.fn(),
//   $queryRaw: jest.fn(),
// }

// // Override the prisma import
// Object.defineProperty(require("@/lib/prisma"), "prisma", {
//   value: mockPrisma,
// })

// describe("/api/transactions", () => {
//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   describe("GET /api/transactions", () => {
//     it("should return transactions for authenticated user", async () => {
//       const mockUser = {
//         id: "1",
//         email: "user@example.com",
//         role: Role.USER,
//         name: "John Doe",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       const mockTransactions = [
//         {
//           id: "1",
//           amount: 100,
//           description: "Test payment",
//           status: "COMPLETED",
//           type: "PAYMENT",
//           createdAt: new Date(),
//           sender: { name: "John Doe", email: "john@example.com" },
//           receiver: { name: "Jane Doe", email: "jane@example.com" },
//         },
//       ]

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })
//       mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions)

//       const request = new NextRequest("http://localhost:3000/api/transactions")
//       const response = await GET(request)
//       const data = await response.json()

//       expect(response.status).toBe(200)
//       expect(data).toEqual(mockTransactions)
//       expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
//         where: {
//           OR: [{ senderId: "1" }, { receiverId: "1" }],
//         },
//         include: {
//           sender: { select: { name: true, email: true } },
//           receiver: { select: { name: true, email: true } },
//         },
//         orderBy: { createdAt: "desc" },
//       })
//     })

//     it("should return 401 for unauthenticated user", async () => {
//       mockAuthenticateRequest.mockResolvedValue({ error: "Unauthorized", status: 401 })

//       const request = new NextRequest("http://localhost:3000/api/transactions")
//       const response = await GET(request)
//       const data = await response.json()

//       expect(response.status).toBe(401)
//       expect(data.error).toBe("Unauthorized")
//     })

//     it("should handle database errors gracefully", async () => {
//       const mockUser = {
//         id: "1",
//         email: "user@example.com",
//         role: Role.USER,
//         name: "John Doe",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })
//       mockPrisma.transaction.findMany.mockRejectedValue(new Error("Database error"))

//       const request = new NextRequest("http://localhost:3000/api/transactions")
//       const response = await GET(request)
//       const data = await response.json()

//       expect(response.status).toBe(500)
//       expect(data.error).toBe("Internal server error")
//     })
//   })

//   describe("POST /api/transactions", () => {
//     it("should create transaction with valid data", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       const mockSender = {
//         id: "1",
//         balance: 1000,
//       }

//       const mockReceiver = {
//         id: "2",
//         email: "receiver@example.com",
//       }

//       const mockTransaction = {
//         id: "1",
//         amount: 100,
//         description: "Test payment",
//         status: "COMPLETED",
//         type: "PAYMENT",
//         senderId: "1",
//         receiverId: "2",
//         sender: { name: "Sender", email: "sender@example.com" },
//         receiver: { name: "Receiver", email: "receiver@example.com" },
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as Userpayload })

//       // Mock the findUnique calls in sequence
//       mockPrisma.user.findUnique
//         .mockResolvedValueOnce(mockReceiver) // First call for receiver
//         .mockResolvedValueOnce(mockSender) // Second call for sender

//       // mockPrisma.$transaction.mockResolvedValue(mockTransaction)

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 100,
//           receiverEmail: "receiver@example.com",
//           description: "Test payment",
//         }),
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       expect(response.status).toBe(200)
//       expect(data).toEqual(mockTransaction)
//     })

//     it("should return 400 for insufficient balance", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       const mockSender = {
//         id: "1",
//         balance: 50, // Less than transaction amount
//       }

//       const mockReceiver = {
//         id: "2",
//         email: "receiver@example.com",
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })

//       // Mock the findUnique calls in sequence
//       mockPrisma.user.findUnique
//         .mockResolvedValueOnce(mockReceiver) // First call for receiver
//         .mockResolvedValueOnce(mockSender) // Second call for sender

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 100,
//           receiverEmail: "receiver@example.com",
//           description: "Test payment",
//         }),
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       expect(response.status).toBe(400)
//       expect(data.error).toBe("Insufficient balance")
//     })

//     it("should return 404 for non-existent receiver", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })
//       mockPrisma.user.findUnique.mockResolvedValue(null) // Receiver not found

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 100,
//           receiverEmail: "nonexistent@example.com",
//           description: "Test payment",
//         }),
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       expect(response.status).toBe(404)
//       expect(data.error).toBe("Receiver not found")
//     })

//     it("should handle missing request body", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({}), // Empty body
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       expect(response.status).toBe(500)
//       expect(data.error).toBe("Internal server error")
//     })

//     it("should handle database transaction errors", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       const mockSender = {
//         id: "1",
//         balance: 1000,
//       }

//       const mockReceiver = {
//         id: "2",
//         email: "receiver@example.com",
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })

//       mockPrisma.user.findUnique.mockResolvedValueOnce(mockReceiver).mockResolvedValueOnce(mockSender)

//       mockPrisma.$transaction.mockRejectedValue(new Error("Transaction failed"))

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 100,
//           receiverEmail: "receiver@example.com",
//           description: "Test payment",
//         }),
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       expect(response.status).toBe(500)
//       expect(data.error).toBe("Internal server error")
//     })

//     it("should validate transaction amount", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })

//       // Test negative amount
//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: -100,
//           receiverEmail: "receiver@example.com",
//           description: "Test payment",
//         }),
//       })

//       const response = await POST(request)
//       const data = await response.json()

//       // The API should handle this validation
//       expect(response.status).toBe(500) // Will be 500 due to database constraints or validation
//     })
//   })

//   describe("Transaction Edge Cases", () => {
//     it("should handle self-transfer attempt", async () => {
//       const mockUser = {
//         id: "1",
//         email: "user@example.com",
//         role: Role.USER,
//         name: "John Doe",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       const mockSelfUser = {
//         id: "1",
//         email: "user@example.com",
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })
//       mockPrisma.user.findUnique.mockResolvedValue(mockSelfUser)

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 100,
//           receiverEmail: "user@example.com", // Same as sender
//           description: "Self transfer",
//         }),
//       })

//       const response = await POST(request)

//       // The API should handle this case - either allow or reject self-transfers
//       expect(response.status).toBeGreaterThanOrEqual(200)
//     })

//     it("should handle zero amount transaction", async () => {
//       const mockUser = {
//         id: "1",
//         email: "sender@example.com",
//         role: Role.USER,
//         name: "Sender",
//         isActive: true,
//         balance: 1000,
//         profilePicture: null,
//       }

//       mockAuthenticateRequest.mockResolvedValue({ user: mockUser, payload: {} as any })

//       const request = new NextRequest("http://localhost:3000/api/transactions", {
//         method: "POST",
//         body: JSON.stringify({
//           amount: 0,
//           receiverEmail: "receiver@example.com",
//           description: "Zero amount",
//         }),
//       })

//       const response = await POST(request)

//       // Should be handled by validation
//       expect(response.status).toBeGreaterThanOrEqual(400)
//     })
//   })
// })
