import { useStickyObserver } from '@/hooks/useStickyObserver'
import { cn } from '@/lib/utils'
import React, { useRef } from 'react'

type HeaderListProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
}

export default function HeaderList({ children, className, ...props }: HeaderListProps) {
    const titleRef = useRef<HTMLHeadingElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const isSticky = useStickyObserver(sentinelRef as React.RefObject<HTMLElement>)

    return (
        <>
            <div ref={sentinelRef} className="h-0" />
            <h1
                ref={titleRef}
                className={cn(
                    "font-bold text-2xl mt-4 sticky top-0 z-10 transition-all px-4",
                    isSticky && "bg-muted/50 backdrop-blur-2xl p-4 shadow",
                    className
                )}
                {...props}
            >
                {children}
            </h1>
        </>
    )
}
