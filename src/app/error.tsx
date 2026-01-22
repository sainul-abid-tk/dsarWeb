"use client";

import { Button, Card } from "@/components/ui";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <Card className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-4">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && error.message && (
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded mb-4 text-left">
              <strong>Error details:</strong> {error.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}