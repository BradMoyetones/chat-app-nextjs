import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";

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
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}
