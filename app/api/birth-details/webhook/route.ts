// app/api/birth-details/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateAndSaveVedicCharts } from '../../../../lib/calculateVedicCharts';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Supabase webhooks send:
    // { type: 'INSERT' | 'UPDATE', table: 'birth_details', record: {...}, old_record: {...} } [web:455]
    const record = payload.record;
    if (!record) {
      return NextResponse.json(
        { error: 'No record in webhook payload' },
        { status: 400 },
      );
    }

    const birthDetailId: string = record.id;
    const userId: string = record.user_id;

    if (!birthDetailId || !userId) {
      return NextResponse.json(
        { error: 'Missing birthDetailId or userId in record' },
        { status: 400 },
      );
    }

    // Optionally: check payload.type === 'INSERT' or 'UPDATE' if you only care about these.

    // Fire the calculation (INSERT + latest chart wins)
    await calculateAndSaveVedicCharts({ birthDetailId, userId });

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Error in /api/birth-details/webhook', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 },
    );
  }
}
