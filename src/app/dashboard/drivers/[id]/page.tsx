'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DriverService } from '@/services/delivery.service';
import { Driver, DeliveryStatus } from '@/types';

const STATUS_STYLES: Record<DeliveryStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#1c1c2e', color: '#a78bfa', label: 'Pending' },
  PICKED_UP:  { bg: '#1c2338', color: '#60a5fa', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#1c2338', color: '#38bdf8', label: 'In Transit' },
  DELIVERED:  { bg: '#0f2318', color: '#4ade80', label: 'Delivered' },
  CANCELLED:  { bg: '#2a1515', color: '#f87171', label: 'Cancelled' },
};

export default function DriverDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.id as string;
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone_number: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    DriverService.getById(driverId)
      .then(d => {
        setDriver(d);
        setEditForm({ name: d.name, phone_number: d.phone_number });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [driverId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    setIsSaving(true);
    try {
      const updated = await DriverService.update(driver.id, {
        name: editForm.name,
        phone_number: editForm.phone_number,
      });
      setDriver(prev => prev ? { ...prev, ...updated } : null);
      setIsEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update driver');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading driver details...</div>;
  if (error || !driver) return <div className="p-8 text-center text-red-400">Error: {error || 'Driver not found'}</div>;

  const deliveries = driver.deliveries || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()}
        className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1"
      >
        <span>←</span> Back to Drivers
      </button>

      <div className="bg-surface border border-subtle rounded-xl p-6 flex items-start gap-6 relative">
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setEditForm({ name: driver.name, phone_number: driver.phone_number });
          }}
          className="absolute top-6 right-6 text-sm text-accent hover:opacity-80 font-medium"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>

        <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold uppercase shrink-0">
          {driver.name.charAt(0)}
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-3 mt-1 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Name</label>
                <input
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg-elevated border border-default rounded-md px-3 py-1.5 text-sm text-primary focus:border-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Phone Number</label>
                <input
                  required
                  value={editForm.phone_number}
                  onChange={e => setEditForm(f => ({ ...f, phone_number: e.target.value }))}
                  className="w-full bg-bg-elevated border border-default rounded-md px-3 py-1.5 text-sm text-primary focus:border-accent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 rounded-md text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-primary mb-1">{driver.name}</h1>
              <p className="text-secondary mb-4">{driver.phone_number}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted">Status:</span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  driver.status === 'AVAILABLE' ? 'bg-green-900/50 text-green-400' :
                  driver.status === 'ON_ROUTE' ? 'bg-blue-900/50 text-blue-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {driver.status.replace('_', ' ')}
                </span>
                <span className="text-muted ml-4">Joined:</span>
                <span className="text-primary">{new Date(driver.created_at).toLocaleDateString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-subtle bg-bg-elevated">
          <h2 className="text-lg font-semibold text-primary">Delivery History</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-subtle">
              {['ID', 'Status', 'Origin', 'Destination', 'Date'].map(h => (
                <th key={h} className="py-3 px-6 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-sm text-muted">No deliveries found for this driver.</td></tr>
            ) : deliveries.map(d => {
              const style = STATUS_STYLES[d.status];
              return (
                <tr 
                  key={d.id} 
                  className="border-b border-subtle hover:bg-bg-elevated transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/deliveries/${d.id}`)}
                >
                  <td className="py-4 px-6 text-xs font-mono text-secondary">{d.id.substring(0, 8)}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-primary max-w-[200px] truncate">{d.origin_address}</td>
                  <td className="py-4 px-6 text-sm text-primary max-w-[200px] truncate">{d.destination_address}</td>
                  <td className="py-4 px-6 text-xs text-muted">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
