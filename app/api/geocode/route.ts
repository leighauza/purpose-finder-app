import { NextResponse } from 'next/server'
const tzlookup = require('tz-lookup')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ cities: [] })
  }

  try {
    // Use SEARCH instead of AUTOCOMPLETE for more granular results
    const res = await fetch(
      `https://api.locationiq.com/v1/search?key=pk.78a1729f7c1512f2b23f597ff52f3678&q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1&dedupe=1`,
      {
        headers: { accept: 'application/json' }
      }
    )
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('LocationIQ error:', errorText)
      throw new Error('Geocoding failed')
    }

    const data = await res.json()

    // DEBUG: Log what we're getting
    console.log(`Search for "${query}":`, data.length, 'results')
    if (data.length > 0) {
      console.log('First result:', JSON.stringify(data[0], null, 2))
    }
        
    // Transform LocationIQ response to our format with timezone
    const cities = data.map((result: any) => {
      const latitude = parseFloat(result.lat)
      const longitude = parseFloat(result.lon)
      
      // Get timezone from coordinates
      const timezone = tzlookup(latitude, longitude) || 'UTC'
      
      // Get the most specific location name available
      const name = result.address.suburb || 
                   result.address.neighbourhood || 
                   result.address.city || 
                   result.address.town || 
                   result.address.village || 
                   result.address.county ||
                   result.name
      
      return {
        name,
        country: result.address.country,
        state: result.address.state,
        latitude,
        longitude,
        timezone,
        displayName: result.display_name
      }
    })

    return NextResponse.json({ cities })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}