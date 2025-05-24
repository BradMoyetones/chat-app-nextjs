// components/chat/ChatHeader.tsx
import { Button } from "@/components/ui/button"
import { Phone, Search, Video } from "lucide-react"
import { User } from "@/types/database"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { UserAvatar } from "@/components/UserAvatar"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"

type ChatHeaderProps = {
    participant: User | null
}

export default function ChatHeader({ participant }: ChatHeaderProps) {

    const isOnline = useOnlineStatus(participant?.id)

    return (
        <header className="p-4 bg-background flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
                <UserAvatar 
                    src="https://github.com/shadcn.png"
                    fallback={(participant?.firstName?.charAt(0)+""+participant?.lastName?.charAt(0)) || ""}
                    isOnline={isOnline}
                    className="h-10 w-10"
                />
                <div>
                    <h1 className="font-bold line-clamp-1">{participant?.firstName} {participant?.lastName}</h1>
                    <p className="text-xs flex items-center gap-1">
                        {/* {isOnline ? <span className="size-2 rounded-full bg-green-500 shrink-0" /> : <span className="size-2 rounded-full bg-red-500 shrink-0" />} */}
                        {isOnline ? "Online" : "Offline"}
                    </p>
                </div>
            </div>
            <div className="space-x-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={"icon"} variant={"ghost"}>
                            <Video />
                            <span className="sr-only">Video call</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Video call</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={"icon"} variant={"ghost"}>
                            <Phone />
                            <span className="sr-only">Phone call</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Phone call</p>
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size={"icon"} variant={"ghost"}>
                            <Search />
                            <span className="sr-only">Search</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>Search</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </header>
    )
}
