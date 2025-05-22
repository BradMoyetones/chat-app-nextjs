import { MessageFull, ParticipantFull, User } from "@/types/database"
import { memo } from "react"
import { ChatMessage } from "./ChatMessage"

type ChatMessagesProps = {
    messages: MessageFull[]
    user: User | null
    participants: ParticipantFull[]
}

const ChatMessagesComponent = ({
    messages,
    user,
    participants,
}: ChatMessagesProps) => {
    return (
        <>
            {messages.map((msg, index) => (
                <ChatMessage
                    key={msg.id + "-message-card"}
                    message={msg}
                    currentUser={user}
                    participants={participants}
                    isLastInSequence={index === messages.length - 1 || msg.senderId !== messages[index + 1]?.senderId}
                />
            ))}
        </>
    )
}

const ChatMessages = memo(ChatMessagesComponent)
ChatMessages.displayName = "ChatMessages"

export default ChatMessages
