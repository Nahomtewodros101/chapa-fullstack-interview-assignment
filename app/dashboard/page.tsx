"use client";

import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import UserDashboard from "@/components/dashboard/UserDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import SuperAdminDashboard from "@/components/dashboard/SuperAdminDashboard";
import ProfileSettings from "@/components/ProfileSettings";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientAuthWrapper from "@/components/ClientAuthProvider";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { LogOut, Settings, ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <ClientAuthWrapper>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </ClientAuthWrapper>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const renderDashboard = () => {
    if (!user) return null;

    if (showProfile) {
      return <ProfileSettings />;
    }

    switch (user.role) {
      case "SUPER_ADMIN":
        return <SuperAdminDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900";
      case "ADMIN":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900";
      default:
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {showProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    PSP
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {showProfile ? "Profile Settings" : "Payment Dashboard"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Welcome back, {user?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="border-4 border-background shadow-lg">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-2xl font-bold">
                      {user?.name ? getInitials(user.name) : "U"}
                    </span>
                  )}
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                      user?.role || ""
                    )}`}
                  >
                    {user?.role?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfile(!showProfile)}
                  className="hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button onClick={logout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}
