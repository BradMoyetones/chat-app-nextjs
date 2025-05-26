'use client'
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react"
import api from "@/lib/axios"
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { User } from "@/types/database";
import socket from "@/lib/socket";

interface AuthContextProps {
    user: User | null
    setUser: Dispatch<SetStateAction<User | null>>
    logOut: () => void
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const logOut = async() => {
        try {
            await api.post("/api/auth/logout")
            router.replace("/login")
        } catch (e){
            console.log(e);   
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/api/auth/me")
                setUser(res.data.user)

                // 👇 Si el usuario está en login y ya tiene token válido, redirigimos
                if (pathname === "/login" || pathname === "/" || pathname === "/register") {
                    router.replace("/chats") // Esto forza navegación real => se ejecuta middleware
                }

            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [pathname, router])

    useEffect(() => {
        if (user) {
            socket.emit("usuario:conectado", user.id)

            return () => {
                socket.emit("usuario:desconectado", user.id)
            }
        }
    }, [user])

    if(loading){
        return (
            <div className="h-screen flex justify-center items-center bg-background">
                <Loader />
            </div>
        )
    }


    return (
        <AuthContext.Provider value={{ user, setUser, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}

