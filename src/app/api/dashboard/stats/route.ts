import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface DashboardStats {
  driversOnline: number;
  delayedCount: number;
}

function makeSupabase(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(
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
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = makeSupabase(cookieStore);

  // 병렬 집계
  const [driversResult, delayedResult] = await Promise.all([
    // Drivers Online: AVAILABLE 또는 ON_ROUTE 상태
    supabase
      .from('drivers')
      .select('id', { count: 'exact', head: true })
      .in('status', ['AVAILABLE', 'ON_ROUTE']),

    // Delayed: planned_eta가 과거이고 아직 완료/취소되지 않은 배송
    supabase
      .from('deliveries')
      .select('id', { count: 'exact', head: true })
      .not('planned_eta', 'is', null)
      .lt('planned_eta', new Date().toISOString())
      .in('status', ['PENDING', 'PICKED_UP', 'IN_TRANSIT']),
  ]);

  if (driversResult.error) {
    return NextResponse.json({ error: driversResult.error.message }, { status: 500 });
  }
  if (delayedResult.error) {
    return NextResponse.json({ error: delayedResult.error.message }, { status: 500 });
  }

  const stats: DashboardStats = {
    driversOnline: driversResult.count ?? 0,
    delayedCount: delayedResult.count ?? 0,
  };

  return NextResponse.json(stats);
}
