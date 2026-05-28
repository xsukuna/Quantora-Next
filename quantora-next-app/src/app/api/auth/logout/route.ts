import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 })

  // Delete the local session cookie
  response.cookies.set('quantora_local_email', '', {
    path: '/',
    maxAge: 0
  })

  return response
}
