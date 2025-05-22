import { ModeToggle } from '@/components/ModeToggle'
import { Button } from '@/components/ui/button'
import { useViewStore } from '@/hooks/useViewStore'
import { MessageCircleMore, Settings } from 'lucide-react'
import React from 'react'

export default function Sidebar() {
    const { setView} = useViewStore()
    
    return (
        <div className=' flex flex-col gap-2'>
            <Button onClick={() => setView("chat")}>
                <MessageCircleMore />
            </Button>
            <Button onClick={() => setView("settings")}>
                <Settings />
            </Button>
            <ModeToggle />
        </div>
    )
}
