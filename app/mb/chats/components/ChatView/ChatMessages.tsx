import { MessageFull, ParticipantFull, User } from "@/types/database"
import { Fragment, memo } from "react"
import { ChatMessage } from "./ChatMessage"
import { getMessageGroupDate } from "@/lib/utils"

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
    let lastDateLabel: string | null = null

    return (
        <>
            {messages.map((msg, index) => {
                const currentDateLabel = getMessageGroupDate(msg.createdAt)
                const showDateSeparator = currentDateLabel !== lastDateLabel
                lastDateLabel = currentDateLabel

                return (
                    <Fragment key={msg.id + "-group-container"}>
                        {showDateSeparator && (
                            <div className="text-center text-sm text-muted-foreground sticky top-0 p-4 z-20">
                                <div className="p-1 bg-background/10 backdrop-blur-xl w-28 rounded-full mx-auto">{currentDateLabel}</div>
                            </div>
                        )}
                        <div key={msg.id + "-container"}>
                            <ChatMessage
                                message={msg}
                                currentUser={user}
                                participants={participants}
                                isLastInSequence={
                                    index === messages.length - 1 ||
                                    msg.senderId !== messages[index + 1]?.senderId
                                }
                            />
                        </div>
                    </Fragment>
                )
            })}
        </>
    )
}

const ChatMessages = memo(ChatMessagesComponent)
ChatMessages.displayName = "ChatMessages"

export default ChatMessages
