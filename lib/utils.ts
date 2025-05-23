import { ConversationFull, User } from "@/types/database"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayName = (con: ConversationFull, user: User | null) => {
  if (!user) return ""

  if (!con.isGroup) {
      const other = con.participants.find(p => p.user.id !== user.id)
      return other ? `${other.user.firstName} ${other.user.lastName}` : "Chat"
  }

  const names = con.participants
      .map(p => `${p.user.firstName} ${p.user.lastName}`)
  const shown = names.slice(0, 4)
  const remaining = names.length - shown.length

  return remaining > 0
    ? `${shown.join(", ")} y ${remaining} más`
    : shown.join(", ")
}

export const getFormattedTime = (dateString?: string | null) => {
  if (!dateString) return ""

  const date = parseISO(dateString)

  if (isToday(date)) {
    return format(date, 'h:mm a')
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  const daysDiff = differenceInDays(new Date(), date)

  if (daysDiff <= 4) {
    return format(date, 'EEEE') // Monday, Tuesday, ...
  }

  return format(date, 'dd/MM/yyyy')
}