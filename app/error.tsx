"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <Button onClick={() => reset()} className="bg-[#1E3A5F] hover:bg-[#152C4A]">
          Try Again
        </Button>
      </div>
    </div>
  );
}
