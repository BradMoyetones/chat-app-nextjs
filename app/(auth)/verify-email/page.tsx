'use client'

import React, { useState } from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from 'sonner'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import axios from 'axios'

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your one-time password must be 6 characters.",
    }),
})

export default function VerifyEmailPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()
    
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
            defaultValues: {
            pin: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setIsLoading(true)

        try{
            const response = await api.post("/api/auth/verify-email", data)
    
            toast.success(response.data.message)
            router.push("/chats")
            
        }catch(error){
            let errorMessage = "Something went wrong while sending the request."

            if (axios.isAxiosError(error) && error.response) {
                const rawError = error.response.data.error

                if (typeof rawError === "string") {
                    errorMessage = rawError
                } else if (Array.isArray(rawError)) {
                    // Tomamos el primer mensaje zod
                    errorMessage = rawError[0]?.message || errorMessage
                } else if (typeof rawError === "object" && rawError?.message) {
                    errorMessage = rawError.message
                }
            }

            toast.error(errorMessage)
        }finally{
            setIsLoading(false)
        }
    }
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Chat App</CardTitle>
                    <CardDescription className="text-center">Check your email, we send you email with a verification code.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                            <FormField
                                control={form.control}
                                name="pin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='mx-auto'>One-Time Password</FormLabel>
                                        <FormControl>
                                            <InputOTP className='mx-auto' maxLength={6} {...field}>
                                                <InputOTPGroup className='ml-auto'>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                </InputOTPGroup>
                                                <InputOTPSeparator />
                                                <InputOTPGroup className='mr-auto'>
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormDescription>
                                            Please enter the one-time password sent to your phone.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Verify code
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
