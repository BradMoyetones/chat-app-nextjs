import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Bell, ArrowRight, Video } from "lucide-react"
import { ModeToggle } from "@/components/ModeToggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 bg-background/30 z-50 backdrop-blur-2xl">
        <div className="container flex items-center justify-between p-4 mx-auto">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xl font-bold">ChatApp</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container flex-1 mx-auto px-4">
        <section className="py-20 md:py-32">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Communicate Without Limits
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Messages, calls and real-time notifications. Everything in one app.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row mx-auto md:mx-0">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[400px] w-[300px] rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 shadow-lg">
                <div className="h-full w-full rounded-lg bg-background p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">ChatApp</h3>
                    <div className="flex gap-2">
                      <Bell className="h-4 w-4" />
                      <Video className="h-4 w-4" />
                      <Phone className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">User {i}</p>
                          <div className="w-40 rounded-md bg-muted p-2">
                            <p className="text-xs">Hello, how are you?</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <p className="mx-auto mt-2 max-w-[600px] text-muted-foreground">
              Everything you need to stay connected with friends and family.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <MessageCircle className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold">Messages</h3>
              <p className="text-muted-foreground">Send text messages, images and files in real time.</p>
            </div>
            <div className="rounded-lg border p-6">
              <Phone className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold">Calls</h3>
              <p className="text-muted-foreground">Make voice and video calls with excellent quality.</p>
            </div>
            <div className="rounded-lg border p-6">
              <Bell className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold">Notifications</h3>
              <p className="text-muted-foreground">Stay up to date with instant notifications.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 mx-auto">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Brad. All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
