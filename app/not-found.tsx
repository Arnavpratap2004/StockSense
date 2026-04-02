import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/lib/button-variants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-navy/10 flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-[#1E3A5F]" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#1E3A5F]">404</h1>
          <p className="text-lg text-muted-foreground mt-2">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link href="/dashboard" className={buttonVariants() + " bg-[#1E3A5F] hover:bg-[#152C4A]"}>Back to Dashboard</Link>
      </div>
    </div>
  );
}
