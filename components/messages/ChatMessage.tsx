import { format } from "date-fns"
import { MessageFull, ParticipantFull, User } from "@/types/database"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { AttachmentMessageCard } from "@/components/messages/AttachmentMessageCard"
import { TextMessageCard } from "@/components/messages/TextMessageCard"

interface ChatMessageProps {
    message: MessageFull
    currentUser: User | null
    participants: ParticipantFull[]
    isLastInSequence: boolean
}

export function ChatMessage({ message, currentUser, participants, isLastInSequence }: ChatMessageProps) {
    const isMe = message.senderId === currentUser?.id
    const isRead = isMe && message.reads.some((r) => r.userId !== currentUser?.id)
    const sender = participants.find((p) => p.userId === message.senderId)

    // Format timestamp
    const timestamp = new Date(message.createdAt)
    const timeString = format(timestamp, "h:mm a")

    const isOnline = useOnlineStatus(sender?.userId)
  
    const attachments = message.attachments

    return (
        <>
            <AttachmentMessageCard
                attachments={attachments}
                isLastInSequence={isLastInSequence}
                isMe={isMe}
                isOnline={isOnline}
                isRead={isRead}
                participants={participants}
                sender={sender}
                timeString={timeString}
            />

            {message.content?.trim() && (
                <TextMessageCard 
                    isLastInSequence={isLastInSequence}
                    isMe={isMe}
                    isOnline={isOnline}
                    isRead={isRead}
                    message={message}
                    participants={participants}
                    sender={sender}
                    timeString={timeString}
                />
            )}
        </>
    )
}
