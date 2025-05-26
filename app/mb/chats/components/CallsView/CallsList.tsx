import HeaderList from "@/components/HeaderList";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, Search } from "lucide-react";

export default function CallsList() {

    return (
        <ScrollArea className='h-screen'>

            <div className=''>
                <HeaderList>
                    Calls
                </HeaderList>

                <div className='relative mx-4'>
                    <Input placeholder='Search' className='my-4 pl-8 pr-8' type="text" />
                    <Search size={20} className='absolute left-2 top-2 text-muted-foreground' />
                    <Filter size={20} className='absolute right-2 top-2 text-muted-foreground cursor-pointer' />
                </div>

                <div className='space-y-2 px-4'>
                    
                </div>
            </div>
        </ScrollArea>
    )
}
