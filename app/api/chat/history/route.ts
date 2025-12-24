import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active birth detail
    const { data: birthDetail } = await supabase
      .from('birth_details')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!birthDetail) {
      return NextResponse.json({ messages: [] })
    }

    // Get last 50 messages
    const { data: messages, error } = await supabase
      .from('conversations')
      .select('id, role, content, created_at')
      .eq('user_id', user.id)
      .eq('birth_detail_id', birthDetail.id)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error('Load history error:', error)
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 })
  }
}