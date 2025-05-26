import { useEffect, useState } from "react"

    export function useIsTrulyMobile() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const byScreen = window.matchMedia("(pointer: coarse)").matches
        const byUserAgent = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        setIsMobile(byScreen || byUserAgent)
    }, [])

    return isMobile
}
