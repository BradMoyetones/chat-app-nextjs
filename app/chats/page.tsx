'use client'

import Sidebar from '../components/Sidebar'
import { useViewStore } from '@/hooks/useViewStore'
import ChatView from './components/ChatView/ChatView'
import SettingsView from './components/SettingsView'
import ProfileView from './components/ProfileView'
import ChatList from './components/ChatView/ChatList'
import { useEffect } from 'react'
import socket from '@/lib/socket'

export default function Home() {
  const {type, chatId} = useViewStore()
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
      <aside className="sidebar bg-zinc-200 dark:bg-zinc-900">
        <Sidebar />
      </aside>

      <section className="chat-list bg-background border-r border-border">
        {type === "chat" && (
          <ChatList />
        )}

        {type === "settings" && <SettingsView />}
        {type === "profile" && <ProfileView />}
        
      </section>

      <section className="chat-window bg-zinc-200 dark:bg-zinc-900">
        <ChatView chatId={chatId} />
      </section>
    </div>
  )
}
