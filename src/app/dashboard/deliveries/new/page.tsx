'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryService } from '@/services/delivery.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NewDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    driver_id: '',
    recipient_phone: '',
    origin_address: '',
    destination_address: '',
    status: 'PENDING' as const,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // uuid 형식 유효성 검사 등은 생략된 기본 구현
      const submitData = {
        ...formData,
        driver_id: formData.driver_id || null, // 빈 문자열인 경우 null 처리
      };
      
      await DeliveryService.create(submitData);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create delivery.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Create New Delivery</h1>
      
      <Card>
        {error && (
          <div className="mb-4 rounded-md bg-status-error/10 p-3 text-sm text-status-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Driver ID (UUID)</label>
              <input
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                className="w-full bg-bg-elevated border border-default rounded-md px-3 py-2 text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Recipient Phone</label>
              <input
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleChange}
                className="w-full bg-bg-elevated border border-default rounded-md px-3 py-2 text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Origin Address</label>
              <input
                name="origin_address"
                value={formData.origin_address}
                onChange={handleChange}
                className="w-full bg-bg-elevated border border-default rounded-md px-3 py-2 text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Destination Address</label>
              <input
                name="destination_address"
                value={formData.destination_address}
                onChange={handleChange}
                className="w-full bg-bg-elevated border border-default rounded-md px-3 py-2 text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Delivery'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
