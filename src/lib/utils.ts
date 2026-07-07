import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatPercent(value: number, decimals: number = 0): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffHours) < 1) return "just now";
  if (diffHours > 0 && diffHours < 48) return `in ~${diffHours}h`;
  if (diffHours < 0 && diffHours > -48) return `${Math.abs(diffHours)}h ago`;
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

export function getUrgencyColor(urgency: "critical" | "high" | "medium" | "low"): string {
  const colors: Record<string, string> = {
    critical: "text-red-400",
    high: "text-amber-400",
    medium: "text-blue-400",
    low: "text-emerald-400",
  };
  return colors[urgency] ?? "text-slate-400";
}

export function getUrgencyBgColor(urgency: "critical" | "high" | "medium" | "low"): string {
  const colors: Record<string, string> = {
    critical: "bg-red-500/10 border-red-500/20",
    high: "bg-amber-500/10 border-amber-500/20",
    medium: "bg-blue-500/10 border-blue-500/20",
    low: "bg-emerald-500/10 border-emerald-500/20",
  };
  return colors[urgency] ?? "bg-slate-500/10 border-slate-500/20";
}
