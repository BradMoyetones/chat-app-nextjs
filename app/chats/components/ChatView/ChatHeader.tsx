// components/chat/ChatHeader.tsx
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Search, Video } from "lucide-react"
import socket from "@/lib/socket"
import { User } from "@/types/database"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type ChatHeaderProps = {
    participant: User | null
}

export default function ChatHeader({ participant }: ChatHeaderProps) {
    const [isOnline, setIsOnline] = useState(false)

    useEffect(() => {
        if (!participant?.id) return

        // Preguntar si está online al montar
        socket.emit("usuario:estado", participant.id, (online: boolean) => {
            setIsOnline(online)
        })

        // Escuchar cambios
        const handleOnline = (userId: number) => {
            if (userId === participant.id) setIsOnline(true)
        }
        const handleOffline = (userId: number) => {
            if (userId === participant.id) setIsOnline(false)
        }

        socket.on("usuario:online", handleOnline)
        socket.on("usuario:offline", handleOffline)

        return () => {
            socket.off("usuario:online", handleOnline)
            socket.off("usuario:offline", handleOffline)
        }
    }, [participant?.id])

    return (
        <header className="p-4 bg-background flex justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="size-10">
                    <AvatarImage src="https://github.com/shadcn.png" alt={participant?.lastName} />
                    <AvatarFallback>{participant?.firstName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-bold line-clamp-1">{participant?.firstName} {participant?.lastName}</h1>
                    <p className="text-xs flex items-center gap-1">
                        {isOnline ? <span className="size-2 rounded-full bg-green-500 shrink-0" /> : <span className="size-2 rounded-full bg-red-500 shrink-0" />}
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
