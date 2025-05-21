'use client'
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react"
import api from "@/lib/axios"
import { ConversationFull } from "@/types/database";

interface ConversationContextProps {
    conversations: ConversationFull[]
    setConversations: Dispatch<SetStateAction<ConversationFull[]>>
    loading: boolean
}
const ConversationContext = createContext<ConversationContextProps | undefined>(undefined)

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
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

    return (
        <ConversationContext.Provider value={{ conversations, setConversations, loading }}>
            {children}
        </ConversationContext.Provider>
    )
}


export const useConversations = () => {
    const context = useContext(ConversationContext)
    if (!context) throw new Error("useConversations must be used within an ConversationProvider")
    return context
}

