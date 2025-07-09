import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(
          "📧 SMTP not configured, email would be sent:",
          emailData.subject
        );
        return true; // Return true in development when SMTP is not configured
      }

      const info = await this.transporter.sendMail({
        from: `"Payment Service Provider" <${process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      console.log("📧 Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("📧 Email sending failed:", error);
      return false;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Payment Service Provider!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Welcome to our secure payment platform. Your account has been successfully created.</p>
              
              <h3>🎉 Account Benefits:</h3>
              <ul>
                <li>✅ $1,000 starting balance</li>
                <li>✅ Send and receive payments instantly</li>
                <li>✅ Complete transaction history</li>
                <li>✅ Secure wallet management</li>
              </ul>
              
              <p>You can now start using your account to send and receive payments securely.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Access Your Dashboard</a>
              
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 Payment Service Provider. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "Welcome to Payment Service Provider! 🎉",
      html,
      text: ` ${userName}! Your Payment Service Provider account has been created successfully. You now have $1,000 starting balance and can send/receive payments instantly.`,
    });
  }

  // Login notification email
  async sendLoginNotification(
    userEmail: string,
    userName: string,
    loginTime: Date
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Login Notification</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We wanted to let you know that your account was accessed.</p>
              
              <div class="info-box">
                <strong>Login Details:</strong><br>
                Time: ${loginTime.toLocaleString()}<br>
                Account: ${userEmail}
              </div>
              
              <p>If this wasn't you, please contact our support team immediately.</p>
              <p>Stay secure!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: "🔐 Login Notification - Payment Service Provider",
      html,
      text: `Hello ${userName}, your Payment Service Provider account was accessed on ${loginTime.toLocaleString()}. If this wasn't you, please contact support.`,
    });
  }

  // Transaction notification email
  async sendTransactionNotification(
    userEmail: string,
    userName: string,
    transaction: {
      amount: number;
      type: "sent" | "received";
      otherParty: string;
      description?: string;
      balance: number;
    }
  ): Promise<boolean> {
    const isReceived = transaction.type === "received";
    const emoji = isReceived ? "💰" : "💸";
    const action = isReceived ? "received" : "sent";
    const preposition = isReceived ? "from" : "to";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${
              isReceived ? "#4CAF50" : "#FF9800"
            }; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .transaction-box { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${
              isReceived ? "#4CAF50" : "#FF9800"
            }; }
            .amount { font-size: 24px; font-weight: bold; color: ${
              isReceived ? "#4CAF50" : "#FF9800"
            }; }
            .balance { background: #e8f5e8; padding: 10px; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${emoji} Payment ${isReceived ? "Received" : "Sent"}</h2>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>You have ${action} a payment.</p>
              
              <div class="transaction-box">
                <div class="amount">${
                  isReceived ? "+" : "-"
                }$${transaction.amount.toFixed(2)}</div>
                <p><strong>${isReceived ? "From" : "To"}:</strong> ${
      transaction.otherParty
    }</p>
                ${
                  transaction.description
                    ? `<p><strong>Description:</strong> ${transaction.description}</p>`
                    : ""
                }
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="balance">
                <strong>New Balance: $${transaction.balance.toFixed(2)}</strong>
              </div>
              
              <p>You can view all your transactions in your dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `${emoji} Payment ${
        isReceived ? "Received" : "Sent"
      } - $${transaction.amount.toFixed(2)}`,
      html,
      text: `Hello ${userName}, you have ${action} $${transaction.amount.toFixed(
        2
      )} ${preposition} ${
        transaction.otherParty
      }. New balance: $${transaction.balance.toFixed(2)}.`,
    });
  }
}

export const emailService = new EmailService();
