import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    // Ignorar assets estáticos y públicos (ajusta según tu app)
    if (
        path.startsWith('/_next') || 
        path.startsWith('/static') || 
        path === '/favicon.ico' || 
        path === '/favicon.svg' || 
        path.startsWith('/api/public') // ejemplo de rutas públicas
    ) {
        return NextResponse.next()
    }

    const token = req.cookies.get('accessToken')?.value
    const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
    const isRoot = path === '/'

    if (!token) {
        if (!isAuthPage && !isRoot) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        return NextResponse.next()
    }

    try {
        await jwtVerify(token, secret)
        // Token válido
        if (isAuthPage || isRoot) {
            return NextResponse.redirect(new URL('/chats', req.url))
        }
        return NextResponse.next()
    } catch (e) {
        console.log('JWT verification error:', e)
        // Token inválido o expirado
        if (!isAuthPage) {
            return NextResponse.redirect(new URL('/login', req.url))
        }
        return NextResponse.next()
    }
}
