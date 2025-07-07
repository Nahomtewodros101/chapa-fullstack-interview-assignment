"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wallet, Send, History } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  sender?: { name: string; email: string };
  receiver?: { name: string; email: string };
}

interface User {
  balance: number;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    receiverEmail: "",
    amount: "",
    description: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchTransactions();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverEmail: paymentForm.receiverEmail,
          amount: Number.parseFloat(paymentForm.amount),
          description: paymentForm.description,
        }),
      });

      if (response.ok) {
        setPaymentForm({ receiverEmail: "", amount: "", description: "" });
        fetchUserData();
        fetchTransactions();
        alert("Payment sent successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Payment failed");
      }
    } catch (error) {
      alert("Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${user?.balance?.toFixed(2) || "0.00"}
          </div>
        </CardContent>
      </Card>

      {/* Send Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Payment
          </CardTitle>
          <CardDescription>Transfer money to another user</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiverEmail">Recipient Email</Label>
              <Input
                id="receiverEmail"
                type="email"
                value={paymentForm.receiverEmail}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    receiverEmail: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={paymentForm.description}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <Button type="submit" disabled={paymentLoading}>
              {paymentLoading ? "Sending..." : "Send Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-500">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {transaction.type === "PAYMENT"
                        ? `Payment ${
                            transaction.sender
                              ? `to ${transaction.receiver?.name ?? transaction.receiver?.email ?? "Unknown"}`
                              : `from ${(transaction.sender && typeof transaction.sender === "object" && ("name" in transaction.sender || "email" in transaction.sender))
                                  ? ((transaction.sender as { name?: string; email?: string }).name ?? (transaction.sender as { name?: string; email?: string }).email ?? "Unknown")
                                  : "Unknown"}`
                          }`
                        : transaction.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        transaction.sender ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {transaction.sender ? "-" : "+"}$
                      {transaction.amount.toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "COMPLETED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
