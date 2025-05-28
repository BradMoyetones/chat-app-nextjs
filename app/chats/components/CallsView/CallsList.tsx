import HeaderList from "@/components/HeaderList";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContacts } from "@/contexts/ContactContext";
import { Filter, PhoneCall, Search } from "lucide-react";
import ContactCard from "../ContactsView/ContactCard";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useCall } from "@/contexts/CallContext";

export default function CallsList() {
  const { contacts, onlineFriends } = useContacts();
  const {startCall} = useCall()

  return (
    <>
      <ScrollArea className="h-screen">
        <div>
          <HeaderList>Calls</HeaderList>

          <div className="relative mx-4">
            <Input placeholder="Search" className="my-4 pl-8 pr-8" type="text" />
            <Search size={20} className="absolute left-2 top-2 text-muted-foreground" />
            <Filter size={20} className="absolute right-2 top-2 text-muted-foreground cursor-pointer" />
          </div>

          <div className="space-y-2 px-4">
            {contacts.map((contact) => {
              const isOnline = onlineFriends.includes(contact.friend?.id)

              return (
                <ContactCard 
                  key={contact.id+"-card-contact-all"}
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${contact.friend?.image}`}
                  fallback={(contact.friend?.firstName.charAt(0)+""+contact.friend?.lastName.charAt(0)) || ""}
                  isOnline={isOnline}
                  text={
                    <div>
                      <p className='line-clamp-1'>{contact.friend?.firstName} {contact.friend?.lastName}</p>
                      <p className='text-xs text-muted-foreground'>{isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  }
                  actions={
                    <>
                    {isOnline && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    size={"sm"}
                                    className='cursor-pointer ml-auto'
                                    onClick={() => {
                                      startCall(contact.friend?.id)
                                    }}
                                >
                                    <PhoneCall />
                                    <span className='sr-only'>Start Call</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Start Call</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    </>
                  }
                />
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
