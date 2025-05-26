import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chat Auth - Brad",
    description: "Login and register in my app",
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
