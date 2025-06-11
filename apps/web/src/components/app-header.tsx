"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GitBranch, LogOut, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useState } from "react";
import Image from "next/image";

export function AppHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-10 flex items-center space-x-2" href="/">
            <Image
              src="/images/logo.svg"
              alt="CommitDigest"
              width={160}
              height={100}
            />
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/docs" ? "text-foreground" : "text-foreground/60"
              }`}
              href="/docs"
            >
              Docs
            </Link>
            <Link
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/pricing"
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
              href="/pricing"
            >
              Pricing
            </Link>
            {!user && (
              <Link
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/" ? "text-foreground" : "text-foreground/60"
                }`}
                href="/"
              >
                Home
              </Link>
            )}
            {user && (
              <Link
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/settings"
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
                href="/settings"
              >
                Settings
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="md:hidden flex items-center justify-between">
              <Link className="flex items-center space-x-2" href="/">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">CommitDigest</span>
              </Link>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>
                      Navigate to different sections of CommitDigest
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-6">
                    <Link
                      className={`text-lg transition-colors hover:text-foreground/80 ${
                        pathname === "/"
                          ? "text-foreground font-medium"
                          : "text-foreground/60"
                      }`}
                      href="/"
                      onClick={closeMobileMenu}
                    >
                      Home
                    </Link>
                    <Link
                      className={`text-lg transition-colors hover:text-foreground/80 ${
                        pathname === "/docs"
                          ? "text-foreground font-medium"
                          : "text-foreground/60"
                      }`}
                      href="/docs"
                      onClick={closeMobileMenu}
                    >
                      Docs
                    </Link>
                    <Link
                      className={`text-lg transition-colors hover:text-foreground/80 ${
                        pathname === "/pricing"
                          ? "text-foreground font-medium"
                          : "text-foreground/60"
                      }`}
                      href="/pricing"
                      onClick={closeMobileMenu}
                    >
                      Pricing
                    </Link>
                    {user && (
                      <Link
                        className={`text-lg transition-colors hover:text-foreground/80 ${
                          pathname === "/dashboard"
                            ? "text-foreground font-medium"
                            : "text-foreground/60"
                        }`}
                        href="/dashboard"
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                    )}
                    {user && (
                      <Link
                        className={`text-lg transition-colors hover:text-foreground/80 ${
                          pathname === "/settings"
                            ? "text-foreground font-medium"
                            : "text-foreground/60"
                        }`}
                        href="/settings"
                        onClick={closeMobileMenu}
                      >
                        Settings
                      </Link>
                    )}
                    <a
                      className="text-lg transition-colors hover:text-foreground/80 text-foreground/60"
                      href="#pricing"
                      onClick={closeMobileMenu}
                    >
                      Pricing
                    </a>

                    <div className="border-t pt-4 mt-6">
                      {user ? (
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Signed in as: {user.email}
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleSignOut}
                            className="w-full justify-start"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button variant="outline" asChild className="w-full">
                            <Link href="/login" onClick={closeMobileMenu}>
                              Sign In
                            </Link>
                          </Button>
                          <Button asChild className="w-full">
                            <Link href="/login" onClick={closeMobileMenu}>
                              Get Started Free
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Get Started Free</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
