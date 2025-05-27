import HeaderList from '@/components/HeaderList'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Filter, MessageCircleMore, PhoneCall, PlusCircle, Search, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SearchUserModal } from './SearchUserModal'
import { useState } from 'react'
import Spinner from '@/components/Spinner'
import { StartConversation } from './StartConversation'
import ContactCard from './ContactCard'
import { useContacts } from '@/contexts/ContactContext'
import { useCall } from '@/contexts/CallContext'

export default function ContactsList() {
    const { filteredItems, setFilter, searchQuery, setSearchQuery, loadingIds, deleteFriend, onlineFriends, acceptRequest } = useContacts()
    const [open, setOpen] = useState(false)
    const [openIC, setOpenIC] = useState(false)

    const [participantId, setParticipantId] = useState<number | null>(null)
    const { handleCall } = useCall();

    return (
        <>
            <ScrollArea className='h-screen'>

                <div className=''>
                    <HeaderList>
                        <div className='flex justify-between'>
                            Contacts
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={"icon"}
                                        variant={"ghost"}
                                        onClick={() => setOpen((open) => !open)}
                                    >
                                        <PlusCircle />
                                        <span className='sr-only'>Add Friend</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>
                                        Add Friend 
                                        Press{" "}
                                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                            <span className="text-xs">⌘</span>J
                                        </kbd>
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
                        <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                    </div>

                    <div className='space-y-2 px-4'>
                        <Tabs defaultValue="online" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="online" onClick={() => setFilter("online")}>Online</TabsTrigger>
                                <TabsTrigger value="all" onClick={() => setFilter("all")}>All</TabsTrigger>
                                <TabsTrigger value="pending" onClick={() => setFilter("pending")}>Pending</TabsTrigger>
                            </TabsList>
                            <TabsContent value="online" className='space-y-2'>
                                {filteredItems.length > 0 ? filteredItems.map(contact => {
                                    return (
                                        <ContactCard 
                                            key={contact.id+"-card-contact-online"}
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${contact.friend?.image}`}
                                            fallback={(contact.friend?.firstName.charAt(0)+""+contact.friend?.lastName.charAt(0)) || ""}
                                            isOnline={true}
                                            text={
                                                <div>
                                                    <p className='line-clamp-1'>{contact.friend?.firstName} {contact.friend?.lastName}</p>
                                                    <p className='text-xs text-muted-foreground'>Online</p>
                                                </div>
                                            }
                                            actions={
                                                <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            size={"sm"}
                                                            className='cursor-pointer ml-auto'
                                                            onClick={() => {
                                                                handleCall(contact.friend?.id)
                                                            }}
                                                        >
                                                            <PhoneCall />
                                                            <span className='sr-only'>Start Call</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Start Call</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            size={"sm"}
                                                            className='cursor-pointer ml-auto'
                                                            onClick={() => {
                                                                setOpenIC(prev => !prev)
                                                                setParticipantId(contact.friend?.id)
                                                            }}
                                                            disabled={loadingIds.has(contact.id)}
                                                        >
                                                            {loadingIds.has(contact.id) ? (
                                                                <Spinner />
                                                            ) : (
                                                                <MessageCircleMore />
                                                            )}
                                                            <span className='sr-only'>Start Conversation</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Start Conversation</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={"destructive"}
                                                            size={"sm"}
                                                            className='cursor-pointer ml-auto'
                                                            onClick={() => deleteFriend(contact.id)}
                                                            disabled={loadingIds.has(contact.id)}
                                                        >
                                                            {loadingIds.has(contact.id) ? (
                                                                <Spinner />
                                                            ) : (
                                                                <Trash2 />
                                                            )}
                                                            <span className='sr-only'>Delete Friend</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Delete Friend</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                </>
                                            }
                                        />
                                    )
                                }): (
                                    <div className='text-muted-foreground p-4 text-center'>
                                        <p>No friends are online right now.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="all" className='space-y-2'>
                                {filteredItems.length > 0 ? filteredItems.map((contact) => {
                                    const isOnline = onlineFriends.includes(contact.friend?.id)
                                    return (
                                        <ContactCard 
                                            key={contact.id+"-card-contact-all"}
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${contact.friend?.image}`}
                                            fallback={(contact.friend?.firstName.charAt(0)+""+contact.friend?.lastName.charAt(0)) || ""}
                                            isOnline={isOnline}
                                            text={
                                                <div>
                                                    <p className='line-clamp-1'>{contact.friend?.firstName} {contact.friend?.lastName}</p>
                                                    <p className='text-xs text-muted-foreground'>{isOnline ? 'Online' : 'Offline'}</p>
                                                </div>
                                            }
                                            actions={
                                                <>
                                                {isOnline && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                size={"sm"}
                                                                className='cursor-pointer ml-auto'
                                                                onClick={() => {
                                                                    handleCall(contact.friend?.id)
                                                                }}
                                                            >
                                                                <PhoneCall />
                                                                <span className='sr-only'>Start Call</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p>Start Call</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            size={"sm"}
                                                            className='cursor-pointer ml-auto'
                                                            onClick={() => {
                                                                setOpenIC(prev => !prev)
                                                                setParticipantId(contact.friend?.id)
                                                            }}
                                                            disabled={loadingIds.has(contact.id)}
                                                        >
                                                            {loadingIds.has(contact.id) ? (
                                                                <Spinner />
                                                            ) : (
                                                                <MessageCircleMore />
                                                            )}
                                                            <span className='sr-only'>Start Conversation</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Start Conversation</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant={"destructive"}
                                                            size={"sm"}
                                                            className='cursor-pointer ml-auto'
                                                            onClick={() => deleteFriend(contact.id)}
                                                            disabled={loadingIds.has(contact.id)}
                                                        >
                                                            {loadingIds.has(contact.id) ? (
                                                                <Spinner />
                                                            ) : (
                                                                <Trash2 />
                                                            )}
                                                            <span className='sr-only'>Delete Friend</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        <p>Delete Friend</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                </>
                                            }
                                        />
                                    )
                                }): (
                                    <div className='text-muted-foreground p-4 text-center'>
                                        <p>You haven&apos;t added any friends yet.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="pending" className='space-y-2'>
                                {filteredItems.length > 0 ? filteredItems.map((request) => (
                                    <ContactCard 
                                        key={request.id+"-card-contact-pending"}
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${request.sender.image}`}
                                        fallback={(request.sender.firstName.charAt(0)+""+request.sender.lastName.charAt(0)) || ""}
                                        text={request.sender.firstName+" "+request.sender.lastName}
                                        actions={
                                            <Button
                                                variant={"outline"}
                                                size={"sm"}
                                                className='cursor-pointer ml-auto'
                                                onClick={() => acceptRequest(request.id)}
                                                disabled={loadingIds.has(request.id)}
                                            >
                                                {loadingIds.has(request.id) ? (
                                                    <Spinner />
                                                ) : (
                                                    "Accept"
                                                )}
                                            </Button>
                                        }
                                    />
                                )):(
                                    <div className='text-muted-foreground p-4 text-center'>
                                        <p>You don&apos;t have any friend requests at the moment.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                    </div>
                </div>
            </ScrollArea>
            <SearchUserModal open={open} setOpen={setOpen} />
            <StartConversation 
                open={openIC} 
                setOpen={setOpenIC} 
                participantId={participantId}
                setParticipantId={setParticipantId}
            />
        </>
    )
}
