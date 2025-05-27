import HeaderList from "@/components/HeaderList";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useViewStore } from "@/hooks/useViewStore";
import api from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        password: z.string().min(6, 'Current password is required').optional(),
        newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
        repeatPassword: z.string().min(6, 'Repeat password must be at least 6 characters').optional(),
        image: z
            .instanceof(File)
            .optional()
            .nullable()
            .refine((file) => {
                if (!file) return true
                return file.size <= 5 * 1024 * 1024 // 5MB
            }, {
                message: "Image must be less than 5MB",
                path: ["image"]
            }),
    })
    .refine(data => {
        if (data.newPassword || data.repeatPassword) {
            return data.newPassword === data.repeatPassword
        }
        return true
    }, {
        message: "Passwords don't match",
        path: ['repeatPassword'],
    })
    .refine(data => {
        if (data.newPassword || data.repeatPassword) {
            return !!data.password
        }
        return true
    }, {
        message: "Current password is required to change password",
        path: ['password'],
})

export default function ProfileList() {
    const {user, setUser} = useAuth()
    const {setView} = useViewStore()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [preview, setPreview] = useState<string | null>(null)
    
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: "",
            lastName: ""
        },
    })

    useEffect(() => {
        if(!user) return
        form.reset({
            firstName: user.firstName,
            lastName: user.lastName
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        // console.log(data);
        // return
        
        setIsLoading(true)
        try {
            const response = await api.post("/api/profile/update", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })

            setUser(response.data.user)
            toast.success(response.data.message)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const data = error.response.data
                const rawError = data.error

                // 🔹 Si es un array (Zod validation)
                if (Array.isArray(rawError)) {
                    rawError.forEach((zodErr) => {
                        if (zodErr.path && zodErr.message) {
                            form.setError(zodErr.path[0], {
                                type: 'server',
                                message: zodErr.message
                            })
                        }
                    })
                    return
                }

                // 🔹 Si es un mensaje plano
                if (typeof rawError === "string") {
                    toast.error(rawError)
                    return
                }

                // 🔹 Si es un objeto con message
                if (typeof rawError === "object" && rawError?.message) {
                    toast.error(rawError.message)
                    return
                }
            }

            toast.error("Something went wrong while sending the request.")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className=''>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <HeaderList className="px-2">
                        <div
                            className="flex items-center"
                        >
                            <Button
                                variant={"ghost"}
                                size={"icon"}
                                onClick={() => {
                                    setView("settings")
                                }}
                            >
                                <ChevronLeft className="size-6" />
                                <span className="sr-only">Back</span>
                            </Button>
                            Profile
                        </div>
                    </HeaderList>

                    <div className='space-y-2 px-4 flex flex-col items-center pb-32'>
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <UserAvatar 
                                            src={preview || `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${user?.image}`}
                                            fallback={(user?.firstName?.charAt(0)+""+user?.lastName?.charAt(0)) || ""}
                                            className="h-24 w-24 cursor-pointer"
                                        />
                                    </FormLabel>
                                    <FormControl>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                field.onChange(file)

                                                if (file) {
                                                    const url = URL.createObjectURL(file)
                                                    setPreview(url)
                                                } else {
                                                    setPreview(null)
                                                }
                                            }}
                                            hidden
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4 w-full mt-10">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem className="">
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2 col-span-2">
                                <Label>Descripción</Label>
                                <Textarea />
                            </div>
                            <div className="border rounded-xl col-span-2 p-2 space-y-2">
                                <h1 className="font-bold text-xl">Change Password</h1>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Current Password" {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New Password" {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="repeatPassword"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Repeat Password</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Repeat Password" {...field} type="password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                className="col-span-2"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading && <Icons.spinner />}
                                Save
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
