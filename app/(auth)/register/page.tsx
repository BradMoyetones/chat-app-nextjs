"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import api from "@/lib/axios"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

const FormSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
})

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const router = useRouter()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)

        try{
            const response = await api.post("/api/auth/register", data)
    
            toast.success(response.data.message)

            router.push("/verify-email")
            
        }catch(e){
            console.log(e);
            
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Chat App</CardTitle>
                    <CardDescription className="text-center">Register with your email and password</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Firt Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Firt Name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display firstname.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Last Name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display lastname.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your public display email.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Password" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            This is your password.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 mt-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Sing Up
                            </Button>
                            <div className="text-center text-sm">
                                You have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    )
}
