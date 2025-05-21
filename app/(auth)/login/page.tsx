"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import api from "@/lib/axios"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const router = useRouter()
    const { setUser } = useAuth()

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()
        setIsLoading(true)

        try{
            const response = await api.post("/api/auth/login", {
              email,
              password,
            })
    
            setUser(response.data.user)
            router.push("/")
            
        }catch(e){
            console.log(e);
            
        }finally{
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Chat App</CardTitle>
                    <CardDescription className="text-center">Enter your email and password to sign in</CardDescription>
                </CardHeader>
                <form onSubmit={onSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
