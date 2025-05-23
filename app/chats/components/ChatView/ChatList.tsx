import { Input } from '@/components/ui/input'
import { useConversations } from '@/contexts/ConversationContext'
import { Filter, Search } from 'lucide-react'
import { useViewStore } from '@/hooks/useViewStore'
import ChatListItem from './ChatListItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import HeaderList from '@/components/HeaderList'



export default function ChatList() {
    const {chatId, setChat} = useViewStore()
    const { conversations } = useConversations()

    return (
        <ScrollArea className='h-screen'>

            <div className=''>
                <HeaderList>
                    Chats
                </HeaderList>

                <div className='relative mx-4'>
                    <Input placeholder='Search' className='my-4 pl-8 pr-8' />
                    <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                    <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                </div>

                <div className='space-y-2 px-4'>
                    {conversations.map((con) => (
                        <ChatListItem
                            key={con.id}
                            conversation={con}
                            isActive={chatId === con.id}
                            onClick={setChat}
                        />
                    ))}
                </div>
            </div>
        </ScrollArea>
    )
}
