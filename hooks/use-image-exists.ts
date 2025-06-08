'use client'
import { useEffect, useState } from "react"

export function useImageExists(src?: string | null) {
    const [validSrc, setValidSrc] = useState("/placeholder.svg")

    useEffect(() => {
        if (!src) {
            setValidSrc("/placeholder.svg")
            return
        }

        const img = new Image()
        img.onload = () => setValidSrc(src)
        img.onerror = () => setValidSrc("/placeholder.svg")
        img.src = src
    }, [src])

    return validSrc
}
