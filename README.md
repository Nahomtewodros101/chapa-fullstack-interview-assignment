💸 Chapa Payment Solutions – Payment Processing Simulation
This repository contains a professional-grade test assignment showcasing a modular and reliable approach to digital payment processing. Built to emulate real-world transaction logic, it demonstrates a secure, verifiable, and test-driven payment flow using modern TypeScript tooling.
🔗 Live Version  https://chapa-fullstack-interview-assignmen.vercel.app/login
From balance verification to transaction creation, this project simulates the key operations of a fintech backend — while keeping things robust, testable, and beautifully simple.

🧭 Table of Contents
🧩 Overview

✨ Features

🛠️ Technologies Used

⚙️ Setup Instructions

🧪 Testing

🧠 Code Architecture & Logic

📌 Assumptions

🚀 Future Enhancements

📫 Contact

📖 Overview
This project simulates a peer-to-peer digital payment flow, focusing on:

Balance verification before payment.

Receiver validation via email.

Transaction creation with robust error handling.

Atomicity via simulated Prisma transactions.

Ideal for evaluating backend engineering skills in handling real-life edge cases like insufficient balance, data consistency, and isolated testing without a real database.

✨ Features
✅ Validates sender's balance before initiating a transaction.

✅ Verifies receiver existence by email.

✅ Creates a transaction with metadata: amount, status, senderId, receiverId.

✅ Handles edge cases like insufficient balance cleanly.

✅ Mocks Prisma operations to ensure fast, isolated unit tests.

🛠️ Technologies Used
Tech	Purpose
TypeScript	Type-safe backend development
Node.js	Runtime environment
Prisma	ORM for modeling database (mocked)
Jest	Testing framework with mocking support

⚙️ Setup Instructions
To run this project locally:

Clone the repository

bash
Copy
Edit
git clone https://github.com/Nahomtewodros101/chapa-fullstack-interview-assignment.git
Install dependencies

bash
Copy
Edit
npm install
Environment Setup

No need for an actual database — Prisma operations are mocked for test isolation. Just make sure you have Node.js and npm installed.

Run Tests

bash
Copy
Edit
npm test
🧪 Testing
The test suite lives in the /tests directory and uses Jest to validate payment flows through two core cases:

1. ✅ Successful Payment Flow
Sender has sufficient balance.

Receiver exists.

Transaction status: COMPLETED.

2. ❌ Insufficient Balance Scenario
Sender lacks the required balance.

System halts the transaction with proper error detection.

📂 Mocked Prisma Methods
ts
Copy
Edit
jest.mock("@/lib/prisma", () => ({
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
}));
These mocks prevent real database writes and make your test suite blazing fast and reliable.

🧠 Code Architecture & Logic
The code simulates a payment transaction with logical steps:

Balance Check

ts
Copy
Edit
expect(mockSender.balance).toBeGreaterThanOrEqual(paymentData.amount);
Receiver Validation

ts
Copy
Edit
expect(mockReceiver).toBeTruthy();
Transaction Completion

ts
Copy
Edit
expect(mockTransaction.status).toBe("COMPLETED");
Insufficient Balance Edge Case

ts
Copy
Edit
expect(mockSender.balance).toBeLessThan(paymentData.amount);
All critical paths are tested to ensure safe and consistent behavior.

📌 Assumptions
💱 A single currency system is assumed.

🧾 User and Transaction models exist in Prisma schema.

🔐 Transactions are atomic, simulated via $transaction.

⚠️ Concurrency and race conditions are not handled in this scope.

🚀 Future Enhancements
Next-level upgrades you could implement:

🔄 Concurrency control (e.g. locks or balance versioning).

🌐 Real database integration with Prisma and  Mongodb.

🧾 Input validation for email and amount fields.

🔁 Retry strategies for failed transactions.

📣 Enhanced error messaging with custom error classes.

📫 Contact
For questions, feedback, or collaboration requests:
Developer: Nahom Tewodros
📧 Email: nahomtewodrosm@gmail.com

✨ Final Note
This isn't just another test assignment. It’s a thoughtful demonstration of engineering finesse — balancing practicality, testability, and clarity. If you're hiring for backend skills, you're in good hands here. ✨
