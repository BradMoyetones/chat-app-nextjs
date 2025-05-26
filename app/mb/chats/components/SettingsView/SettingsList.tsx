import HeaderList from "@/components/HeaderList"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"

export default function SettingsList() {
    const {logOut} = useAuth()
    return (
        <ScrollArea className='h-screen'>
            <div className=''>
                <HeaderList>
                    Settings
                </HeaderList>

                <div className='space-y-2 px-4 pt-10'>
                    <Button
                        variant={"outline"}
                        className="w-full"
                        onClick={logOut}
                    >
                        <LogOut className='' />
                        <span>LogOut</span>
                    </Button>
                </div>
            </div>
        </ScrollArea>
    )
}
