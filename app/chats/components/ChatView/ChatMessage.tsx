/* eslint-disable @next/next/no-img-element */
import { cn, downloadFile } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCheck, Check, File, ImageIcon, Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageFull, ParticipantFull, User } from "@/types/database"
import { UserAvatar } from "@/components/UserAvatar"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { Button } from "@/components/ui/button"

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
  
    const isImage = (type: string) => type.startsWith("image/")
        
    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4 shrink-0" />
        return <File className="w-4 h-4 shrink-0" />
    }

    const attachments = message.attachments

    return (
        <>
            {attachments.length > 0 && attachments.map((attachment) => (
                <div key={attachment.id+"-att-message"} className={cn("group flex items-end gap-2 mb-2", isMe ? "flex-row-reverse" : "flex-row")}>
                    {!isMe && isLastInSequence && participants.length > 2 && (
                        <UserAvatar 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${sender?.user.image}`}
                            fallback={(sender?.user.firstName.charAt(0)+""+sender?.user.lastName.charAt(0))}
                            className="h-8 w-8"
                            isOnline={isOnline}
                        />
                    )}

                    {!isMe && !isLastInSequence && participants.length > 2 && <div className="w-8" />}

                    <div
                        className={cn(
                            "p-2 max-w-[280px] break-words relative shadow border",
                            isMe ? "bg-primary/80 text-primary-foreground" : "bg-muted/80",
                            // Apply different border radius based on sequence position
                            isLastInSequence ? (isMe ? "rounded-2xl rounded-br-none" : "rounded-2xl rounded-bl-none") : "rounded-2xl",
                        )}
                    >
                        {message.content}

                        {isImage(attachment.type) ? (
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/api/attachments/${attachment.filename}` || "/placeholder.svg"}
                                alt="Attachment"
                                className="max-w-[250px] rounded object-cover"
                            />
                        ) : (
                            <div className="flex items-center gap-2 p-2 bg-secondary-foreground rounded">
                                {getFileIcon(attachment.type)}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-sm truncate">
                                            {attachment.originalName}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        {attachment.originalName}
                                    </TooltipContent>
                                </Tooltip>
                                
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => downloadFile(attachment.filename, attachment.originalName)}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

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
            ))}

            {message.content?.trim() && (
                <div className={cn("group flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                    {!isMe && isLastInSequence && participants.length > 2 && (
                        <UserAvatar 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${sender?.user.image}`}
                            fallback={(sender?.user.firstName.charAt(0)+""+sender?.user.lastName.charAt(0))}
                            className="h-8 w-8"
                            isOnline={isOnline}
                        />
                    )}

                    {!isMe && !isLastInSequence && participants.length > 2 && <div className="w-8" />}

                    <div
                        className={cn(
                            "p-2 max-w-[280px] break-words relative shadow border",
                            isMe ? "bg-primary/80 text-primary-foreground" : "bg-muted/80",
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
            )}
            
        </>
    )
}
