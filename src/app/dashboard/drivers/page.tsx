'use client';

import React, { useState, useEffect } from 'react';
import { DriverService } from '@/services/delivery.service';
import { Driver, DriverStatus } from '@/types';

const STATUS_STYLES: Record<DriverStatus, { bg: string; color: string; label: string }> = {
  OFF_DUTY:  { bg: '#1c1c1c', color: '#888', label: 'Off Duty' },
  AVAILABLE: { bg: '#0f2318', color: '#4ade80', label: 'Available' },
  ON_ROUTE:  { bg: '#1c2338', color: '#38bdf8', label: 'On Route' },
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    DriverService.getAll()
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await DriverService.create({
        name: form.name,
        phone_number: form.phone_number,
        status: 'OFF_DUTY',
      });
      setDrivers(prev => [created, ...prev]);
      setShowForm(false);
      setForm({ name: '', phone_number: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Drivers</h1>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          {showForm ? 'Cancel' : '+ Add Driver'}
        </button>
      </div>

      {/* 드라이버 등록 폼 */}
      {showForm && (
        <div className="bg-surface border border-subtle rounded-lg p-5">
          <h2 className="text-base font-medium text-primary mb-4">New Driver</h2>
          {error && (
            <p className="mb-3 text-sm text-status-error bg-status-error/10 rounded px-3 py-2">{error}</p>
          )}
          <form onSubmit={handleCreate} className="flex gap-4 flex-wrap">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 min-w-48 bg-bg-elevated border border-default rounded-md px-3 py-2 text-sm text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
            />
            <input
              required
              placeholder="Phone number"
              value={form.phone_number}
              onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
              className="flex-1 min-w-48 bg-bg-elevated border border-default rounded-md px-3 py-2 text-sm text-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-md text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {/* 드라이버 카드 그리드 */}
      {loading ? (
        <p className="text-center text-muted py-10 text-sm">Loading...</p>
      ) : drivers.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">No drivers registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(driver => {
            const s = STATUS_STYLES[driver.status];
            return (
              <div key={driver.id} className="bg-surface border border-subtle rounded-lg p-5 hover:border-border-focus transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated border border-subtle flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{driver.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <h3 className="font-medium text-primary">{driver.name}</h3>
                <p className="text-sm text-secondary mt-1">{driver.phone_number}</p>
                <p className="text-xs text-muted mt-3 font-mono">{driver.id.substring(0, 8)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
