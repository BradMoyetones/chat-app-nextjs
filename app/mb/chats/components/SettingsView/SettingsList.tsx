import HeaderList from "@/components/HeaderList"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useViewStore } from "@/hooks/useViewStore"
import { Bell, ImageIcon, KeyRound, LockKeyhole, LogOut, Sun, User2 } from "lucide-react"

export default function SettingsList() {
    const {logOut} = useAuth()
    const {setView} = useViewStore()

    return (
        <div className=''>
            <HeaderList>
                Settings
            </HeaderList>

            <div className='space-y-2 px-4 pt-10'>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                    onClick={() => {
                        setView("profile")
                    }}
                >
                    <User2 className='' />
                    <span>Profile</span>
                </Button>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                >
                    <Bell className='' />
                    <span>Notifications</span>
                </Button>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                >
                    <LockKeyhole className='' />
                    <span>Privacy</span>
                </Button>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                >
                    <KeyRound className='' />
                    <span>Security</span>
                </Button>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                    onClick={() => {
                        setView("theme")
                    }}
                >
                    <Sun />
                    {/* <Moon /> */}
                    <span>Theme</span>
                </Button>
                <Button
                    variant={"outline"}
                    className="w-full justify-start border-x-0 rounded-none"
                >
                    <ImageIcon />
                    {/* <Moon /> */}
                    <span>Chat Wallpaper</span>
                </Button>
                
                <Button
                    variant={"destructive"}
                    className="w-full"
                    onClick={logOut}
                >
                    <LogOut className='' />
                    <span>LogOut</span>
                </Button>
            </div>
        </div>
    )
}
