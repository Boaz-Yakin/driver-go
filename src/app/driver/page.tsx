'use client';

import React, { useState, useEffect } from 'react';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

export default function DriverPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swiped, setSwiped] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await DeliveryService.getAll();
        setDeliveries(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const active = deliveries.find(
    d => d.status === 'PENDING' || d.status === 'IN_TRANSIT'
  );

  return (
    <div style={{ color: '#ffffff', padding: '16px' }}>
      {loading && (
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#aaa' }}>Loading...</p>
      )}

      {error && (
        <div style={{ background: '#7f1d1d', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <p style={{ color: '#fca5a5', fontWeight: 'bold' }}>Error</p>
          <p style={{ color: '#fca5a5', fontSize: '14px', marginTop: '4px' }}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {!active ? (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#1a1a1a', border: '1px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <span style={{ color: '#3b82f6', fontSize: '24px' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                No Active Deliveries
              </h2>
              <p style={{ color: '#888', fontSize: '14px' }}>({deliveries.length}건 조회됨)</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Delivery Card */}
              <div style={{
                background: '#141414', border: '1px solid #2a2a2a',
                borderRadius: '16px', padding: '20px'
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: 'bold', color: '#3b82f6',
                  background: 'rgba(59,130,246,0.1)', padding: '4px 10px',
                  borderRadius: '6px', letterSpacing: '0.05em'
                }}>
                  {active.status}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '12px 0' }}>
                  Delivery #{active.id.substring(0, 8)}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                  {/* Origin */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#1a1a1a', border: '1px solid #333',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '12px', color: '#ddd' }}>A</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pickup</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>{active.origin_address}</p>
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '24px', background: '#2a2a2a', marginLeft: '16px' }} />

                  {/* Destination */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#1a1a1a', border: '1px solid #3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '12px', color: '#3b82f6' }}>B</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Drop-off</p>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>{active.destination_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swipe to start */}
              <button
                onClick={() => setSwiped(true)}
                style={{
                  width: '100%', height: '64px', borderRadius: '999px',
                  background: swiped ? '#22c55e' : '#3b82f6',
                  border: 'none', color: '#fff',
                  fontSize: '16px', fontWeight: 'bold',
                  cursor: 'pointer', transition: 'background 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {swiped ? '✓ Route Started' : '▶ Start Route'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
