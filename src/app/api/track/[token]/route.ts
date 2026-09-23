import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
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

  // tracking_token으로 배송 조회
  const { data: delivery, error } = await supabase
    .from('deliveries')
    .select('id, status, origin_address, destination_address, planned_eta, driver_id')
    .eq('tracking_token', token)
    .maybeSingle();

  if (error || !delivery) {
    return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
  }

  // 최신 위치 조회
  const { data: loc } = await supabase
    .from('location_logs')
    .select('lat, lng, speed, timestamp')
    .eq('delivery_id', delivery.id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ ...delivery, location: loc ?? null });
}
