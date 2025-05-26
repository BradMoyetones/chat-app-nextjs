// components/chat/ChatListItem.tsx
import { UserAvatar } from "@/components/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { getDisplayName, getFormattedTime } from "@/lib/utils" // Asegúrate que estén exportados
import { cn } from "@/lib/utils" // Si tienes clsx o una función similar
import { ConversationFull } from "@/types/database"
import React from "react"

type ChatListItemProps = {
    conversation: ConversationFull
    isActive: boolean
    onClick: (id: number) => void
    isTyping: boolean
}

export default function ChatListItem({ conversation, isActive, onClick, isTyping }: ChatListItemProps) {
    const { id, messages, unseenCount } = conversation
    const lastMessage = messages[0]
    const {user} = useAuth()

    const otherParticipant = conversation?.participants.find(p => p.userId !== user?.id)?.user || null

    const isOnline = useOnlineStatus(otherParticipant?.id)

    return (
        <div
            key={id + "-card-chat-list"}
            className={cn(
                "flex items-center p-4 rounded-xl cursor-pointer transition-all",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 hover:bg-muted border-transparent"
            )}
            onClick={() => onClick(id)}
        >
            <UserAvatar 
                src="https://github.com/shadcn.png"
                fallback={(otherParticipant?.firstName?.charAt(0)+""+otherParticipant?.lastName?.charAt(0)) || ""}
                isOnline={!conversation.isGroup ? isOnline : undefined}
                className="h-10 w-10"
            />
            <div className="text-left ml-2 w-full">
                <h3 className="font-semibold line-clamp-1">
                    {conversation.isGroup ? conversation.title : getDisplayName(conversation, user)}
                </h3>
                <p className="text-muted-foreground line-clamp-1">
                    {isTyping ? <span className="text-sm text-gray-500">Escribiendo...</span> : (lastMessage?.content || "No messages")}
                </p>
            </div>
            <div className="ml-2 flex flex-col h-full mb-auto">
                <p className="text-xs text-nowrap h-full">
                    {getFormattedTime(lastMessage?.createdAt)}
                </p>
                {unseenCount > 0 && (
                    <span className="shrink-0 size-5 text-sm text-primary text-center rounded-full bg-secondary ml-auto mt-2">
                        {unseenCount}
                    </span>
                )}
            </div>
        </div>
    )
}
