'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useIsTrulyMobile } from '@/hooks/useIsTrulyMobile'

export function MobileRedirect() {
    const isMobile = useIsTrulyMobile()
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!isMobile) return

        const isAlreadyInMb = pathname.startsWith('/mb')

        if (!isAlreadyInMb) {
            router.replace('/mb/chats')
        }
    }, [isMobile, pathname, router])

    return null
}
