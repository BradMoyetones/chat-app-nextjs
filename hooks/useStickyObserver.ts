import { useEffect, useState, RefObject } from "react"

export function useStickyObserver<T extends HTMLElement>(sentinelRef: RefObject<T>) {
    const [isSticky, setIsSticky] = useState(false)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting)
            },
            { threshold: [1] }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [sentinelRef])

    return isSticky
}
