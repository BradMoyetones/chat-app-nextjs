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
  const {type, chatId, setChat} = useViewStore()
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
      <aside className="sidebar">
        <Sidebar />
      </aside>

      <section className="chat-list">
        {type === "chat" && (
          <ChatList
            onSelectChat={(chatId: number) => setChat(chatId)}
          />
        )}

        {type === "settings" && <SettingsView />}
        {type === "profile" && <ProfileView />}
        
      </section>

      <section className="chat-window">
        <ChatView chatId={chatId} />
      </section>
    </div>
  )
}
