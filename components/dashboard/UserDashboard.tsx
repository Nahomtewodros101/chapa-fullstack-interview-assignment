"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SimpleLoading,
  SimpleCardLoading,
} from "@/components/ui/simple-loading";
import { MacBookFrame } from "@/components/ui/macbook-frame";
import {
  Wallet,
  Send,
  History,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";

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

export default function UserDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    receiverEmail: "",
    amount: "",
    description: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      console.error("No valid token found");
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchTransactions = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setAlert({
          type: "error",
          message: "Authentication required. Please log in again.",
        });
        setLoading(false);
        return;
      }

      console.log("Fetching transactions with headers:", {
        hasAuth: !!headers.Authorization,
      });

      const response = await fetch("/api/transactions", { headers });

      console.log(
        "Transaction fetch response:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Transactions fetched:", data.length);
        setTransactions(data);
      } else {
        const errorData = await response.json();
        console.error("Transaction fetch failed:", errorData);
        setAlert({
          type: "error",
          message: errorData.error || "Failed to fetch transactions",
        });
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setAlert({
        type: "error",
        message: "Network error while fetching transactions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setAlert(null);

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setAlert({
          type: "error",
          message: "Authentication required. Please log in again.",
        });
        setPaymentLoading(false);
        return;
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers,
        body: JSON.stringify({
          receiverEmail: paymentForm.receiverEmail,
          amount: Number.parseFloat(paymentForm.amount),
          description: paymentForm.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentForm({ receiverEmail: "", amount: "", description: "" });
        fetchTransactions();
        setAlert({
          type: "success",
          message: "Payment sent successfully! 📧 Email notifications sent.",
        });
        // Refresh user data to update balance
        window.location.reload();
      } else {
        // Handle specific error cases
        if (response.status === 408) {
          setAlert({
            type: "error",
            message: "Transaction timeout. Please try again.",
          });
        } else if (response.status === 409) {
          setAlert({
            type: "error",
            message: "Transaction conflict. Please try again.",
          });
        } else {
          setAlert({ type: "error", message: data.error || "Payment failed" });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setAlert({
        type: "error",
        message: "Network error during payment. Please try again.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <MacBookFrame title="User Dashboard - Loading">
        <div className="space-y-6">
          <SimpleCardLoading />
          <SimpleCardLoading />
          <SimpleCardLoading />
        </div>
      </MacBookFrame>
    );
  }

  return (
    <MacBookFrame title={`User Dashboard - ${user?.name || "User"}`}>
      <div className="space-y-6">
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* Wallet Balance */}
        <Card className="border-2 hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(user?.balance || 0)}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Available for transactions
            </p>
          </CardContent>
        </Card>

        {/* Send Payment */}
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
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
                  placeholder="Enter recipient's email"
                  value={paymentForm.receiverEmail}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      receiverEmail: e.target.value,
                    })
                  }
                  required
                  className="border-2 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={user?.balance || 0}
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  required
                  className="border-2 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's this payment for?"
                  value={paymentForm.description}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      description: e.target.value,
                    })
                  }
                  className="border-2 focus:border-blue-500"
                />
              </div>
              <Button
                type="submit"
                disabled={paymentLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {paymentLoading ? (
                  <>
                    <SimpleLoading size="sm" className="mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Payment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Transaction History
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTransactions}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Your recent transactions and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500">
                    Your payment history will appear here
                  </p>
                </div>
              ) : (
                transactions.map((transaction) => {
                  const isOutgoing = transaction.sender?.email === user?.email;
                  const otherParty = isOutgoing
                    ? transaction.receiver
                    : transaction.sender;

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-full ${
                            isOutgoing
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isOutgoing ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownLeft className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {isOutgoing ? "Sent to" : "Received from"}{" "}
                            {otherParty?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            isOutgoing ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isOutgoing ? "-" : "+"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                          className={`${
                            transaction.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MacBookFrame>
  );
}
