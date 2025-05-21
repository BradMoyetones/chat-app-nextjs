import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/axios"
import { ConversationFull } from "@/types/database"
import { useEffect, useState } from "react"

type ChatViewProps = {
    chatId?: number
}

export default function ChatView({ chatId }: ChatViewProps) {
    const [conversation, setConversation] = useState<ConversationFull | null>(null)
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/api/conversations/${chatId}`)
            setConversation(response.data)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!chatId) return
        fetchData()
    }, [chatId])

    if (!chatId) {
        return <div className="text-center text-gray-500 mt-10">Selecciona un chat para empezar a conversar</div>
    }

    if (loading) {
        return <div className="text-center text-gray-500 mt-10">Cargando...</div>
    }

    if (!conversation) return null

    return (
        <div className="p-4 space-y-2">
            {conversation.messages.map((msg) => {
                const isMe = msg.senderId === user?.id
                return (
                    <div
                        key={msg.id}
                        className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                            isMe
                                ? 'bg-blue-500 text-white self-end ml-auto'
                                : 'bg-gray-200 text-gray-900 self-start mr-auto'
                        }`}
                    >
                        {msg.content}
                    </div>
                )
            })}
        </div>
    )
}
