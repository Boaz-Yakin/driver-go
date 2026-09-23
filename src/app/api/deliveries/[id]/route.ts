import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const body = await request.json() as Record<string, unknown>;

  const { data, error } = await supabase
    .from('deliveries')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // SMS 트리거 — 수신자 전화번호가 있고, 주요 이벤트일 때
  const smsEvents = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
  const newStatus = body.status as string | undefined;

  if (newStatus && smsEvents.includes(newStatus) && data.recipient_phone) {
    // 비동기로 SMS 발송 (응답 지연 방지)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.recipient_phone,
        delivery_id: id,
        event: newStatus,
        destination: data.destination_address,
      }),
    }).catch(err => console.error('[SMS trigger failed]', err));
  }

  return NextResponse.json(data);
}

