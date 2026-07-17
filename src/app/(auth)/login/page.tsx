"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth-actions";
import { Package, Lock, Mail, ArrowRight } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/command-center";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("next", next);

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mb-4 shadow-sm shadow-[var(--color-accent-subtle)]">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary text-center">Sign in to ProcureIQ</h1>
        <p className="text-text-secondary text-[15px] mt-2 text-center">Access your procurement command center</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] font-medium p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-text-primary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                name="email" 
                type="email" 
                required 
                defaultValue="rohit@procureiq.demo"
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-[14px] text-text-primary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-text-primary">Password</label>
              <a href="#" className="text-[13px] font-medium text-[var(--color-accent)] hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                name="password" 
                type="password" 
                required 
                defaultValue="demo1234"
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-[14px] text-text-primary focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-[var(--color-accent)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 bg-[var(--color-accent)] text-white text-[14px] font-bold rounded-xl hover:bg-[var(--color-accent-hover)] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? "Signing in..." : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-[13px] text-text-secondary">
            Don't have an account? <a href="#" className="font-semibold text-[var(--color-accent)] hover:underline">Create Account</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
