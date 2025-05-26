import { ViewType } from "@/hooks/useViewStore"
import { LucideIcon, MessageCircleMore, Phone, Settings, Users2Icon } from "lucide-react"

export type LinkType = {
    name: string,
    icon: LucideIcon,
    href: ViewType
}

export const links: LinkType[] = [
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
