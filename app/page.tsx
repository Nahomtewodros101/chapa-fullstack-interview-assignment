"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AuthNavigation from "@/components/AuthNavigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
    // Remove the automatic redirect to login - let users choose
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-xl">PSP</span>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-foreground">
          Payment Service Provider
        </h1>
        <p className="text-muted-foreground mb-8">
          Secure, fast, and reliable payment solutions
        </p>

        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <AuthNavigation />
        )}
      </div>
    </div>
  );
}
