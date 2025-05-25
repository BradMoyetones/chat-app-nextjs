/* eslint-disable react-hooks/exhaustive-deps */
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import api from "@/lib/axios"
import { toast } from "sonner"
import axios from "axios"
import { useEffect, useState } from "react"
import Spinner from "@/components/Spinner"
import { ContactRequestFull } from "@/types/database"
import { PlusCircle, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import ContactCard from "./ContactCard"

type FormData = {
    isGroup: boolean
    title?: string
    participantIds: number[]
}

export function StartConversation({ open, setOpen, participantId, setParticipantId, contacts }: { open: boolean, setOpen: (value: boolean) => void, participantId: number | null, setParticipantId: (value: number | null) => void, contacts: ContactRequestFull[] }) {
    const [openCont, setOpenCont] = useState(false)
    const [loading, setLoading] = useState(false)
    const {
        control,
        register,
        setValue,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            isGroup: false,
            title: "",
            participantIds: []
        },
    })

    const isGroup = watch("isGroup")

    const onSubmit = async(data: FormData) => {
        if (isGroup && !data.title?.trim()) return // extra seguridad
        setLoading(true)
        try {
            await api.post(`/api/conversations`, data)

            toast.success("Coversation created!")
            setOpen(false)
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) && error.response
                ? error.response.data.error
                : "Something went wrong while sending the accept request.";
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(open) return
        setParticipantId(null)
    }, [open])

    useEffect(() => {
        if(!participantId) {
            setValue("participantIds", [])
            return
        }
        setValue("participantIds", [participantId])
    }, [participantId])

    return (
        <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start a Conversation</DialogTitle>
                    <DialogDescription>
                        Choose a friend to start a chat with, or create a group by selecting multiple friends.
                        If you create a group, don&apos;t forget to give it a name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isGroup" className="text-right">
                            Group
                        </Label>
                        <Controller
                            control={control}
                            name="isGroup"
                            render={({ field: { value, onChange, ...field } }) => (
                                <Switch
                                    id="isGroup"
                                    checked={value}
                                    onCheckedChange={(checked) => {
                                        onChange(checked) // actualiza el valor de isGroup
                                        if (!checked) {
                                            // limpia el name si se desactiva el switch
                                            control._formValues.name = "" // evita que se quede con el valor anterior
                                            control.unregister("title") // lo quita del form
                                        }
                                    }}
                                    className="col-span-3"
                                    {...field}
                                />
                            )}
                        />
                    </div>

                    {isGroup && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    {...register("title", {
                                        required: "Group name is required",
                                        validate: value => (value?.trim() !== "" ? true : "Name cannot be empty")
                                    })}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {isGroup && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant={"ghost"} size={"icon"} type="button" onClick={() => setOpenCont(prev => !prev)}>
                                    <PlusCircle /><span className="sr-only">Add participant</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Add participant</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    <div className="space-y-2">
                        {contacts
                            .filter((contact) => watch("participantIds").includes(contact.friend.id))
                            .map((contact) => {
                                return (
                                    <ContactCard 
                                        key={contact.id+"-card-contact-selected"}
                                        fallback={(contact.friend.firstName.charAt(0)+""+contact.friend.lastName.charAt(0)) || ""}
                                        text={contact.friend.firstName+" "+contact.friend.lastName}
                                        actions={
                                            <Button
                                                variant={"destructive"}
                                                size={"sm"}
                                                className='cursor-pointer ml-auto'
                                                type="button"
                                                onClick={() => {
                                                    const current = watch("participantIds")
                                                    const updated = current.filter(id => id !== contact.friend.id)
                                                    setValue("participantIds", updated)
                                                }}
                                                disabled={contact.friend.id === participantId}
                                            >
                                                <Trash2 />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        }
                                    />
                                )
                            })}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Spinner />
                            ): ("Start Conversation")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        {/* USERS Contacts */}
        <Dialog open={openCont} onOpenChange={setOpenCont} modal>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Contacts</DialogTitle>
                    <DialogDescription>
                        Add participants to conversation
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {contacts.map((contact) => {
                        const selected = !watch("participantIds").find(p => p === contact.friend.id)
                        return (
                            <ContactCard 
                                key={contact.id+"-card-contact-select"}
                                fallback={(contact.friend.firstName.charAt(0)+""+contact.friend.lastName.charAt(0)) || ""}
                                text={contact.friend.firstName+" "+contact.friend.lastName}
                                actions={
                                    <Button
                                        variant={"outline"}
                                        size={"sm"}
                                        className='cursor-pointer ml-auto'
                                        type="button"
                                        onClick={() => {
                                            const current = watch("participantIds")
                                            if (!current.includes(contact.friend.id)) {
                                                setValue("participantIds", [...current, contact.friend.id])
                                            }
                                        }}
                                        disabled={!selected}
                                    >
                                        <PlusCircle />
                                        <span className="sr-only">Add participant</span>
                                    </Button>
                                }
                            />
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
        </>
    )
}
