import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Check, CheckCheck } from "lucide-react";
import { Message, ParticipantFull } from "@/types/database";
import { UserAvatar } from "../UserAvatar";

interface TextMessageCardProps {
    message: Message;
    isMe: boolean;
    isRead: boolean;
    isOnline: boolean;
    isLastInSequence: boolean;
    participants: ParticipantFull[];
    sender?: ParticipantFull;
    timeString: string;
}

export function TextMessageCard({
    message,
    isMe,
    isRead,
    isOnline,
    isLastInSequence,
    participants,
    sender,
    timeString,
}: TextMessageCardProps) {
    const content = message.content?.trim();
    if (!content) return null;

    return (
        <div className={cn("group flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
            {!isMe && isLastInSequence && participants.length > 2 && (
                <UserAvatar
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${sender?.user.image}`}
                    fallback={`${sender?.user.firstName.charAt(0)}${sender?.user.lastName.charAt(0)}`}
                    className="h-8 w-8"
                    isOnline={isOnline}
                />
            )}

            {!isMe && !isLastInSequence && participants.length > 2 && <div className="w-8" />}

            <div
                className={cn(
                    "px-4 py-2.5 max-w-[280px] break-words relative shadow border",
                    isMe ? "bg-primary/80 text-primary-foreground" : "bg-muted/80",
                    isLastInSequence
                        ? isMe
                        ? "rounded-2xl rounded-br-none"
                        : "rounded-2xl rounded-bl-none"
                        : "rounded-2xl"
                )}
            >
                {content}

                <div
                    className={cn(
                        "flex w-fit items-center text-xs mt-1",
                        isMe ? "self-end ml-auto" : "self-start ml-auto"
                    )}
                >
                    <span
                        className={cn(
                        "opacity-70 text-nowrap",
                        isMe ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                    >
                        {timeString}
                    </span>

                    {isMe && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="ml-1 text-nowrap">
                                    {isRead ? (
                                        <CheckCheck
                                            className={cn(
                                                "h-3.5 w-3.5",
                                                isMe ? "text-primary-foreground" : "text-primary"
                                            )}
                                        />
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
    );
}
