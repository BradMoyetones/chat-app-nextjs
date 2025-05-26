import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  // Ignorar assets estáticos y rutas especiales
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path === '/favicon.ico' ||
    path === '/favicon.svg' ||
    path.startsWith('/api/public') ||
    path.startsWith('/background_1.png') ||
    path.startsWith('/background_1.png')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('accessToken')?.value
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
  const isRoot = path === '/'

  // Detectar si es un dispositivo móvil usando el user-agent
  const ua = req.headers.get('user-agent') || ''
  const isMobile = /iPhone|Android|Mobile|iPad|iPod|Windows Phone/i.test(ua)

  // Forzar layout según tipo de dispositivo
  if (token) {
    try {
      await jwtVerify(token, secret)

      if (isAuthPage || isRoot) {
        return NextResponse.redirect(new URL(isMobile ? '/mb/chats' : '/chats', req.url))
      }

      if (!isMobile && path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/chats', req.url))
      }

      if (isMobile && !path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/mb/chats', req.url))
      }

      return NextResponse.next()
    } catch (err) {
      console.log('JWT verification error:', err)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  } else {
    // Sin token
    if (!isAuthPage && !isRoot) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next|static|favicon|api/public).*)'],
}
