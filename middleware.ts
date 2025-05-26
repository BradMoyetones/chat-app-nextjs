import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const accessSecret = new TextEncoder().encode(process.env.JWT_SECRET!)
const verifyEmailSecret = new TextEncoder().encode(process.env.JWT_VERIFY_EMAIL_SECRET!)

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  // Ignorar assets estáticos y rutas públicas
  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path === '/favicon.ico' ||
    path === '/favicon.svg' ||
    path.startsWith('/api/public') ||
    path.startsWith('/background_1.png')
  ) {
    return NextResponse.next()
  }

  const accessToken = req.cookies.get('accessToken')?.value
  const verifyEmailToken = req.cookies.get('verify_email_token')?.value

  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')
  const isVerifyEmailPage = path.startsWith('/verify-email')
  const isRoot = path === '/'

  const ua = req.headers.get('user-agent') || ''
  const isMobile = /iPhone|Android|Mobile|iPad|iPod|Windows Phone/i.test(ua)

  try {
    if (accessToken) {
      await jwtVerify(accessToken, accessSecret)

      if (isAuthPage || isRoot || isVerifyEmailPage) {
        return NextResponse.redirect(new URL(isMobile ? '/mb/chats' : '/chats', req.url))
      }

      if (!isMobile && path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/chats', req.url))
      }

      if (isMobile && !path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/mb/chats', req.url))
      }

      return NextResponse.next()
    }

    // Solo permitir acceso a /verify-email si tiene verify_email_token válido
    if (isVerifyEmailPage) {
      if (!verifyEmailToken) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      await jwtVerify(verifyEmailToken, verifyEmailSecret)
      return NextResponse.next()
    }

    // No tiene ningún token válido y accede a una ruta privada
    if (!isAuthPage && !isRoot) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.log('JWT verification error:', err)

    // Si falla verificación en /verify-email, igual lo mandamos a login
    if (isVerifyEmailPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.redirect(new URL('/login', req.url))
  }
}
