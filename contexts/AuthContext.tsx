'use client'
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react"
import api from "@/lib/axios"
import { usePathname, useRouter } from "next/navigation";

type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
}
interface AuthContextProps {
    user: User | null
    setUser: Dispatch<SetStateAction<User | null>>
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
const pathname = usePathname()

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
        }
    }

    fetchUser()
}, [pathname, router])

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    return context
}

