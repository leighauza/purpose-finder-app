import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      subscription 
    })

  } catch (error) {
    console.error('Check subscription error:', error)
    return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 })
  }
}