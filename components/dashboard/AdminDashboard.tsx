"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MacBookFrame } from "@/components/ui/macbook-frame";
import {
  Users,
  Activity,
  DollarSign,
  Loader2,
  Eye,
  Calendar,
  Mail,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  description?: string;
  status: string;
  type: string;
  createdAt: string;
  sender?: {
    name: string;
    email: string;
  };
  receiver?: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  balance: number;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  sentTransactions: Transaction[];
  receivedTransactions: Transaction[];
  _count: {
    sentTransactions: number;
    receivedTransactions: number;
  };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: "default",
      PENDING: "secondary",
      FAILED: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalPayments = users.reduce(
    (sum, user) =>
      sum + (user._count.sentTransactions + user._count.receivedTransactions),
    0
  );

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  if (loading) {
    return (
      <MacBookFrame title="Admin Dashboard - Loading">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MacBookFrame>
    );
  }

  return (
    <MacBookFrame title="Admin Dashboard">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {users.length}
              </div>
              <p className="text-xs text-blue-600">
                {users.filter((user) => user.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-r from-green-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {users.filter((user) => user.isActive).length}
              </div>
              <p className="text-xs text-green-600">
                {users.filter((user) => !user.isActive).length} inactive
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-r from-purple-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {totalPayments}
              </div>
              <p className="text-xs text-purple-600">All time transactions</p>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-yellow-600">System-wide balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and view detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "default"
                              : user.role === "SUPER_ADMIN"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(user.balance)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-blue-600" />
                          <span>
                            {user._count.sentTransactions +
                              user._count.receivedTransactions}{" "}
                            transactions
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>
                            Joined{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-orange-600" />
                          <span>
                            Updated{" "}
                            {new Date(user.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <Avatar>
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center">
                                  {getInitials(user.name)}
                                </span>
                              )}
                            </Avatar>
                            {user.name} - User Details
                          </DialogTitle>
                          <DialogDescription>
                            Complete user information and transaction history
                          </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="sent">
                              Sent ({user._count.sentTransactions})
                            </TabsTrigger>
                            <TabsTrigger value="received">
                              Received ({user._count.receivedTransactions})
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">
                                    Account Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Email:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {user.email}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Role:
                                    </span>
                                    <Badge
                                      variant={
                                        user.role === "ADMIN"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {user.role}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Status:
                                    </span>
                                    <Badge
                                      variant={
                                        user.isActive
                                          ? "default"
                                          : "destructive"
                                      }
                                    >
                                      {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Balance:
                                    </span>
                                    <span className="text-sm font-bold text-green-600">
                                      {formatCurrency(user.balance)}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm">
                                    Activity Summary
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Sent Transactions:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {user._count.sentTransactions}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Received Transactions:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {user._count.receivedTransactions}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Total Transactions:
                                    </span>
                                    <span className="text-sm font-bold">
                                      {user._count.sentTransactions +
                                        user._count.receivedTransactions}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Member Since:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {new Date(
                                        user.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="sent">
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {user.sentTransactions.length > 0 ? (
                                  user.sentTransactions.map((transaction) => (
                                    <Card key={transaction.id} className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium">
                                                {formatCurrency(
                                                  transaction.amount
                                                )}
                                              </span>
                                              {getStatusBadge(
                                                transaction.status
                                              )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                              To:{" "}
                                              {transaction.receiver?.name ||
                                                "Unknown"}
                                            </p>
                                            {transaction.description && (
                                              <p className="text-xs text-muted-foreground mt-1">
                                                {transaction.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="flex items-center gap-1">
                                            {getStatusIcon(transaction.status)}
                                            <span className="text-sm">
                                              {new Date(
                                                transaction.createdAt
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-xs text-muted-foreground">
                                            {new Date(
                                              transaction.createdAt
                                            ).toLocaleTimeString()}
                                          </p>
                                        </div>
                                      </div>
                                    </Card>
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No sent transactions found
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>

                          <TabsContent value="received">
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {user.receivedTransactions.length > 0 ? (
                                  user.receivedTransactions.map(
                                    (transaction) => (
                                      <Card
                                        key={transaction.id}
                                        className="p-4"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <ArrowDownLeft className="h-5 w-5 text-green-500" />
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                  {formatCurrency(
                                                    transaction.amount
                                                  )}
                                                </span>
                                                {getStatusBadge(
                                                  transaction.status
                                                )}
                                              </div>
                                              <p className="text-sm text-muted-foreground">
                                                From:{" "}
                                                {transaction.sender?.name ||
                                                  "Unknown"}
                                              </p>
                                              {transaction.description && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {transaction.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="flex items-center gap-1">
                                              {getStatusIcon(
                                                transaction.status
                                              )}
                                              <span className="text-sm">
                                                {new Date(
                                                  transaction.createdAt
                                                ).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(
                                                transaction.createdAt
                                              ).toLocaleTimeString()}
                                            </p>
                                          </div>
                                        </div>
                                      </Card>
                                    )
                                  )
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No received transactions found
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant={user.isActive ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleUserStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MacBookFrame>
  );
}
