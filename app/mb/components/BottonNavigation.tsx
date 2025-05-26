'use client'
import { links } from '@/data/sidebar'
import { useViewStore } from '@/hooks/useViewStore'
import React from 'react'

export default function BottonNavigation() {
    const {type, setView} = useViewStore()
    return (
        <div className='grid grid-cols-4 justify-between bg-muted/30 backdrop-blur-xl z-50 fixed bottom-0 left-0 right-0 overflow-hidden'>
            {links.map((link, index) => (
                <button 
                    key={index+"-button-navigation"}
                    onClick={() => setView(link.href)}
                    className={`cursor-pointer p-2 ${type === link.href ? "text-primary-foreground bg-primary" : "text-primary"}`} 
                >
                    <link.icon className='mx-auto size-5' />
                    <span className='text-xs'>{link.name}</span>
                </button>
            ))}
        </div>
    )
}
