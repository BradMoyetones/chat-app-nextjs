'use client'
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import socket from "@/lib/socket"
import api from "@/lib/axios"
import { ContactRequestFull } from "@/types/database"

interface ContactContextProps {
    contacts: ContactRequestFull[]
    onlineFriends: number[]
    receivedRequests: ContactRequestFull[]
    loadingIds: Set<number>
    filter: "online" | "pending" | "all"
    setFilter: React.Dispatch<React.SetStateAction<"online" | "pending" | "all">>
    searchQuery: string
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>
    filteredItems: ContactRequestFull[]
    acceptRequest: (id: number) => void
    deleteFriend: (id: number) => void
}

const ContactContext = createContext<ContactContextProps | undefined>(undefined)

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
    const [contacts, setContacts] = useState<ContactRequestFull[]>([])
    const [receivedRequests, setReceivedRequests] = useState<ContactRequestFull[]>([])
    const [onlineFriends, setOnlineFriends] = useState<number[]>([])
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())

    const [filter, setFilter] = useState<"online" | "pending" | "all">("online")
    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = async () => {
        try {
            const res = await api.get('/api/contacts')
            setContacts(res.data.friends)
            setReceivedRequests(res.data.receivedRequests)
        } catch (e) {
            console.log(e)
        }
    }

    const acceptRequest = async (id: number) => {
        setLoadingIds(prev => new Set(prev).add(id))
        try {
            await api.post(`/api/contacts/request/${id}/accept`)
            setReceivedRequests(prev => prev.filter(p => p.id !== id))
            toast.success("Friend request accepted!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Error accepting request."
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
            setContacts(prev => prev.filter(p => p.friend.id !== id))
            toast.success("Friend deleted!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Error deleting friend."
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
            setReceivedRequests(prev => prev.filter(p => p.id !== cancelRequest.id))
        }
        const handleAcceptRequest = (acceptRequest: ContactRequestFull) => {
            setContacts(prev => [...prev, acceptRequest])
        }
        const handleDeleteFriend = (deletedFriend: ContactRequestFull) => {
            setContacts(prev => prev.filter(p => p.id !== deletedFriend.id))
        }
        const handleOnline = (id: number) => {
            setOnlineFriends(prev => [...prev, id])
        }
        const handleOffline = (id: number) => {
            setOnlineFriends(prev => prev.filter(pid => pid !== id))
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
        const ids = contacts.map(c => c.friend.id)
            socket.emit('amigos:online', ids, (onlineIds: number[]) => {
            setOnlineFriends(onlineIds)
        })
    }, [contacts])

    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        if (filter === "online") {
            return contacts
                .filter(c => onlineFriends.includes(c.friend.id))
                .filter(c => `${c.friend.firstName} ${c.friend.lastName}`.toLowerCase().includes(query))
        }

        if (filter === "pending") {
            return receivedRequests
                .filter(r => `${r.sender.firstName} ${r.sender.lastName}`.toLowerCase().includes(query))
        }

        return contacts
            .filter(c => `${c.friend.firstName} ${c.friend.lastName}`.toLowerCase().includes(query))
    }, [filter, searchQuery, contacts, onlineFriends, receivedRequests])

    return (
        <ContactContext.Provider value={{
            contacts,
            onlineFriends,
            receivedRequests,
            loadingIds,
            filter,
            setFilter,
            searchQuery,
            setSearchQuery,
            filteredItems,
            acceptRequest,
            deleteFriend
        }}>
            {children}
        </ContactContext.Provider>
    )
}

export const useContacts = () => {
    const context = useContext(ContactContext)
    if (!context) throw new Error("useContacts must be used within a ContactProvider")
    return context
}
