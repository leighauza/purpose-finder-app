import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.status !== 'cancelled') {
      return NextResponse.json({ error: 'Subscription not cancelled' }, { status: 400 })
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    return NextResponse.json({ 
      success: true,
      message: 'Premium reactivated'
    })

  } catch (error) {
    console.error('Reactivate error:', error)
    return NextResponse.json({ error: 'Failed to reactivate' }, { status: 500 })
  }
}