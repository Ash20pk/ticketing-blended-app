import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatEventId(eventId: bigint) {
  return eventId.toString()
}

export function formatTicketId(ticketId: bigint) {
  return ticketId.toString()
}
