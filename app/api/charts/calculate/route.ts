// app/api/charts/calculate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateAndSaveVedicCharts } from '@/lib/calculateVedicCharts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      birthDetailId,
      userId,
    }: {
      birthDetailId: string;
      userId: string;
    } = body;

    if (!birthDetailId || !userId) {
      return NextResponse.json(
        { error: 'Missing birthDetailId or userId' },
        { status: 400 },
      );
    }

    const result = await calculateAndSaveVedicCharts({ birthDetailId, userId });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/charts/calculate', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500 },
    );
  }
}