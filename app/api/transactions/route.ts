import { type NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
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

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);

    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    const { amount, receiverEmail, description } = await request.json();

    // Find receiver
    const receiver = await prisma.user.findUnique({
      where: { email: receiverEmail },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Check sender balance
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!sender || sender.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create transaction and update balances
    const transaction = await prisma.$transaction(async (tx) => {
      // Update sender balance
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: amount } },
      });

      // Update receiver balance
      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      return tx.transaction.create({
        data: {
          amount,
          description,
          status: "COMPLETED",
          type: "PAYMENT",
          senderId: user.id,
          receiverId: receiver.id,
        },
        include: {
          sender: { select: { name: true, email: true } },
          receiver: { select: { name: true, email: true } },
        },
      });
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
