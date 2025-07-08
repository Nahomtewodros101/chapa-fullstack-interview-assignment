import { type NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email-service";

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
    console.error("Transaction fetch error:", error);
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

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!receiverEmail) {
      return NextResponse.json(
        { error: "Receiver email is required" },
        { status: 400 }
      );
    }

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

    if (receiver.id === user.id) {
      return NextResponse.json(
        { error: "Cannot send payment to yourself" },
        { status: 400 }
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

    // Perform database transaction (without email sending)
    const result = await prisma.$transaction(
      async (tx) => {
        // Update sender balance
        const updatedSender = await tx.user.update({
          where: { id: user.id },
          data: { balance: { decrement: amount } },
        });

        // Update receiver balance
        const updatedReceiver = await tx.user.update({
          where: { id: receiver.id },
          data: { balance: { increment: amount } },
        });

        // Create transaction record
        const newTransaction = await tx.transaction.create({
          data: {
            amount,
            description: description || "Payment",
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

        return {
          transaction: newTransaction,
          senderBalance: updatedSender.balance,
          receiverBalance: updatedReceiver.balance,
        };
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );

    // Send email notifications AFTER the database transaction completes
    try {
      // Email to sender
      await emailService.sendTransactionNotification(
        sender.email,
        sender.name,
        {
          amount,
          type: "sent",
          otherParty: receiver.name,
          description: description || "Payment",
          balance: result.senderBalance,
        }
      );

      // Email to receiver
      await emailService.sendTransactionNotification(
        receiver.email,
        receiver.name,
        {
          amount,
          type: "received",
          otherParty: sender.name,
          description: description || "Payment",
          balance: result.receiverBalance,
        }
      );

      console.log("📧 Transaction notification emails sent successfully");
    } catch (emailError) {
      console.error("📧 Failed to send transaction emails:", emailError);
      // Don't fail the API call if email fails - transaction already completed
    }

    return NextResponse.json(result.transaction);
  } catch (error) {
    console.error("Transaction creation error:", error);

    // Handle specific Prisma errors
    if (typeof error === "object" && error !== null && "code" in error) {
      const err = error as { code?: string };
      if (err.code === "P2028") {
        return NextResponse.json(
          { error: "Transaction timeout. Please try again." },
          { status: 408 }
        );
      }

      if (err.code === "P2002") {
        return NextResponse.json(
          { error: "Transaction conflict. Please try again." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
