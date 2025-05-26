import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chats Mobile - Brad",
  description: "See your all chats",
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
