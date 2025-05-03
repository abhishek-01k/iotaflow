import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function truncateAddress(address: string, length: number = 4): string {
  if (!address) return ""
  if (address.length <= length * 2) return address
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`
}

export function formatCurrency(
  amount: number,
  currency: string = "IOTA",
  locale: string = "en-US"
): string {
  if (isNaN(amount)) return `0 ${currency}`
  return `${amount.toLocaleString(locale, {
    maximumFractionDigits: 6,
  })} ${currency}`
}

export function createPlaceholderArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}
