import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(
  address?: string | null,
  startLen = 8,
  endLen = 6
): string {
  if (!address) return "—";
  if (address.length <= startLen + endLen + 2) {
    return address;
  }
  return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
}

export function formatCurrency(
  amount?: number | null,
  currency?: string | null
): string {
  if (amount === null || amount === undefined) {
    return "—";
  }

  const num = Number(amount);
  if (Number.isNaN(num)) {
    return `${amount} ${currency || ""}`.trim();
  }

  try {
    if (currency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: 2,
      }).format(num);
    }
  } catch {
    // fallback if currency code is unsupported
  }

  return `${num.toLocaleString("en-IN")} ${currency || ""}`.trim();
}

export function formatDate(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
