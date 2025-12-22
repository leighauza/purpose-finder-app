import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find cancelled subscriptions past their end date
    const { data: expiredSubs, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('status', 'cancelled')
      .lte('subscription_end', new Date().toISOString())

    if (fetchError) throw fetchError

    // Reset each to trial
    for (const sub of expiredSubs || []) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'trial',
          payment_method: null,
          tier: 'free',
          subscription_start: null,
          subscription_end: null,
          trial_messages_remaining: 20,
          total_messages_sent: 0,
          limit_reached: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id)

      await supabaseAdmin
        .from('user_notifications')
        .insert({
          user_id: sub.user_id,
          type: 'subscription_expired',
          title: 'Premium Expired',
          message: 'Your Premium subscription has ended. You now have 20 free messages.',
          is_read: false
        })
    }

    return NextResponse.json({ 
      success: true,
      expired_count: expiredSubs?.length || 0 
    })

  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}