import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/UserAvatar"

interface ContactCardProps {
    src?: string
    fallback: string
    isOnline?: boolean
    text?: string | ReactNode
    actions?: ReactNode
    className?: string
}

export default function ContactCard({
    src = "https://github.com/shadcn.png",
    fallback,
    isOnline,
    text,
    actions,
    className,
}: ContactCardProps) {
    return (
        <div
            className={cn("p-4 bg-muted rounded-lg flex items-center gap-2", className)}
        >
            <UserAvatar src={src} fallback={fallback} isOnline={isOnline} />
            <div>
                {typeof text === "string" ? (
                    <p>{text}</p>
                ) : (
                    text
                )}
            </div>
            {actions && <div className="ml-auto space-x-2">{actions}</div>}
        </div>
    )
}
