/* eslint-disable @next/next/no-img-element */
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/axios"
import socket from "@/lib/socket"
import { ConversationFull, MessageFull, MessageRead } from "@/types/database"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Smile } from "lucide-react"
import ChatMessages from "./ChatMessages"
import ChatHeader from "./ChatHeader"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useConversations } from "@/contexts/ConversationContext"
import { useViewStore } from "@/hooks/useViewStore"
import Loader from "@/components/Loader"
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { useTheme } from "next-themes"
import { StartConversation } from "@/app/chats/components/ContactsView/StartConversation"

export default function ChatView() {
    const {chatId} = useViewStore()
    const [conversation, setConversation] = useState<ConversationFull | null>(null)
    const [loading, setLoading] = useState(false)
    const [messageContent, setMessageContent] = useState("")
    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const markedReadIdsRef = useRef<number[]>([])
    const { markConversationAsRead } = useConversations()
    const [showPicker, setShowPicker] = useState(false)
    const { theme } = useTheme()
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false); // para evitar emitir typing varias veces
    const prevChatIdRef = useRef<number | null>(null);

    const [openIC, setOpenIC] = useState(false)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [conversation?.messages])

    // Escuchar nuevos mensajes por socket
    useEffect(() => {
        if (!chatId) return

        const audio = new Audio('/message_tone.mp3') // Ruta relativa al `public`

        const handleNewMessage = (msg: MessageFull) => {
            if (msg.conversationId !== chatId) return

            setConversation(prev => {
                if (!prev) return prev

                const alreadyExists = prev.messages.some(m => m.id === msg.id)
                if (alreadyExists) return prev

                if(user?.id !== msg.senderId){
                    audio.play().catch((err) => {
                        console.warn("No se pudo reproducir el sonido:", err)
                    })
                }                

                return { ...prev, messages: [...prev.messages, msg] }
            })
        }

        socket.on("mensaje:recibido", handleNewMessage)

        return () => {
            socket.off("mensaje:recibido", handleNewMessage)
        }
    }, [chatId, user])


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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId])

    useEffect(() => {
        if (!conversation || !user) return

        const unreadMessageIds = conversation.messages
            .filter(msg => msg.senderId !== user.id && !msg.reads.some(r => r.userId === user.id))
            .map(msg => msg.id)

        const newUnreadIds = unreadMessageIds.filter(id => !markedReadIdsRef.current.includes(id))

        if (newUnreadIds.length > 0) {
            api.post('/api/message-reads', {
                messageIds: newUnreadIds
            }).then(() => {
                markedReadIdsRef.current = [...markedReadIdsRef.current, ...newUnreadIds]

                // 🔁 Resetear unseenCount de esta conversación
                markConversationAsRead(conversation.id)
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation, user])


    useEffect(() => {
        const handleMensajeLeido = ({
            messageIds,
            userId: readerId,
            conversationId,
        }: {
            messageIds: number[],
            userId: number,
            conversationId: number
        }) => {
            if (conversation?.id !== conversationId || !user) return

            // No hacer nada si soy yo quien leyó
            if (readerId === user.id) return

            setConversation(prev => {
                if (!prev) return prev

                const updatedMessages = prev.messages.map(msg => {
                    if (!messageIds.includes(msg.id)) return msg

                    const alreadyRead = msg.reads.some(r => r.userId === readerId)
                    if (alreadyRead) return msg

                    return {
                        ...msg,
                        reads: [...msg.reads, { userId: readerId, messageId: msg.id } as MessageRead]
                    }
                })

                return { ...prev, messages: updatedMessages }
            })
        }

        socket.on("mensaje:leido", handleMensajeLeido)

        return () => {
            socket.off("mensaje:leido", handleMensajeLeido)
        }
    }, [conversation, user])



    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!messageContent.trim() || !user || !chatId) return

        try {
            const res = await api.post(`/api/conversations/${chatId}/messages`, {
                content: messageContent,
                senderId: user.id,
            })

            const newMessage = res.data

            // Emitir por socket
            socket.emit("mensaje:nuevo", {
                ...newMessage,
                conversationId: chatId,
            })

            // Deneter escribiendo
            socket.emit("stopTyping", { conversationId: chatId, userId: user.id });
            isTypingRef.current = false;

            setMessageContent("")
        } catch (err) {
            console.error("Error al enviar el mensaje", err)
        }
    }

    const handleTyping = () => {
        if (!socket || !chatId || !user) return;

        if (!isTypingRef.current) {
            socket.emit("typing", { conversationId: chatId, userId: user.id });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { conversationId: chatId, userId: user.id });
            isTypingRef.current = false;
        }, 3000); // espera 3 segundos de inactividad
    }

    useEffect(() => {
        if (!user) return;

        const prevChatId = prevChatIdRef.current;
        
        if (prevChatId && isTypingRef.current) {
            socket.emit("stopTyping", { conversationId: prevChatId, userId: user.id });
            isTypingRef.current = false;
        }

        prevChatIdRef.current = chatId;
        
        // Limpia el timeout anterior si existía
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [chatId, user]);


    const editableRef = useRef<HTMLDivElement>(null)
    // Manejar cambios manuales
    const handleInput = () => {
        const text = editableRef.current?.innerText || ""
        setMessageContent(text)
        handleTyping()
    }

    // Mantener el contenido actualizado si cambia desde fuera (ej. emoji)
    useEffect(() => {
        const el = editableRef.current
        if (!el) return

        if (el.innerText !== messageContent) {
            const sel = window.getSelection()
            const range = document.createRange()

            // Guarda el foco al final
            el.innerText = messageContent
            range.selectNodeContents(el)
            range.collapse(false)
            sel?.removeAllRanges()
            sel?.addRange(range)
        }
    }, [messageContent])

    if (!chatId) {
        return (
            <div className="text-muted-foreground h-full gap-2 flex flex-col items-center justify-center">
                <img src="/initial_screen.svg" alt="" />
                <p>Select a conversation or start a <Button variant={"link"} className="p-0 cursor-pointer" onClick={() => setOpenIC(prev => !prev)}>new one</Button></p>
                <StartConversation 
                    open={openIC} 
                    setOpen={setOpenIC} 
                />
            </div>
        )
    }

    if (loading) {
        return <div className='h-full flex items-center justify-center bg-background'><Loader /></div>
    }

    if (!conversation) return null

    return (
        <div className="flex-1 flex-col h-full overflow-auto relative pt-14 pb-32 px-2">
            <div className="fixed inset-0 bg-[url('/background_1.png')] dark:flex hidden opacity-10 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-[url('/background_1_white.png')] opacity-10 dark:hidden flex pointer-events-none z-0" />
            <ChatHeader conversation={conversation} isGroup={conversation.isGroup} />

            <div className="space-y-0.5 pb-0 pt-4">
                <ChatMessages 
                    messages={conversation.messages}
                    user={user}
                    participants={conversation.participants}
                />
                <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 mt-4 border-t border-border bg-background p-2 fixed bottom-[60px] right-0 left-0 z-50"
            >
                <div className="relative w-full">
                    <div
                        ref={editableRef}
                        contentEditable
                        role="textbox"
                        aria-multiline="true"
                        suppressContentEditableWarning
                        className="w-full min-h-[36px] max-h-36 overflow-y-auto outline-none rounded-3xl px-4 py-2 pr-10 bg-muted text-sm whitespace-pre-wrap break-words"
                        style={{ wordBreak: "break-word" }}
                        onInput={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
                            e.preventDefault()
                            if (messageContent.trim()) {
                                handleSendMessage(e)
                            }
                            }
                        }}
                    >
                    </div>
                    <span className="absolute left-4 text-muted-foreground top-2 text-sm">{!messageContent.trim() && "Write a message..."}</span>
                    <div className="relative">
                        <Button
                            type="button"
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => setShowPicker(!showPicker)}
                            className="absolute right-1 bottom-[1.5px] z-10 rounded-full"
                        >
                            <Smile />
                            <span className="sr-only">Emogis</span>
                        </Button>
                        {showPicker && (
                            <div className="absolute bottom-10 right-0 mb-2 z-50">
                                <Picker
                                    data={data}
                                    theme={theme}
                                    onClickOutside={() => setShowPicker(false)}
                                    onEmojiSelect={(emoji: {native: string}) =>
                                        setMessageContent((prev) => prev + emoji.native)
                                    }
                                />
                            </div>
                        )}
                    </div>
                    
                </div>
                
                
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="submit"
                            disabled={!messageContent.trim()}
                        >
                            <Send />
                            <span className="sr-only">Send Message</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Send</p>
                    </TooltipContent>
                </Tooltip>
            </form>
        </div>
    )
}


