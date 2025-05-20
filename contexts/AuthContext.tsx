'use client'
// hooks/useAuth.ts
import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react"
import api from "@/lib/axios"

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

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/api/me") // ruta protegida que devuelve el usuario
                setUser(res.data)
            } catch {
                setUser(null)
            }
        }

        fetchUser()
    }, [])

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

