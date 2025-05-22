import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { format } from "date-fns"
import { CheckCheck, Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageFull, ParticipantFull, User } from "@/types/database"

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
  
    return (
        <div className={cn("group flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
            {!isMe && isLastInSequence && (
                <Avatar className="h-8 w-8">
                    <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-xs font-medium">
                        {sender?.user.firstName.charAt(0)}
                        {sender?.user.lastName.charAt(0)}
                    </div>
                </Avatar>
            )}

            {!isMe && !isLastInSequence && <div className="w-8" />}

            <div
                className={cn(
                    "px-4 py-2.5 max-w-[280px] break-words relative",
                    isMe ? "bg-primary text-primary-foreground" : "bg-muted",
                    // Apply different border radius based on sequence position
                    isLastInSequence ? (isMe ? "rounded-2xl rounded-br-none" : "rounded-2xl rounded-bl-none") : "rounded-2xl",
                )}
            >
                {message.content}

                <div 
                    className={`flex w-fit items-center text-xs mt-1 
                        ${isMe
                            ? "self-end ml-auto"
                            : "self-start ml-auto"}
                    `}
                >
                    <span className={cn("opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")+ " text-nowrap"}>
                        {timeString}
                    </span>

                    {isMe && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="ml-1 text-nowrap">
                                    {isRead ? (
                                        <CheckCheck className={cn("h-3.5 w-3.5", isMe ? "text-primary-foreground" : "text-primary")} />
                                    ) : (
                                        <Check className="h-3.5 w-3.5 opacity-70" />
                                    )}
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">{isRead ? "Read" : "Sent"}</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    )
}
