'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useIsTrulyMobile } from '@/hooks/useIsTrulyMobile'
import { useAuth } from '@/contexts/AuthContext'

export function MobileRedirect() {
    const isMobile = useIsTrulyMobile()
    const pathname = usePathname()
    const router = useRouter()
    const {user} = useAuth()

    useEffect(() => {
        if(!user) return
        if (!isMobile) return router.replace('/chats')
        if (isMobile) return router.replace('/mb/chats')
    }, [isMobile, pathname, router, user])

    return null
}
