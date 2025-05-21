/* eslint-disable @next/next/no-img-element */
import { Input } from '@/components/ui/input'
import { useConversations } from '@/contexts/ConversationContext'
import { Filter, Search } from 'lucide-react'
import React from 'react'

type ChatListProps = {
    onSelectChat: (chatId: number) => void
}
export default function ChatList({onSelectChat}: ChatListProps) {
    const {conversations} = useConversations()

    return (
        <div className='p-4'>
            <h1 className='font-bold text-2xl mt-4'>Chats</h1>
            <div className='relative'>
                <Input placeholder='Search' className='my-4 pl-8 pr-8' />
                <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
            </div>
            <div>
                {conversations.map((con) => (
                    <div key={con.id+"-card-chat-list"} className='flex items-center p-4 bg-white rounded-xl shadow cursor-pointer' onClick={() => onSelectChat(con.id)}>
                        <div className='rounded-full size-10 overflow-hidden shrink-0'>
                            <img src="/favicon.ico" alt="" />
                        </div>
                        <div className='text-left ml-2 w-full'>
                            <h3 className='font-semibold line-clamp-1'>{con.participants[0].user.firstName} {con.participants[0].user.lastName}</h3>
                            <p className='text-muted-foreground line-clamp-1'>absolute right-2 top-2 text-muted-foreground cursor-pointer</p>
                        </div>
                        <div className='ml-2 flex items-start'>
                            <p className='text-xs'>8:10pm</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
