import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: birthDetail, error: birthError } = await supabase
      .from('birth_details')
      .select(`
        *,
        vedic_charts (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (birthError) {
      return NextResponse.json({ error: 'No birth details found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      birth_detail: birthDetail 
    })

  } catch (error) {
    console.error('Get active birth error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}