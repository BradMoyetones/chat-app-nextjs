'use client'

import Sidebar from '../components/Sidebar'
import { useViewStore } from '@/hooks/useViewStore'
import ChatView from './components/ChatView/ChatView'
import ChatList from './components/ChatView/ChatList'
import { lazy, Suspense, useEffect } from 'react'
import socket from '@/lib/socket'
import Loader from '@/components/Loader'

const SettingsList = lazy(() => import('./components/SettingsView/SettingsList'))
const ProfileList = lazy(() => import('./components/ProfileView/ProfileList'))
const ContactsList = lazy(() => import('./components/ContactsView/ContactsList'))
const CallsList = lazy(() => import('./components/CallsView/CallsList'))

export default function Home() {
  const {type} = useViewStore()
  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="layout">
      <aside className="sidebar bg-muted">
        <Sidebar />
      </aside>

      <section className="chat-list bg-background border-r border-border">
        {type === "chat" && (
          <ChatList />
        )}

        <Suspense fallback={<div className='h-full flex items-center justify-center'><Loader /></div>}>
          {type === "settings" && <SettingsList />}
          {type === "profile" && <ProfileList />}
          {type === "contacts" && <ContactsList />}
          {type === "calls" && <CallsList />}
        </Suspense>
        
      </section>

      <section className="chat-window bg-background">
        <ChatView />
      </section>
    </div>
  )
}
