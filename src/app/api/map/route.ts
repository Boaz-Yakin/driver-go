import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 각 delivery_id별 최신 위치 1건씩 조회
export async function GET() {
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

  // 현재 IN_TRANSIT 상태인 배송의 최신 위치만 조회 (드라이버 정보 포함)
  const { data: deliveries, error: deliveryError } = await supabase
    .from('deliveries')
    .select('id, driver_id, status, origin_address, destination_address, drivers(name, phone_number)')
    .in('status', ['IN_TRANSIT', 'PICKED_UP']);

  if (deliveryError) {
    return NextResponse.json({ error: deliveryError.message }, { status: 500 });
  }

  if (!deliveries || deliveries.length === 0) {
    return NextResponse.json([]);
  }

  // 각 배송의 최신 위치 조회
  const locationPromises = deliveries.map(async (d) => {
    const { data: loc } = await supabase
      .from('location_logs')
      .select('lat, lng, speed, timestamp')
      .eq('delivery_id', d.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!loc) return null;

    // Supabase relation type can be array or single object depending on mapping
    const driverData = (Array.isArray(d.drivers) ? d.drivers[0] : d.drivers) as { name: string; phone_number: string } | null; 

    return {
      id: d.id,
      driver_id: d.driver_id,
      driver_name: driverData?.name || 'Unknown',
      driver_phone: driverData?.phone_number || '',
      status: d.status,
      lat: loc.lat,
      lng: loc.lng,
      speed: loc.speed,
      timestamp: loc.timestamp,
      label: `${d.origin_address} → ${d.destination_address}`,
    };
  });

  const locations = (await Promise.all(locationPromises)).filter(Boolean);
  return NextResponse.json(locations);
}
