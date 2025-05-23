import HeaderList from "@/components/HeaderList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileList() {
    const {user} = useAuth()

    return (
        <ScrollArea className='h-screen'>
            <div className=''>
                <HeaderList>
                    Profile
                </HeaderList>

                <div className='space-y-2 px-4 flex flex-col items-center'>
                    <UserAvatar 
                        src="https://github.com/shadcn.png"
                        fallback={(user?.firstName?.charAt(0)+""+user?.lastName?.charAt(0)) || ""}
                        className="h-24 w-24 cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-4 w-full mt-10">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input />
                        </div>
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Descripción</Label>
                            <Textarea />
                        </div>
                        <Button
                            className="col-span-2"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}
