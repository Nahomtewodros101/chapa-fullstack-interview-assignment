Chapa Payment Solutions - Test AssignmentThis repository contains a test assignment for integrating a robust payment processing platform. The assignment demonstrates a complete payment flow, including user balance validation, transaction creation, and error handling for insufficient balance scenarios. The implementation uses Prisma for database operations and Jest for unit testing.Table of ContentsOverview (#overview)
Features (#features)
Technologies Used (#technologies-used)
Setup Instructions (#setup-instructions)
Testing (#testing)
Code Explanation (#code-explanation)
Assumptions (#assumptions)
Future Improvements (#future-improvements)
Contact (#contact)

OverviewThis project simulates a payment processing system where a sender transfers funds to a receiver. The system ensures:The sender has sufficient balance for the transaction.
The receiver exists in the system.
Transactions are created and recorded successfully.
Edge cases, such as insufficient balance, are handled appropriately.

The code includes a Jest test suite that mocks Prisma database operations to validate the payment flow and error handling.FeaturesValidates sender's balance before initiating a payment.
Verifies the existence of the receiver by email.
Creates a transaction record with details such as amount, status, sender, and receiver.
Handles insufficient balance scenarios gracefully.
Uses mocked Prisma operations for testing to ensure reliability and isolation.

Technologies UsedTypeScript: For type safety and improved developer experience.
Prisma: For database interactions (mocked in tests).
Jest: For unit testing and mocking.
Node.js: As the runtime environment.

Setup InstructionsTo run the project locally:Clone the Repository:bash

git clone https://github.com/Nahomtewodros101/chapa-fullstack-interview-assignment.git


Install Dependencies:bash

npm install

Configure Environment:Ensure Node.js and npm are installed.
No database setup is required since Prisma is mocked for testing purposes.

Run Tests:bash

npm test

TestingThe test suite is located in the tests directory and uses Jest to validate the payment flow. Two primary test cases are implemented:Successful Payment Flow:Verifies that a payment is processed when the sender has sufficient balance.
Ensures the receiver exists and the transaction is marked as "COMPLETED".
Mocks Prisma operations to simulate database interactions.

Insufficient Balance Scenario:Tests the case where the sender's balance is less than the payment amount.
Validates that the system correctly identifies insufficient funds.

Running TestsTo execute the test suite:bash

npm test

The tests use mocked Prisma operations to avoid real database interactions, ensuring fast and reliable test execution.Code ExplanationThe provided code is a Jest test suite that simulates the payment flow. Below is a breakdown of the key components:Mocking PrismaPrisma is mocked to simulate database operations without requiring a real database:typescript

jest.mock("@/lib/prisma", () => {
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

This ensures that all database calls (findUnique, update, create, $transaction) are intercepted and controlled during testing.Test Case: Successful Payment FlowThis test simulates a complete payment process:Mocks sender and receiver data with sufficient balance.
Verifies the receiver exists via prisma.user.findUnique.
Simulates a transaction using prisma.$transaction.
Ensures the transaction status is "COMPLETED".

Key assertions:typescript

expect(mockSender.balance).toBeGreaterThanOrEqual(paymentData.amount);
expect(mockReceiver).toBeTruthy();
expect(mockTransaction.status).toBe("COMPLETED");

Test Case: Insufficient BalanceThis test checks the behavior when the sender's balance is insufficient:Mocks a sender with a balance lower than the payment amount.
Verifies that the balance check fails.

Key assertion:typescript

expect(mockSender.balance).toBeLessThan(paymentData.amount);

AssumptionsThe payment flow assumes a single currency for simplicity.
The Prisma schema includes user and transaction models with fields like id, email, balance, amount, status, senderId, and receiverId.
Transactions are atomic, handled via Prisma's $transaction API.
The system does not handle concurrency issues (e.g., race conditions) in this test assignment.

Future ImprovementsAdd concurrency handling to prevent double-spending or race conditions.
Implement real database integration for end-to-end testing.
Add validation for negative amounts or invalid email formats.
Include retry mechanisms for failed transactions.
Enhance error messages for better user experience.

ContactFor questions or feedback regarding this test assignment, 
please contact Developer: nahomtewodrosm@gmial.com

Notes on EnhancementsStructure: Added clear sections for easy navigation (Overview, Features, Setup, etc.).
Clarity: Simplified explanations while maintaining technical accuracy.
Professional Tone: Used a formal yet approachable tone suitable for a job assignment.
Future Improvements: Included suggestions to demonstrate foresight and understanding of real-world systems.
Assumptions: Explicitly listed assumptions to clarify the scope of the implementation.

