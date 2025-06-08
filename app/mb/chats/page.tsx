'use client'


import { useViewStore } from "@/hooks/useViewStore"
import BottonNavigation from "../components/BottonNavigation"
import ChatView from "./components/ChatView/ChatView"
import { lazy, Suspense, useEffect } from "react"
import socket from "@/lib/socket"
import ChatList from "./components/ChatView/ChatList"
import Loader from "@/components/Loader"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

const SettingsList = lazy(() => import('./components/SettingsView/SettingsList'))
const ProfileList = lazy(() => import('./components/ProfileView/ProfileList'))
const ContactsList = lazy(() => import('./components/ContactsView/ContactsList'))
const CallsList = lazy(() => import('./components/CallsView/CallsList'))
const ThemeView = lazy(() => import('./components/ThemeView/ThemeView'))

export default function MobileLayout() {
    const { type, chatId } = useViewStore()
    const {user} = useAuth()
    const router = useRouter()
    
    if(!user){
        router.replace("/login")
    }

    useEffect(() => {
        if (!socket.connected) {
            socket.connect()
        }

        return () => {
            socket.disconnect()
        }
    }, [])

    return (
        <div>
            <div className="overflow-y-auto h-screen">
                {type === 'chat' && (chatId ? <ChatView /> : <ChatList />)}
                <Suspense fallback={<div className='h-full flex items-center justify-center'><Loader /></div>}>
                    {type === "contacts" && <ContactsList />}
                    {type === "calls" && <CallsList />}

                    {/* Settings */}
                    {type === "settings" && <SettingsList />}
                    {type === "profile" && <ProfileList />}
                    {type === "theme" && <ThemeView />}
                    
                </Suspense>
            </div>

            <BottonNavigation />
        </div>
    )
}
