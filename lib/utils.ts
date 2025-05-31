import { ConversationFull, User } from "@/types/database"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns'
import api from "./axios"

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


export const getMessageGroupDate = (dateString?: string | null) => {
  if (!dateString) return ""

  const date = parseISO(dateString)

  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"

  const daysDiff = differenceInDays(new Date(), date)
  if (daysDiff <= 4) return format(date, 'EEEE') // Monday, etc.

  return format(date, 'dd/MM/yyyy')
}

export const downloadFile = async (filename: string, originalName: string) => {
  try {
    const response = await api.get(`/api/attachments/${filename}`, {
      responseType: 'blob', // para archivos binarios
    })

    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = originalName || filename
    a.click()

    window.URL.revokeObjectURL(url) // limpieza
  } catch (error) {
    console.error("Error downloading file:", error)
  }
}
