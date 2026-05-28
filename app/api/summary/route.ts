import { NextResponse } from 'next/server';
import { getSectionSummary, HttpError } from '@/lib/debts-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  }

  console.error('[API Error]', error);
  return NextResponse.json(
    {
      message: 'حدث خطأ في الخادم.',
      detail: error instanceof Error ? error.message : undefined,
    },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const section = new URL(request.url).searchParams.get('section');
    const totalBalance = await getSectionSummary(section);

    return NextResponse.json({ totalBalance });
  } catch (error) {
    return errorResponse(error);
  }
}
