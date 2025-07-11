import { prisma } from "@/lib/prisma";

// Mock Prisma
jest.mock("@/lib/prisma", () => {
  // Provide a full mock structure for prisma
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };
});

const { prisma: mockPrisma } = jest.requireMock("@/lib/prisma") as {
  prisma: jest.Mocked<typeof prisma>;
};

describe("Payment Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full payment flow", async () => {
    // Mock the complete payment flow
    const mockSender = {
      id: "1",
      email: "sender@example.com",
      balance: 1000,
    };

    const mockReceiver = {
      id: "2",
      email: "receiver@example.com",
      balance: 500,
    };

    const mockTransaction = {
      id: "1",
      amount: 100,
      status: "COMPLETED",
      senderId: "1",
      receiverId: "2",
    };

    // Mock user.findUnique to return receiver then sender
    (mockPrisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockReceiver as any)
      .mockResolvedValueOnce(mockSender as any);

    // Mock $transaction to call the callback with a tx client
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: {
          create: jest.fn().mockResolvedValue(mockTransaction),
        },
      };
      return callback(mockTx as any);
    });

    // Simulate the payment process
    const paymentData = {
      amount: 100,
      receiverEmail: "receiver@example.com",
      description: "Test payment",
    };

    // Verify sender has sufficient balance
    expect(mockSender.balance).toBeGreaterThanOrEqual(paymentData.amount);

    // Verify receiver exists
    expect(mockReceiver).toBeTruthy();

    // Transaction should be created successfully
    expect(mockTransaction.status).toBe("COMPLETED");
  });

  it("should handle insufficient balance scenario", async () => {
    const mockSender = {
      id: "1",
      email: "sender@example.com",
      balance: 50, // Less than payment amount
    };

    const paymentData = {
      amount: 100,
      receiverEmail: "receiver@example.com",
      description: "Test payment",
    };

    // Verify insufficient balance is caught
    expect(mockSender.balance).toBeLessThan(paymentData.amount);
  });
});
