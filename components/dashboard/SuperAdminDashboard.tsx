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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MacBookFrame } from "@/components/ui/macbook-frame";
import AdminDashboard from "./AdminDashboard";
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  UserPlus,
  UserMinus,
  Settings,
  Download,
  Shield,
  Crown,
  BarChart3,
} from "lucide-react";
import { revalidatePath } from "next/cache";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalPayments: number;
  totalAdmins: number;
  totalSuperAdmins: number;
  systemBalance: number;
  monthlyGrowth: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  balance: number;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({
    name: "",
    email: "",
    role: "ADMIN",
  });
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
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
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/create", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(createAdminForm),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "Admin created successfully!" });
        setCreateAdminForm({ name: "", email: "", role: "ADMIN" });
        setIsCreateAdminModalOpen(false);
        fetchUsers();
        fetchStats();
        revalidatePath("/dashboard/super-admin");
      } else {
        setAlert({
          type: "error",
          message: data.error || "Failed to create admin",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error while creating admin",
      });
    }
  };

  const removeAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const response = await fetch(`/api/admin/remove/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setAlert({ type: "success", message: "Admin removed successfully!" });
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        setAlert({
          type: "error",
          message: data.error || "Failed to remove admin",
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error while removing admin",
      });
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch("/api/admin/export", {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `system-data-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setAlert({ type: "success", message: "Data exported successfully!" });
      } else {
        setAlert({ type: "error", message: "Failed to export data" });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: "Network error while exporting data",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const adminUsers = users.filter(
    (user) => user.role === "ADMIN" || user.role === "SUPER_ADMIN"
  );

  if (loading) {
    return (
      <MacBookFrame title="Super Admin Dashboard - Loading">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MacBookFrame>
    );
  }

  return (
    <MacBookFrame title="Super Admin Dashboard">
      <div className="space-y-6">
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {/* System-wide Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-xs text-blue-600">
                {stats?.activeUsers || 0} active users
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {stats?.activeUsers || 0}
              </div>
              <p className="text-xs text-green-600">
                {stats?.totalUsers
                  ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transactions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {stats?.totalTransactions || 0}
              </div>
              <p className="text-xs text-purple-600">All time transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payments
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">
                {formatCurrency(stats?.totalPayments || 0)}
              </div>
              <p className="text-xs text-yellow-600">Total payment volume</p>
            </CardContent>
          </Card>
        </div>

        {/* Super Admin Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-red-600" />
                Super Admin Features
              </CardTitle>
              <CardDescription>
                Advanced administrative capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Dialog
                  open={isCreateAdminModalOpen}
                  onOpenChange={setIsCreateAdminModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Admin</DialogTitle>
                      <DialogDescription>
                        Add a new administrator to the system
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={createAdminForm.name}
                          onChange={(e) =>
                            setCreateAdminForm({
                              ...createAdminForm,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={createAdminForm.email}
                          onChange={(e) =>
                            setCreateAdminForm({
                              ...createAdminForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={createAdminForm.role}
                          onValueChange={(value: string) =>
                            setCreateAdminForm({
                              ...createAdminForm,
                              role: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPER_ADMIN">
                              Super Admin
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Create Admin
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>

                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>

                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Admin Management
              </CardTitle>
              <CardDescription>Manage system administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {adminUsers.length > 0 ? (
                  adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{admin.name}</span>
                          <Badge
                            variant={
                              admin.role === "SUPER_ADMIN"
                                ? "destructive"
                                : "default"
                            }
                          >
                            {admin.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {admin.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined:{" "}
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {admin.role !== "SUPER_ADMIN" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAdmin(admin.id)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No admins found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Include all Admin features */}
        <AdminDashboard />
      </div>
    </MacBookFrame>
  );
}
