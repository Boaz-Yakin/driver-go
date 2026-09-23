import { NextResponse } from 'next/server';

type SmsPayload = {
  to: string;       // 수신자 전화번호 (E.164 형식: +821012345678)
  message: string;
};

async function sendSms({ to, message }: SmsPayload): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials not configured in .env');
  }

  const twilio = (await import('twilio')).default;
  const client = twilio(accountSid, authToken);

  await client.messages.create({ body: message, from, to });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      to: string;
      delivery_id: string;
      event: 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED';
      destination?: string;
    };

    const { to, delivery_id, event, destination } = body;

    if (!to || !event) {
      return NextResponse.json({ error: 'to and event are required' }, { status: 400 });
    }

    const messages: Record<string, string> = {
      PICKED_UP:  `[Driver-Go] Order has been picked up. (ID: ${delivery_id.substring(0, 8)})`,
      IN_TRANSIT: `[Driver-Go] Truck is in transit! Destination: ${destination ?? 'Unknown'} (ID: ${delivery_id.substring(0, 8)})`,
      DELIVERED:  `[Driver-Go] Delivery completed. Thank you! (ID: ${delivery_id.substring(0, 8)})`,
    };

    const message = messages[event];
    if (!message) {
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    await sendSms({ to, message });

    return NextResponse.json({ success: true, to, event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send SMS';
    console.error('[SMS]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
