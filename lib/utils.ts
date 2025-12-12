import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("nl-BE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function generateStructuredReference(caseId: string): string {
  // Generate a structured reference: +++XXX/XXXX/XXXXX+++
  const random = Math.random().toString().slice(2, 11);
  return `+++${random.slice(0, 3)}/${random.slice(3, 7)}/${random.slice(7, 12)}+++`;
}

