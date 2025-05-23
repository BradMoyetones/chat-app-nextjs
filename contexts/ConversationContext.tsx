'use client'
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react"
import api from "@/lib/axios"
import { ConversationFull, MessageFull } from "@/types/database";
import socket from "@/lib/socket";
import { useAuth } from "./AuthContext";

interface ConversationContextProps {
    conversations: ConversationFull[]
    setConversations: Dispatch<SetStateAction<ConversationFull[]>>
    loading: boolean
    markConversationAsRead: (id: number) => void
}
const ConversationContext = createContext<ConversationContextProps | undefined>(undefined)

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth()
    const [conversations, setConversations] = useState<ConversationFull[]>([])
    const [loading, setLoading] = useState(false)

    const fetchData = async() => {
        setLoading(true)
        try{
            const response = await api.get("/api/conversations")

            setConversations(response.data)
        }catch(e) {
            console.log(e);
            
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (!user) return

        socket.emit("setup", user.id)

        const handleNuevoMensaje = (mensaje: MessageFull) => {
            setConversations(prev => {
                const index = prev.findIndex(c => c.id === mensaje.conversationId)
                if (index === -1) return prev

                const updated = [...prev]
                const conv = { ...updated[index] }

                conv.messages = [mensaje, ...conv.messages] // mantener historial si quieres
                if (mensaje.senderId !== user.id) {
                    conv.unseenCount = (conv.unseenCount || 0) + 1
                }

                updated.splice(index, 1)
                updated.unshift(conv)

                return updated
            })
        }


        socket.on("mensaje:recibido", handleNuevoMensaje)

        return () => {
            socket.off("mensaje:recibido", handleNuevoMensaje)
        }
    }, [user])

    const markConversationAsRead = (id: number) => {
        setConversations(prev => {
            const updated = [...prev]
            const index = updated.findIndex(c => c.id === id)
            if (index === -1) return prev

            const conv = { ...updated[index], unseenCount: 0 }
            updated[index] = conv
            return updated
        })
    }


    return (
        <ConversationContext.Provider value={{ conversations, setConversations, loading, markConversationAsRead }}>
            {children}
        </ConversationContext.Provider>
    )
}


export const useConversations = () => {
    const context = useContext(ConversationContext)
    if (!context) throw new Error("useConversations must be used within an ConversationProvider")
    return context
}

