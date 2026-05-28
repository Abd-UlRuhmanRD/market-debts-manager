import { NextResponse } from 'next/server';
import { addPerson, HttpError, listPeople, removePerson } from '@/lib/debts-repository';

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
    const people = await listPeople(section);

    return NextResponse.json({ people });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const person = await addPerson(body.section, body.name);

    return NextResponse.json({ person }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    await removePerson(searchParams.get('section'), searchParams.get('id'));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
