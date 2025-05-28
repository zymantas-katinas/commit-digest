import { AuthForm } from "@/components/auth-form";
import { AuthRedirect } from "@/components/auth-redirect";
import { GitBranch } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="dark">
      <AuthRedirect />
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="h-12 w-12 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <GitBranch className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold">CommitDigest</span>
            </Link>
            <p className="mt-2 text-muted-foreground">
              AI-powered Git commit reporting
            </p>
          </div>
          <AuthForm embedded />
        </div>
      </div>
    </div>
  );
}
