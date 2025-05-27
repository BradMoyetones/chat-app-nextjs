import { CallProvider } from "@/contexts/CallContext";
import { ContactProvider } from "@/contexts/ContactContext";
import { ConversationProvider } from "@/contexts/ConversationContext";
import type { Metadata } from "next";
import CallWindow from "./components/CallsView/CallWindow";

export const metadata: Metadata = {
  title: "Chats - Brad",
  description: "See your all chats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <ContactProvider>
        <ConversationProvider>
          <CallProvider>
            {children}
            <CallWindow />
          </CallProvider>
        </ConversationProvider>
      </ContactProvider>
    </div>
  );
}
