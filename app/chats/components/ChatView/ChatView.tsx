/* eslint-disable @next/next/no-img-element */
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/axios"
import socket from "@/lib/socket"
import { ConversationFull, MessageFull, MessageRead } from "@/types/database"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { File, ImageIcon, Plus, Send, Smile, X } from "lucide-react"
import ChatHeader from "./ChatHeader"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useConversations } from "@/contexts/ConversationContext"
import { useViewStore } from "@/hooks/useViewStore"
import Loader from "@/components/Loader"
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { useTheme } from "next-themes"
import { StartConversation } from "../ContactsView/StartConversation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import axios from "axios"
import { getFileIcon, isImage } from "@/lib/utils"
import ChatMessages from "@/components/messages/ChatMessages"

interface PendingAttachment {
    file: File
    preview: string
    size: number
    type: string
}

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
    const editableRef = useRef<HTMLDivElement>(null)
    


    // Attachments
    const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const dragCounter = useRef(0)



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

        const noText = !messageContent.trim();
        const noFiles = pendingAttachments.length === 0;

        if ((noText && noFiles) || !user || !chatId) return;

        try {
            const formData = new FormData()
            formData.append('content', messageContent)

            pendingAttachments.forEach(file => {
                formData.append('attachments', file.file)
            })

            const res = await api.post(`/api/conversations/${chatId}/messages`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
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
            setPendingAttachments([])
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const data = error.response.data
                const rawError = data.error

                // 🔹 Si es un mensaje plano
                if (typeof rawError === "string") {
                    toast.error(rawError)
                    return
                }

                // 🔹 Si es un objeto con message
                if (typeof rawError === "object" && rawError?.message) {
                    toast.error(rawError.message)
                    return
                }
            }
            toast.error("Something went wrong while sending the request.")
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

    const handleInput = () => {
        const text = editableRef.current?.innerText || ""
        setMessageContent(text)
        handleTyping()
    }

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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        handleFiles(files)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removePendingAttachment = (index: number) => {
        setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
    }

    const handleFiles = (files: File[]) => {
        files.forEach((file) => {
            const reader = new FileReader()
            reader.onload = (e) => {
            const preview = e.target?.result as string
                setPendingAttachments((prev) => [
                    ...prev,
                    {
                    file,
                    preview,
                    size: file.size,
                    type: file.type,
                    },
                ])
            }
            reader.readAsDataURL(file)
        })
    }

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        dragCounter.current += 1
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        dragCounter.current -= 1
        if (dragCounter.current <= 0) {
            setIsDragging(false)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        dragCounter.current = 0
        setIsDragging(false)

        const files = Array.from(e.dataTransfer?.files || [])
        if (files.length > 0) {
            handleFiles(files)
        }
    }
    
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
        <div 
            ref={dropZoneRef} 
            className="flex flex-col h-full overflow-hidden relative"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 bg-black/50 text-white z-50 flex items-center justify-center text-xl pointer-events-none">
                    Draw and drop you files here
                </div>
            )}
            <div className="absolute inset-0 bg-[url('/background_1.png')] dark:flex hidden opacity-10 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-[url('/background_1_white.png')] opacity-10 dark:hidden flex pointer-events-none z-0" />
            <ChatHeader conversation={conversation} isGroup={conversation.isGroup} />
            {/* Scroll de mensajes */}
            <ScrollArea className="flex-1 px-2 h-full max-h-[calc(100dvh-73px-71px)]">
                <div className="space-y-2 pb-0 pt-4">
                    <ChatMessages 
                        messages={conversation.messages}
                        user={user}
                        participants={conversation.participants}
                    />
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input de mensaje */}
            <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-2 mt-4 border-t border-border bg-background p-4 absolute bottom-0 right-0 left-0"
            >
                {pendingAttachments.length > 0 && (
                    <div className="mb-4 p-3 bg-muted rounded-lg flex-1">
                        <div className="text-sm font-medium mb-2">Archivos a enviar:</div>
                        <div className="flex flex-wrap gap-2">
                            {pendingAttachments.map((attachment, index) => (
                                <Tooltip key={index+"-file-uploaded"}>
                                    <TooltipTrigger asChild>
                                        <div className="relative">
                                            {isImage(attachment.type) ? (
                                                <div className="relative">
                                                    <img
                                                        src={attachment.preview || "/placeholder.svg"}
                                                        alt="Preview"
                                                        className="w-16 h-16 object-cover rounded border"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                                        onClick={() => removePendingAttachment(index)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="relative h-16 w-16 flex items-center justify-center bg-background rounded">
                                                    {getFileIcon(attachment.type)}
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                                        type="button"
                                                        onClick={() => removePendingAttachment(index)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>{attachment.file.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant={"ghost"} 
                                size={"icon"}
                            >
                                <Plus />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Upload</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImageIcon /> Image
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <File />
                                File
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <span className="absolute left-4 text-muted-foreground top-2 text-sm pointer-events-none">{!messageContent.trim() && "Write a message..."}</span>
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
                                disabled={!messageContent.trim() && pendingAttachments.length === 0}
                            >
                                <Send />
                                <span className="sr-only">Send Message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Send</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </form>
        </div>
    )
}


