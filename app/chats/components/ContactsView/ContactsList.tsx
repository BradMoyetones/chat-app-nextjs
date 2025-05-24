import HeaderList from '@/components/HeaderList'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Filter, MessageCircleMore, PlusCircle, Search, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SearchUserModal } from './SearchUserModal'
import { useEffect, useState } from 'react'
import api from '@/lib/axios'
import { ContactRequestFull } from '@/types/database'
import socket from '@/lib/socket'
import { toast } from 'sonner'
import axios from 'axios'
import Spinner from '@/components/Spinner'
import { StartConversation } from './StartConversation'
import ContactCard from './ContactCard'

export default function ContactsList() {
    const [open, setOpen] = useState(false)
    const [openIC, setOpenIC] = useState(false)
    const [participantId, setParticipantId] = useState<number | null>(null)
    // Contacts
    const [contacts, setContacts] = useState<ContactRequestFull[]>([])
    const [onlineFriends, setOnlineFriends] = useState<number[]>([])

    // Requests
    const [receivedRequests, setReceivedRequests] = useState<ContactRequestFull[]>([])

    // Loading
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())
    
    const fetchData = async() => {
        try{
            const response = await api.get('/api/contacts')
            setContacts(response.data.friends)
            setReceivedRequests(response.data.receivedRequests)            
        }catch(e){
            console.log(e);
        }
    }

    const acceptRequest = async (id: number) => {
        setLoadingIds(prev => new Set(prev).add(id))
        try {
            await api.post(`/api/contacts/request/${id}/accept`)

            setReceivedRequests(prev => {
                const renew = prev.filter(p => p.id !== id)
                return renew
            })

            toast.success("Friend request sent!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Something went wrong while sending the accept request.";
            toast.error(errorMessage)
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    const deleteFriend = async (id: number) => {
        setLoadingIds(prev => new Set(prev).add(id))
        try {
            await api.delete(`/api/contacts/${id}/delete`)

            toast.success("Friend delete!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Something went wrong while sending the accept request.";
            toast.error(errorMessage)
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(id)
                return newSet
            })
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        const handleNewRequest = (newRequest: ContactRequestFull) => {
            setReceivedRequests(prev => [newRequest, ...prev])
        }
        const handleCancelRequest = (cancelRequest: ContactRequestFull) => {
            setReceivedRequests(prev => {
                const renew = prev.filter(p => p.id !== cancelRequest.id)
                return renew
            })
        }
        const handleAcceptRequest = (acceptRequest: ContactRequestFull) => {
            setContacts(prev => [...prev, acceptRequest])
        }
        const handleOnline = (id: number) => {
            setOnlineFriends(prev => [...prev, id])
        }
        const handleOffline = (id: number) => {
            setOnlineFriends(prev => prev.filter(pid => pid !== id))
        }
        const handleDeleteFriend = (deletedFriend: ContactRequestFull) => {
            setContacts(prev => {
                const renew = prev.filter(p => p.id !== deletedFriend.id)
                return renew
            })
        }

        socket.on('contact:request:received', handleNewRequest)
        socket.on('contact:request:accept', handleAcceptRequest)
        socket.on('contact:request:cancel', handleCancelRequest)
        socket.on('contact:deleted', handleDeleteFriend)


        socket.on('usuario:online', handleOnline)
        socket.on('usuario:offline', handleOffline)

        return () => {
            socket.off('contact:request:received', handleNewRequest)
            socket.off('contact:request:accept', handleAcceptRequest)
            socket.off('contact:request:cancel', handleCancelRequest)
            socket.off('contact:deleted', handleDeleteFriend)

            socket.off('usuario:online', handleOnline)
            socket.off('usuario:offline', handleOffline)
        }
    }, [])

    useEffect(() => {
        const ids = contacts.map(c =>
            c.friend.id
        )

        socket.emit('amigos:online', ids, (onlineIds: number[]) => {
            setOnlineFriends(onlineIds)
        })
    }, [contacts])

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
                        <Input placeholder='Search' className='my-4 pl-8 pr-8' />
                        <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                        <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                    </div>

                    <div className='space-y-2 px-4'>
                        <Tabs defaultValue="online" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="online">Online</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                            </TabsList>
                            <TabsContent value="online" className='space-y-2'>
                                {contacts.length > 0 ? contacts.map(contact => {
                                    // Saber si ese amigo está online
                                    const isOnline = onlineFriends.includes(contact.friend.id)

                                    return (
                                        <ContactCard 
                                            key={contact.id+"-card-contact-online"}
                                            fallback={(contact.friend.firstName.charAt(0)+""+contact.friend.lastName.charAt(0)) || ""}
                                            isOnline={isOnline}
                                            text={
                                                <div>
                                                    {contact.friend.firstName} {contact.friend.lastName}
                                                    <p className='text-xs text-muted-foreground'>{isOnline ? 'Online' : 'Offline'}</p>
                                                </div>
                                            }
                                            actions={
                                                <>
                                                <Button
                                                    variant={"outline"}
                                                    size={"sm"}
                                                    className='cursor-pointer ml-auto'
                                                    onClick={() => {
                                                        setOpenIC(prev => !prev)
                                                        setParticipantId(contact.friend.id)
                                                    }}
                                                    disabled={loadingIds.has(contact.id)}
                                                >
                                                    {loadingIds.has(contact.id) ? (
                                                        <Spinner />
                                                    ) : (
                                                        <MessageCircleMore />
                                                    )}
                                                </Button>
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
                                                </Button>
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
                                {contacts.length > 0 ? contacts.map((contact) => (
                                    <ContactCard 
                                        key={contact.id+"-card-contact-all"}
                                        fallback={(contact.friend.firstName.charAt(0)+""+contact.friend.lastName.charAt(0)) || ""}
                                        text={contact.friend.firstName+" "+contact.friend.lastName}
                                        actions={
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
                                                    "Delete"
                                                )}
                                            </Button>
                                        }
                                    />
                                )): (
                                    <div className='text-muted-foreground p-4 text-center'>
                                        <p>You haven&apos;t added any friends yet.</p>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="pending" className='space-y-2'>
                                {receivedRequests.length > 0 ? receivedRequests.map((request) => (
                                    <ContactCard 
                                        key={request.id+"-card-contact-pending"}
                                        fallback={(request.sender.firstName?.charAt(0)+""+request.sender.lastName?.charAt(0)) || ""}
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
                contacts={contacts}
                open={openIC} 
                setOpen={setOpenIC} 
                participantId={participantId}
                setParticipantId={setParticipantId}
            />
        </>
    )
}
