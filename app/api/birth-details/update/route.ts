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

    const birthData = await request.json()

    // Insert new birth details (trigger deactivates old ones)
    const { data: newBirth, error: birthError } = await supabaseAdmin
      .from('birth_details')
      .insert({
        user_id: user.id,
        name: birthData.name,
        birth_date: birthData.birth_date,
        birth_time: birthData.birth_time,
        birth_city: birthData.birth_city,
        birth_country: birthData.birth_country || 'Unknown',
        latitude: birthData.latitude,
        longitude: birthData.longitude,
        timezone: birthData.timezone,
        is_active: true
      })
      .select()
      .single()

    if (birthError) throw birthError

    return NextResponse.json({ 
      success: true, 
      birth_detail: newBirth,
      message: 'Birth details updated. Previous chart preserved.'
    })

  } catch (error) {
    console.error('Update birth details error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}