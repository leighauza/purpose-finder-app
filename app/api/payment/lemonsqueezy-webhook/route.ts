import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac('sha256', secret)
    const digest = hmac.update(body).digest('hex')

    if (signature !== digest) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Handle subscription_created
    if (event.meta.event_name === 'subscription_created') {
      const subscription = event.data.attributes
      const customData = subscription.custom_data

      const subscriptionEnd = new Date()
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)

      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          payment_method: 'lemonsqueezy',
          tier: 'premium',
          subscription_start: new Date().toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          trial_messages_remaining: null,
          limit_reached: false,
          lemonsqueezy_subscription_id: event.data.id,
          amount_paid: subscription.variant_id === 'PHP' ? 299 : 7.99
        })
        .eq('user_id', customData.user_id)

      await supabaseAdmin
        .from('user_notifications')
        .insert({
          user_id: customData.user_id,
          type: 'payment_approved',
          title: 'Premium Activated',
          message: 'Your subscription is now active!',
          is_read: false
        })
    }

    // Handle subscription_updated (renewal)
    if (event.meta.event_name === 'subscription_updated') {
      const subscriptionEnd = new Date()
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)

      await supabaseAdmin
        .from('subscriptions')
        .update({
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('lemonsqueezy_subscription_id', event.data.id)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}