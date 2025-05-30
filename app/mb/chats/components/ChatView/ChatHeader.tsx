// components/chat/ChatHeader.tsx
import { Button } from "@/components/ui/button"
import { ChevronLeft, Phone, Search, Video } from "lucide-react"
import { ConversationFull } from "@/types/database"
import { UserAvatar } from "@/components/UserAvatar"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { useAuth } from "@/contexts/AuthContext"
import { getDisplayName } from "@/lib/utils"
import { useViewStore } from "@/hooks/useViewStore"
import { useCall } from "@/contexts/CallContext"

type ChatHeaderProps = {
    conversation: ConversationFull | null,
    isGroup: boolean
}

export default function ChatHeader({ conversation, isGroup }: ChatHeaderProps) {
    const {user} = useAuth()
    const {setChat, setView} = useViewStore()
    const {startCall} = useCall()

    const otherParticipants = isGroup && conversation ? getDisplayName(conversation, user) : null
    const otherParticipant = !isGroup && conversation ? conversation?.participants.find(p => p.userId !== user?.id)?.user : undefined
    
    const isOnline = useOnlineStatus(otherParticipant?.id) || undefined

    return (
        <header className="p-2 z-50 bg-background flex items-center justify-between border-b fixed left-0 top-0 right-0">
            <div className="flex items-center gap-2">
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                        setView("chat")
                        setChat(null)
                    }}
                >
                    <ChevronLeft className="size-6" />
                    <span className="sr-only">Back</span>
                </Button>
                <UserAvatar 
                    src={`${conversation?.isGroup ? "" : process.env.NEXT_PUBLIC_API_URL+"/uploads/profile/"+otherParticipant?.image}`}
                    fallback={(otherParticipant?.firstName?.charAt(0)+""+otherParticipant?.lastName?.charAt(0)) || "GR"}
                    isOnline={isOnline}
                    className="w-8 h-8 md:h-10 md:w-10"
                />
                <div>
                    <h1 className="font-bold line-clamp-1">{otherParticipant?.firstName || conversation?.title} {otherParticipant?.lastName || ""}</h1>
                    <p className="text-xs flex items-center gap-1 md:max-w-96 max-w-40 line-clamp-1 truncate">
                        {/* {isOnline ? <span className="size-2 rounded-full bg-green-500 shrink-0" /> : <span className="size-2 rounded-full bg-red-500 shrink-0" />} */}
                        {!isGroup ? (isOnline ? "Online" : "Offline") : otherParticipants}
                    </p>
                </div>
            </div>
            <div className="space-x-2 flex">
                <Button 
                    size={"icon"} 
                    variant={"ghost"}
                    onClick={() => {
                        if(!otherParticipant?.id) return
                        startCall(otherParticipant?.id)
                    }}
                >
                    <Video />
                    <span className="sr-only">Video call</span>
                </Button>
                <Button 
                    size={"icon"} 
                    variant={"ghost"}
                    onClick={() => {
                        if(!otherParticipant?.id) return
                        startCall(otherParticipant?.id)
                    }}
                >
                    <Phone />
                    <span className="sr-only">Phone call</span>
                </Button>
                <Button size={"icon"} variant={"ghost"}>
                    <Search />
                    <span className="sr-only">Search</span>
                </Button>
            </div>
        </header>
    )
}
