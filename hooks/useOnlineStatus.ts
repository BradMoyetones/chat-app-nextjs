// hooks/useOnlineStatus.ts
import { useEffect, useState } from "react"
import socket from "@/lib/socket"
import { useAuth } from "@/contexts/AuthContext"

export function useOnlineStatus(userId?: number | null) {
    const [isOnline, setIsOnline] = useState(false)
    const {user} = useAuth()

    useEffect(() => {
        if (!userId) return

        // Emitir evento para obtener el estado actual
        socket.emit("usuario:estado", userId, (online: boolean) => {
            setIsOnline(online)
        })

        // Escuchar actualizaciones
        const handleOnline = (id: number) => {
            if (id === userId) setIsOnline(true)
        }

        const handleOffline = (id: number) => {
            if (id === userId) setIsOnline(false)
        }

        socket.on("usuario:online", handleOnline)
        socket.on("usuario:offline", handleOffline)

        return () => {
            socket.off("usuario:online", handleOnline)
            socket.off("usuario:offline", handleOffline)
        }
    }, [userId, user?.id])

    return isOnline
}
