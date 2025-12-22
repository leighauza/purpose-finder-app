import { createAuthClient } from '@/lib/supabase/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Signup attempt:', email)

    const supabase = createAuthClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('🔥 FULL SUPABASE ERROR:', error)
      return NextResponse.json(
        { error, debug: JSON.stringify(error, null, 2) },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    })

  } catch (err) {
    console.error('❌ Signup route error:', err)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
