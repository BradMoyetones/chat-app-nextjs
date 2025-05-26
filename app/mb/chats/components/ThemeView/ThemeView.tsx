import HeaderList from "@/components/HeaderList"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useViewStore } from "@/hooks/useViewStore"
import { ChevronLeft, Monitor, Moon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

type Theme = 'dark' | 'light' | 'system'
/* eslint-disable @next/next/no-img-element */
export default function ThemeView() {
    const {setView} = useViewStore()
    const {setTheme, themes, theme} = useTheme()

    const icon = {
        "dark": Moon,
        "light": SunIcon,
        "system": Monitor
    }
    
    return (
        <div>
            <HeaderList className="px-2">
                <div
                    className="flex items-center"
                >
                    <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => {
                            setView("settings")
                        }}
                    >
                        <ChevronLeft className="size-6" />
                        <span className="sr-only">Back</span>
                    </Button>
                    Theme
                </div>
            </HeaderList>
            <div className="px-4 pt-10">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                    <div className="flex space-x-4 p-4">
                        {themes.map((t) => {
                            const Icon = icon[t as Theme]
                            return (
                                <button 
                                    key={t} 
                                    className={`border rounded-2xl overflow-hidden ${theme === t && "outline-2 outline-accent-foreground"}`}
                                    onClick={() => setTheme(t)}
                                >
                                    <div className="overflow-hidden w-full h-24 aspect-video">
                                        <img src={`/themes/${t}.png`} alt="" className="object-cover object-center h-full w-full" />
                                    </div>
                                    <h3 className="p-2 font-medium flex items-center gap-1 capitalize">
                                        <Icon size={16} /> {t}
                                    </h3>
                                </button>
                            )
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    )
}
