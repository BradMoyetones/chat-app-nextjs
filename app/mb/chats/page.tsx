'use client'


import { useViewStore } from "@/hooks/useViewStore"
import BottonNavigation from "../components/BottonNavigation"
import ChatView from "./components/ChatView/ChatView"
import { lazy, Suspense, useEffect } from "react"
import socket from "@/lib/socket"
import ChatList from "./components/ChatView/ChatList"
import Loader from "@/components/Loader"

const SettingsList = lazy(() => import('./components/SettingsView/SettingsList'))
const ProfileList = lazy(() => import('./components/ProfileView/ProfileList'))
const ContactsList = lazy(() => import('./components/ContactsView/ContactsList'))
const CallsList = lazy(() => import('./components/CallsView/CallsList'))

export default function MobileLayout() {
    const { type, chatId } = useViewStore()

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
                    {type === "settings" && <SettingsList />}
                    {type === "profile" && <ProfileList />}
                    {type === "contacts" && <ContactsList />}
                    {type === "calls" && <CallsList />}
                </Suspense>
            </div>

            <BottonNavigation />
        </div>
    )
}
