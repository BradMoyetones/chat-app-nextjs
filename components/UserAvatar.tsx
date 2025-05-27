import type React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type UserAvatarProps = React.ComponentPropsWithoutRef<typeof Avatar> & {
    src: string
    fallback: string
    isOnline?: boolean
    statusPosition?: "top-right" | "bottom-right" | "bottom-left" | "top-left"
}

export function UserAvatar({
    src,
    fallback,
    isOnline,
    statusPosition = "bottom-right",
    className,
    ...props
}: UserAvatarProps) {
    const statusPositionClasses = {
        "top-right": "top-0 right-0",
        "bottom-right": "bottom-0 right-0",
        "bottom-left": "bottom-0 left-0",
        "top-left": "top-0 left-0",
    }

    return (
        <div className="relative inline-block">
            <Avatar className={cn("text-primary", className)} {...props}>
                <AvatarImage src={src || "/placeholder.svg"} alt={`${fallback}'s avatar`} loading="lazy" className="object-cover object-center" />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            {isOnline !== undefined && (
                <span
                    className={cn(
                        "absolute block h-4 w-4 rounded-full border-2 border-background",
                        isOnline ? "bg-green-500" : "bg-gray-400",
                        statusPositionClasses[statusPosition],
                    )}
                    aria-hidden="true"
                />
            )}
        </div>
    )
}
