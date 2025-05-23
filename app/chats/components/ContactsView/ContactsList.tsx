import HeaderList from '@/components/HeaderList'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Filter, PlusCircle, Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SearchUserModal } from './SearchUserModal'
import { useState } from 'react'

export default function ContactsList() {
    const [open, setOpen] = useState(false)
    

    return (
        <>
            <ScrollArea className='h-screen'>

                <div className=''>
                    <HeaderList>
                        <div className='flex justify-between'>
                            Contacts
                            
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={"icon"}
                                        variant={"ghost"}
                                        onClick={() => setOpen((open) => !open)}
                                    >
                                        <PlusCircle />
                                        <span className='sr-only'>Add Friend</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>
                                        Add Friend 
                                        Press{" "}
                                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                            <span className="text-xs">⌘</span>J
                                        </kbd>
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </HeaderList>

                    <div className='relative mx-4'>
                        <Input placeholder='Search' className='my-4 pl-8 pr-8' />
                        <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                        <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                    </div>

                    <div className='space-y-2 px-4'>
                        <Tabs defaultValue="online" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="online">Online</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                            </TabsList>
                            <TabsContent value="online">Online Friends</TabsContent>
                            <TabsContent value="all">All Friends</TabsContent>
                            <TabsContent value="pending">Pending Request friend</TabsContent>
                        </Tabs>

                    </div>
                </div>
            </ScrollArea>
            <SearchUserModal open={open} setOpen={setOpen} />
        </>
    )
}
