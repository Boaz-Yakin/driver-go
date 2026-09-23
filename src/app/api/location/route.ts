import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
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

  const body = await request.json() as {
    delivery_id: string;
    driver_id: string;
    lat: number;
    lng: number;
    speed?: number;
  };

  const { delivery_id, driver_id, lat, lng, speed } = body;

  if (!delivery_id || lat == null || lng == null) {
    return NextResponse.json(
      { error: 'delivery_id, lat, lng are required' },
      { status: 400 }
    );
  }

  // UUID 형식이 아닌 임시 ID('unassigned-driver' 등)가 오면 null로 처리
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(driver_id);
  const safeDriverId = isValidUuid ? driver_id : null;

  const { data, error } = await supabase
    .from('location_logs')
    .insert([{ delivery_id, driver_id: safeDriverId, lat, lng, speed: speed ?? null }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
