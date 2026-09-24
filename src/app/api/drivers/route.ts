import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

  const { data, error } = await supabase
    .from('drivers')
    .select('*, deliveries(id, destination_address, status)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Find the active delivery for each driver and format the response
  const activeStatuses = ['PENDING', 'PICKED_UP', 'IN_TRANSIT'];
  const formattedData = data.map((driver) => {
    const active_delivery =
      driver.deliveries?.find((d: { status: string }) => activeStatuses.includes(d.status)) || null;
    
    // Remove the full deliveries array from the response
    const { deliveries: _deliveries, ...driverData } = driver;
    
    return {
      ...driverData,
      active_delivery,
    };
  });

  return NextResponse.json(formattedData);
}

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

  const body = await request.json() as Record<string, unknown>;

  const { data, error } = await supabase
    .from('drivers')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
