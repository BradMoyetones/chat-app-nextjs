/* eslint-disable @next/next/no-img-element */
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useConversations } from '@/contexts/ConversationContext'
import { ConversationFull } from '@/types/database'
import { Filter, Search } from 'lucide-react'
import React from 'react'
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns'
import { useViewStore } from '@/hooks/useViewStore'

const getFormattedTime = (dateString: string) => {
    const date = parseISO(dateString)

    if (isToday(date)) {
        return format(date, 'h:mm a')
    }

    if (isYesterday(date)) {
        return 'Yesterday'
    }

    const daysDiff = differenceInDays(new Date(), date)

    if (daysDiff <= 4) {
        return format(date, 'EEEE') // Monday, Tuesday, ...
    }

    return format(date, 'dd/MM/yyyy')
}

export default function ChatList() {
    const {chatId, setChat} = useViewStore()
    
    const { conversations } = useConversations()
    const { user } = useAuth()

    const getDisplayName = (con: ConversationFull) => {
        if (!user) return ""

        if (!con.isGroup) {
            const other = con.participants.find(p => p.user.id !== user.id)
            return other ? `${other.user.firstName} ${other.user.lastName}` : "Chat"
        }

        const names = con.participants
            .map(p => `${p.user.firstName} ${p.user.lastName}`)
        const shown = names.slice(0, 4)
        const remaining = names.length - shown.length

        return remaining > 0
            ? `${shown.join(", ")} y ${remaining} más`
            : shown.join(", ")
    }

    return (
        <div className='p-4'>
            <h1 className='font-bold text-2xl mt-4'>Chats</h1>

            <div className='relative'>
                <Input placeholder='Search' className='my-4 pl-8 pr-8' />
                <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
            </div>

            <div className='space-y-2'>
                {conversations.map((con) => (
                    <div
                        key={con.id + "-card-chat-list"}
                        className={`flex items-center p-4 rounded-xl shadow cursor-pointer ${chatId === con.id ? 'bg-primary text-primary-foreground' : 'bg-zinc-100 dark:bg-zinc-900'}`}
                        onClick={() => setChat(con.id)}
                    >
                        <div className='rounded-full size-10 overflow-hidden shrink-0'>
                            <img src="/favicon.ico" alt="" />
                        </div>
                        <div className='text-left ml-2 w-full'>
                            <h3 className='font-semibold line-clamp-1'>
                                {getDisplayName(con)}
                            </h3>
                            <p className='text-muted-foreground line-clamp-1'>
                                {con.messages[0].content}
                            </p>
                        </div>
                        <div className='ml-2 flex flex-col h-full mb-auto'>
                            <p className='text-xs text-nowrap h-full'>
                                {getFormattedTime(con.messages[0].createdAt)}
                            </p>
                            {con.unseenCount > 0 && (
                                <span className='shrink-0 size-5 text-sm text-primary text-center rounded-full bg-secondary ml-auto mt-2'>
                                    {con.unseenCount}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
