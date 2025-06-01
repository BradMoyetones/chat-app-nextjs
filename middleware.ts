import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  if (
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path === '/favicon.ico' ||
    path === '/favicon.svg' ||
    path.startsWith('/api/public') ||
    path.startsWith('/background_1.png') ||
    path.startsWith('/themes') ||
    path.startsWith('/placeholder')
  ) {
    return NextResponse.next()
  }

  const accessToken = req.cookies.get('accessToken')?.value

  const ua = req.headers.get('user-agent') || ''
  const isMobile = /iPhone|Android|Mobile|iPad|iPod|Windows Phone/i.test(ua)

  try {
    if (accessToken) {
      await jwtVerify(accessToken, accessSecret)

      if (!isMobile && path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/chats', req.url))
      }

      if (isMobile && !path.startsWith('/mb')) {
        return NextResponse.redirect(new URL('/mb/chats', req.url))
      }
    }
  } catch (err) {
    console.log('JWT verification error:', err)
  }

  return NextResponse.next()
}
