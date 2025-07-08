"use client";

import { Loader2, CreditCard, DollarSign, TrendingUp } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Logo and Brand */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-black rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-bold text-2xl">PSP</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-black bg-clip-text text-transparent">
            Payment Service Provider
          </h1>
          <p className="text-muted-foreground">Secure • Fast • Reliable</p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900"></div>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Loading your dashboard...
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare everything
            </p>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-8 opacity-60">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground">Payments</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs text-muted-foreground">Wallet</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground">Analytics</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Initializing secure connection...
          </p>
        </div>
      </div>
    </div>
  );
}
