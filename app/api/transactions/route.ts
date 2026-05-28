import { NextResponse } from 'next/server';
import {
  addTransaction,
  getTransactionsByPerson,
  HttpError,
} from '@/lib/debts-repository';

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
    const searchParams = new URL(request.url).searchParams;
    const transactions = await getTransactionsByPerson(
      searchParams.get('section'),
      searchParams.get('personId'),
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const transaction = await addTransaction(body.section, body);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
