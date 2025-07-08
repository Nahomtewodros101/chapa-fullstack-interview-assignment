import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MacBookFrameProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function MacBookFrame({
  children,
  className,
  title = "Dashboard",
}: MacBookFrameProps) {
  return (
    <div className={cn("relative mx-auto max-w-6xl", className)}>
      {/* MacBook Outer Frame */}
      <div className="relative bg-gray-800 rounded-t-3xl rounded-b-lg p-6 shadow-2xl">
        {/* MacBook Screen Bezel */}
        <div className="bg-black rounded-t-2xl rounded-b-lg p-4">
          {/* MacBook Screen */}
          <div className="bg-white rounded-lg overflow-hidden min-h-[600px] relative">
            {/* macOS Title Bar */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm font-medium text-gray-700">{title}</div>
              <div className="w-16"></div>
            </div>

            {/* Content Area */}
            <div className="p-6 bg-gray-50 min-h-[550px]">{children}</div>
          </div>
        </div>

        {/* MacBook Bottom */}
        <div className="mt-2 h-1 bg-gray-700 rounded-full mx-8"></div>
      </div>

      {/* MacBook Base */}
      <div className="bg-gray-700 h-4 rounded-b-2xl mx-4 shadow-lg"></div>
    </div>
  );
}
