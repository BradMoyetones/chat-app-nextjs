import { ModeToggle } from '@/components/ModeToggle'
import { Button } from '@/components/ui/button'
import { useViewStore, ViewType } from '@/hooks/useViewStore'
import { LucideIcon, MessageCircleMore, Phone, Settings, Users2Icon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from '@/components/UserAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type LinkType = {
    name: string,
    icon: LucideIcon,
    href: ViewType
}
const links: LinkType[] = [
    {
        name: "Messages",
        icon: MessageCircleMore,
        href: "chat"
    },
    {
        name: "Contacts",
        icon: Users2Icon,
        href: "contacts"
    },
    {
        name: "Calls",
        icon: Phone,
        href: "calls"
    },
    {
        name: "Settings",
        icon: Settings,
        href: "settings"
    }
]

export default function Sidebar() {
    const { type, setView, setChat } = useViewStore()
    const {user} = useAuth()
    const isOnline = useOnlineStatus(user?.id)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setChat(null)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [setChat])
    
    return (
        <div className='relative flex flex-col justify-start items-center h-full w-full gap-2 p-4'>
            <button 
                className='bg-background rounded-md p-1 cursor-pointer'
                onClick={() => {
                    setView("chat")
                    setChat(null)
                }}
            >
                <Image 
                    src={"/favicon.svg"}
                    width={30}
                    height={30}
                    alt='Logo'
                    loading='lazy'
                />
            </button>
            <div className='w-min space-y-4 mt-10'>
                {links.map((link, index) => (
                    <Tooltip key={index+"-sidebar-item"}>
                        <TooltipTrigger asChild>
                            <Button 
                                onClick={() => setView(link.href)}
                                size={"icon"}
                                variant={type === link.href ? "default" : "outline"}
                                className={`cursor-pointer ${type === link.href ? "text-primary-foreground" : "text-primary"}`} 
                            >
                                <link.icon />
                                <span className='sr-only'>{link.name}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>{link.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                
            </div>
            <div className='absolute bottom-4 flex flex-col gap-4 items-center'>
                <ModeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <UserAvatar 
                            src="https://github.com/shadcn.png"
                            fallback={(user?.firstName?.charAt(0)+""+user?.lastName?.charAt(0)) || ""}
                            isOnline={isOnline}
                            className="h-10 w-10 cursor-pointer"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setView("profile")}
                        >
                            Profile
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </div>
    )
}
