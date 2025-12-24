// lib/calculateVedicCharts.ts
import { DateTime } from 'luxon';
import { getProkeralaClient } from './prokerala';
import { mapProkeralaToVedicCharts } from './mapProkerala';

function toProkeralaDateTime(
  birthDate: string,
  birthTime: string,
  timeZone: string,
): string {
  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: timeZone });
  if (!dt.isValid) {
    throw new Error('Invalid birth date/time or timezone');
  }
  return dt.toISO();
}

export async function calculateAndSaveVedicCharts(options: {
  birthDetailId: string;
  userId: string;
}): Promise<{ vedic_chart_id: string }> {
  const { birthDetailId, userId } = options;

  const { supabaseAdmin } = await import('./supabase/admin');

  // 1) Load birth_details
  const { data: birthDetail, error: bdError } = await supabaseAdmin
    .from('birth_details')
    .select('*')
    .eq('id', birthDetailId)
    .eq('user_id', userId)
    .single();

  if (bdError || !birthDetail) {
    throw new Error('Birth details not found');
  }

  // Adjust field names to match your birth_details table
  const birthDate: string = birthDetail.birth_date;
  const birthTime: string = birthDetail.birth_time;
  const lat: number = birthDetail.latitude;
  const lng: number = birthDetail.longitude;
  const timezone: string = birthDetail.timezone;

  if (!birthDate || !birthTime || lat == null || lng == null || !timezone) {
    throw new Error('Birth details record missing required fields');
  }

  // 2) Call Prokerala
  const ayanamsa = 1;
  const coordinates = `${lat},${lng}`;
  const datetime = toProkeralaDateTime(birthDate, birthTime, timezone);

  const client = getProkeralaClient();

  const birthDetails = await client.get('v2/astrology/birth-details', {
    ayanamsa,
    coordinates,
    datetime,
    la: 'en',
  });

  const d9 = await client.get('v2/astrology/divisional-planet-position', {
    ayanamsa,
    coordinates,
    datetime,
    chart_type: 'navamsa',
    la: 'en',
  });

  const d10 = await client.get('v2/astrology/divisional-planet-position', {
    ayanamsa,
    coordinates,
    datetime,
    chart_type: 'dasamsa',
    la: 'en',
  });

  const dashas = await client.get('v2/astrology/dasha-periods', {
    ayanamsa,
    coordinates,
    datetime,
    la: 'en',
    year_length: 1,
  });

  const mapped = mapProkeralaToVedicCharts({
    birthDetails,
    d9,
    d10,
    dashas,
    ayanamsa,
  });

  // 3) Insert into vedic_charts (INSERT, not upsert)
  const { data, error } = await supabaseAdmin
    .from('vedic_charts')
    .insert({
      user_id: userId,
      birth_detail_id: birthDetailId,
      d1_rasi_chart: mapped.d1_rasi_chart,
      d9_navamsa_chart: mapped.d9_navamsa_chart,
      d10_dasamsa_chart: mapped.d10_dasamsa_chart,
      planetary_positions: mapped.planetary_positions,
      nakshatras: mapped.nakshatras,
      vimshottari_dasha: mapped.vimshottari_dasha,
      houses: mapped.houses,
      ayanamsa_value: mapped.ayanamsa_value,
      ayanamsa_type: mapped.ayanamsa_type,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Failed to save vedic chart');
  }

  return { vedic_chart_id: data.id };
}