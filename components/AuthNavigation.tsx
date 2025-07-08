"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthNavigation() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Create one here
          </Link>
        </p>
      </div>
    );
  }

  if (pathname === "/register") {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    );
  }

  // For home page or other pages
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 bg-transparent">
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Join thousands of users managing their payments securely
      </p>
    </div>
  );
}
