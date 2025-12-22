import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    // 1. Check subscription limits
    // --- START: updated subscription logic with fallback ---
    const { data: subscriptionRow, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Chat subscription debug:', {
      userId: user.id,
      subscriptionRow,
      subError,
    })

    let subscription = subscriptionRow

    // If 0 rows (PGRST116) and no subscription, auto-create a trial
    if (!subscription && subError && subError.code === 'PGRST116') {
      const trialInsert = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'trial',
          tier: 'free',
          trial_messages_remaining: 20,
          total_messages_sent: 0,
          limit_reached: false,
        })
        .select('*')
        .single()

      if (trialInsert.error) {
        console.error('Failed to auto-create trial subscription:', trialInsert.error)
        return NextResponse.json(
          { error: 'Unable to create trial subscription' },
          { status: 500 }
        )
      }

      subscription = trialInsert.data
    } else if (subError && subError.code !== 'PGRST116') {
      // Other errors (RLS, etc.)
      console.error('Subscription query error:', subError)
      return NextResponse.json(
        { error: subError.message || 'Subscription query error' },
        { status: 400 }
      )
    }

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }
    // --- END: updated subscription logic with fallback ---



    // 2. Get active birth chart
    const { data: birthDetail } = await supabase
      .from('birth_details')
      .select(`*, vedic_charts (*)`)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!birthDetail) {
      return NextResponse.json({ error: 'No birth details found' }, { status: 400 })
    }

    // 3. Get last 20 messages for context
    const { data: history } = await supabase
      .from('conversations')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('birth_detail_id', birthDetail.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const conversationHistory = (history || []).reverse()

    // 4. Build chart context and system prompt
    const chartContext = `
Birth Details:
- Name: ${birthDetail.name}
- Date: ${birthDetail.birth_date}
- Time: ${birthDetail.birth_time}
- Location: ${birthDetail.birth_city}

Vedic Chart Data:
${JSON.stringify(birthDetail.vedic_charts, null, 2)}
`

    const systemPrompt = `You are Clarity, a warm and empathetic Vedic astrology guide. You provide personalized insights based on the user's birth chart using authentic Vedic astrology principles.

${chartContext}

Instructions:
- Respond in a friendly, conversational, and supportive tone
- Base your guidance on the user's actual birth chart data provided above
- Use current Vedic astrology knowledge from web search when relevant
- Be insightful but never make absolute predictions
- Encourage self-reflection and personal growth
- Keep responses concise (2-3 paragraphs max)`

    // Normalize history to user/assistant alternation
    const normalizedHistory: { role: 'user' | 'assistant'; content: string }[] = []
    for (const msg of conversationHistory) {
      if (msg.role === 'system') continue
      const role = msg.role === 'assistant' ? 'assistant' : 'user'
      const last = normalizedHistory[normalizedHistory.length - 1]
      // Skip if same role as previous to maintain alternation
      if (last && last.role === role) continue
      normalizedHistory.push({ role, content: msg.content })
    }

    // If the last history message is a user, we don't want two users in a row,
    // so we rely on the new user message as the latest one.
    if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === 'user') {
      normalizedHistory.pop()
    }

    // Build messages array for Perplexity
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...normalizedHistory,
      { role: 'user' as const, content: message }
    ]

    // 5. Save user message
    await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: user.id,
        birth_detail_id: birthDetail.id,
        role: 'user',
        content: message
      })

    // 5. Call Perplexity Sonar Reasoning (does search + reasoning in one call)
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',   // UPDATED model
        messages,
        max_tokens: 800,
        temperature: 0.7,
        search_mode: 'web',
        web_search_options: {
          search_context_size: 'low',
        },
      }),
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('Perplexity API error body:', errorText)
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`)
    }

    const perplexityData = await perplexityResponse.json()
    const assistantMessage = perplexityData.choices[0].message.content


    // 6. Save assistant message
    await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: user.id,
        birth_detail_id: birthDetail.id,
        role: 'assistant',
        content: assistantMessage,
        chart_context_used: true,
        perplexity_used: true,
        perplexity_sources: perplexityData.citations || null
      })

    // 7. Increment message counter
    const newCount = subscription.total_messages_sent + 1
    
    await supabaseAdmin
      .from('subscriptions')
      .update({ 
        total_messages_sent: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // 8. Check if limit reached (for trial users)
    let limitReached = false
    if (subscription.status === 'trial' && 
        newCount >= subscription.trial_messages_remaining) {
      
      limitReached = true
      
      await supabaseAdmin
        .from('subscriptions')
        .update({ 
          limit_reached: true,
          limit_reached_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      await supabaseAdmin
        .from('conversations')
        .insert({
          user_id: user.id,
          birth_detail_id: birthDetail.id,
          role: 'system',
          content: 'You\'ve reached your 20 free messages. Subscribe to Premium for unlimited access to continue your journey with Clarity.',
          is_limit_message: true
        })
    }

    return NextResponse.json({ 
      success: true,
      message: assistantMessage,
      limit_reached: limitReached,
      messages_remaining: subscription.status === 'trial' 
        ? subscription.trial_messages_remaining - newCount 
        : null
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      error: 'Chat failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
