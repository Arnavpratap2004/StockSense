import Link from "next/link";
import { ShieldX } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-red-600">403</h1>
          <h2 className="text-xl font-semibold text-foreground mt-1">Access Denied</h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>Back to Dashboard</Link>
      </div>
    </div>
  );
}
