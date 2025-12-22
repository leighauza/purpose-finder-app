import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    console.log('🎂 Birth details request started')

    // 1️⃣ Verify authenticated user (cookie-based)
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2️⃣ Parse request body
    const {
      name,
      birth_date,
      birth_time,
      birth_city,
      birth_country = 'Unknown',
      latitude,
      longitude,
      timezone,
    } = await request.json()

    // 3️⃣ Insert birth details (ADMIN — onboarding only)
    const { data: birthDetail, error: birthError } = await supabaseAdmin
      .from('birth_details')
      .insert({
        user_id: user.id,
        name,
        birth_date,
        birth_time,
        birth_city,
        birth_country,
        latitude,
        longitude,
        timezone,
        is_active: true,
      })
      .select()
      .single()

    if (birthError || !birthDetail) {
      console.error('❌ Birth insert failed:', birthError)
      return NextResponse.json(
        { error: 'Failed to save birth details' },
        { status: 500 }
      )
    }

    // 4️⃣ Attempt chart calculation (non-blocking)
    let chartData: any = null

    try {
      const birthDateTime = new Date(`${birth_date}T${birth_time}`)

      const railwayResponse = await fetch(
        `${process.env.RAILWAY_API_URL}/calculate-chart`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            year: birthDateTime.getFullYear(),
            month: birthDateTime.getMonth() + 1,
            day: birthDateTime.getDate(),
            hour: birthDateTime.getHours(),
            minute: birthDateTime.getMinutes(),
            city: birth_city,
            latitude,
            longitude,
            timezone,
          }),
        }
      )

      if (!railwayResponse.ok) {
        throw new Error('Railway API returned non-200')
      }

      chartData = await railwayResponse.json()
    } catch (err) {
      console.warn('⚠️ Railway API failed, using fallback:', err)

      chartData = {
        d1_rasi_chart: {},
        d9_navamsa_chart: {},
        d10_dasamsa_chart: {},
        planetary_positions: {},
        nakshatras: {},
        vimshottari_dasha: {},
        houses: {},
        ayanamsa_value: 24.0,
        ayanamsa_type: 'LAHIRI',
      }
    }

    // 5️⃣ Save chart (ADMIN — dependent data)
    const { error: chartError } = await supabaseAdmin
      .from('vedic_charts')
      .insert({
        user_id: user.id,
        birth_detail_id: birthDetail.id,
        ...chartData,
      })

    if (chartError) {
      console.error('❌ Chart insert failed:', chartError)
      // Birth details remain valid — chart can be regenerated later
    }

    // 6️⃣ Success response
    return NextResponse.json({
      success: true,
      birth_detail: birthDetail,
      chart: chartData,
    })

  } catch (error) {
    console.error('❌ Birth details route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
