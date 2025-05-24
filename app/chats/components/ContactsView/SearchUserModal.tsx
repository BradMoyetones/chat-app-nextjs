"use client"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import api from "@/lib/axios"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { UserSearh } from "@/types/database"
import { UserAvatar } from "@/components/UserAvatar"
import Loader from "@/components/Loader"
import { buttonVariants } from "@/components/ui/button"
import Spinner from "@/components/Spinner"
import { toast } from "sonner"
import axios from "axios"


export function SearchUserModal({open, setOpen}: {open: boolean, setOpen: Dispatch<SetStateAction<boolean>>}) {
    const [query, setQuery] = useState("")
    const [users, setUsers] = useState<UserSearh[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const search = async (q: string) => {
        try {
            setIsLoading(true)
            const response = await api.get('/api/users/search', {
            params: { q },
            })
            setUsers(response.data)
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }

    const sendRequest = async (receiverId: number) => {
        setLoadingIds(prev => new Set(prev).add(receiverId))
        try {
            const response = await api.post('/api/contacts/request', { receiverId })

            const newRequest = response.data
            
            setUsers(prev =>
                prev.map(user => {
                    if (user.id === receiverId) {
                        return {
                            ...user,
                            receivedRequests: [newRequest], // porque debería ser solo una si está pendiente
                        }
                    }
                    return user
                })
            )

            toast.success("Friend request sent!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Something went wrong while sending the request.";
            toast.error(errorMessage)
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(receiverId)
                return newSet
            })
        }
    }

    const cancelRequest = async (receiverId: number, id: number) => {
        setLoadingIds(prev => new Set(prev).add(receiverId))
        try {
            await api.delete(`/api/contacts/request/${id}/cancel`)

            setUsers(prev =>
                prev.map(user => {
                    if (user.receivedRequests?.[0]?.id === id) {
                        return {
                            ...user,
                            receivedRequests: [], // limpiamos la solicitud
                        }
                    }
                    return user
                })
            )

            toast.success("Friend request cancel!")
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Something went wrong while sending the request.";
            toast.error(errorMessage)
        } finally {
            setLoadingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(receiverId)
                return newSet
            })
        }
    }

    useEffect(() => {
        if(!query.trim()) {
            setUsers([])
            return
        }
        search(query)
    }, [query])
    

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Search users..." />
            <CommandList>
                {!isLoading && users.length === 0 ? <CommandEmpty>No results found.</CommandEmpty> : isLoading && (
                    <div className="p-4 mx-auto w-fit">
                        <Loader />
                    </div>
                )}
                {users.length > 0 && (
                    <CommandGroup heading="Suggestions" forceMount>
                    {users.map((user) => {
                        const status = user.receivedRequests[0]?.status
                        return (
                            <CommandItem key={user.id + "-item-search"}>
                                <UserAvatar 
                                    src="https://github.com/shadcn.png"
                                    fallback={(user.firstName.charAt(0)+""+user.lastName.charAt(0)) || ""}
                                />
                                <span>{user.firstName} {user.lastName}</span>
                                <button 
                                    onClick={() => {
                                        if(status === "PENDING"){
                                            cancelRequest(user.id, user.receivedRequests[0].id)
                                        }else if(status === "ACCEPTED"){
                                            return null
                                        }else {
                                            sendRequest(user.id)
                                        }
                                    }} 
                                    className={buttonVariants({variant: "outline", size: "sm"})+" cursor-pointer ml-auto"}
                                    disabled={loadingIds.has(user.id) || status === "ACCEPTED"}
                                >
                                    {status === "PENDING" ? (
                                        loadingIds.has(user.id) ? (
                                            <Spinner />
                                        ) : (
                                            "Cancel request"
                                        )
                                    ): status === "ACCEPTED" ? (
                                        loadingIds.has(user.id) ? (
                                            <Spinner />
                                        ) : (
                                            "Friends"
                                        )
                                    ): (
                                        loadingIds.has(user.id) ? (
                                            <Spinner />
                                        ) : (
                                            "Add"
                                        )
                                    )}
                                    
                                </button>
                            </CommandItem>
                        )
                    })}
                    </CommandGroup>
                )}
            </CommandList>

        </CommandDialog>
    )
}
