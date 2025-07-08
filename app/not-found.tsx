"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text">
            404
          </div>
          <div className="absolute inset-0 text-9xl font-bold text-red-100 dark:text-red-900 -z-10 transform translate-x-2 translate-y-2">
            404
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into
            the digital void.
          </p>
        </div>

        {/* Illustration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <Card className="border-dashed border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
            <CardContent className="p-6 text-center">
              <Search className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Page doesn't exist
              </p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                URL might be wrong
              </p>
            </CardContent>
          </Card>
          <Card className="border-dashed border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20">
            <CardContent className="p-6 text-center">
              <ArrowLeft className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Let's go back</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
         
          <Button
            onClick={() => router.push("/")}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact our support team or
            try refreshing the page.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-200 dark:bg-red-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-12 h-12 bg-yellow-200 dark:bg-yellow-800 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  );
}
