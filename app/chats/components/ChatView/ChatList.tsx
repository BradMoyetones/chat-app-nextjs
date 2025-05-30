import { Input } from '@/components/ui/input'
import { useConversations } from '@/contexts/ConversationContext'
import { Filter, PlusCircle, Search } from 'lucide-react'
import { useViewStore } from '@/hooks/useViewStore'
import ChatListItem from './ChatListItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import HeaderList from '@/components/HeaderList'
import { useMemo, useState } from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StartConversation } from '../ContactsView/StartConversation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export default function ChatList() {
    const {chatId, setChat} = useViewStore()
    const { conversations, typingUsers } = useConversations()
    const [filter, setFilter] = useState<"all" | "groups" | "directs">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [openIC, setOpenIC] = useState(false);

    const filteredConversations = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return conversations
            .filter((c) => {
                if (filter === "groups" && !c.isGroup) return false;
                if (filter === "directs" && c.isGroup) return false;
                return true;
            })
            .filter((c) => {
                const title = c.title?.toLowerCase() ?? "";

                const participants = c.participants
                    .map((p) => `${p.user.firstName} ${p.user.lastName}`.toLowerCase())
                    .join(" ");

                const messageContent = c.messages[0]?.content?.toLowerCase() ?? "";

                return (
                    title.includes(query) ||
                    participants.includes(query) ||
                    messageContent.includes(query)
                );
            })
            .sort((a, b) => {
                const aDate = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
                const bDate = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
                return bDate - aDate;
            });
    }, [conversations, filter, searchQuery]);

    const getEmptyMessage = () => {
        const trimmedQuery = searchQuery.trim().toLowerCase();
        const filterLabel = filter === "groups" ? "group chats" : filter === "directs" ? "direct messages" : "all conversations";

        if (trimmedQuery) {
            return `No results found for "${trimmedQuery}" in ${filterLabel}.`;
        } else {
            return `No conversations found in ${filterLabel}.`;
        }
    };


    return (
        <>
        <ScrollArea className='h-screen'>
            <div className=''>
                <HeaderList>
                    <div className='flex justify-between'>
                        Chats
                            
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size={"icon"}
                                    variant={"ghost"}
                                    onClick={() => setOpenIC((open) => !open)}
                                >
                                    <PlusCircle />
                                    <span className='sr-only'>Start Conversation</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>
                                    Start Conversation 
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </HeaderList>

                <div className='relative mx-4'>
                    <Input 
                        placeholder='Search' 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='my-4 pl-8 pr-8' 
                        type='text'
                    />
                    <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Filter className="absolute right-3 top-2.5 ml-auto h-4 w-4 text-muted-foreground cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Filters</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuCheckboxItem
                                onClick={() => setFilter("all")}
                                checked={filter === "all"}
                            >
                                all
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                onClick={() => setFilter("groups")}
                                checked={filter === "groups"}
                            >
                                groups
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                onClick={() => setFilter("directs")}
                                checked={filter === "directs"}
                            >
                                directs
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

                <div className='space-y-2 px-4 pb-24'>
                    {filteredConversations.length > 0 ? filteredConversations
                        .map((con) => (
                            <ChatListItem
                                key={con.id}
                                conversation={con}
                                isActive={chatId === con.id}
                                onClick={setChat}
                                isTyping={typingUsers[con.id]}
                            />
                        )): (
                            <div className="py-6 text-center">
                                <p className="text-muted-foreground text-sm">{getEmptyMessage()}</p>
                            </div>
                        )}
                </div>
            </div>
        </ScrollArea>
        <StartConversation 
            open={openIC} 
            setOpen={setOpenIC} 
        />
        </>
    )
}
