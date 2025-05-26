import { ContactProvider } from "@/contexts/ContactContext";
import { ConversationProvider } from "@/contexts/ConversationContext";
import type { Metadata } from "next";

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
          {children}
        </ConversationProvider>
      </ContactProvider>
    </div>
  );
}
