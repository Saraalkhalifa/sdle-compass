import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import type { User, UserRole, AccountStatus } from '@/types';

const ROLES: UserRole[] = ['student', 'editor', 'reviewer', 'admin', 'main_admin'];
const STATUSES: AccountStatus[] = ['pending', 'active', 'suspended', 'deleted'];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setUsers((data ?? []) as User[]);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateField = async (userId: string, field: 'role' | 'account_status', value: string) => {
    if (!supabase) return;
    setUpdating(userId);
    const update = field === 'role'
      ? { role: value as UserRole }
      : { account_status: value as AccountStatus };
    const { error } = await supabase.from('users').update(update).eq('id', userId);
    setUpdating(null);
    if (error) {
      toast.error(error.message);
    } else {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, [field]: value } : u));
      toast.success('User updated.');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <AppShell role="admin" title="User Management">
      <PageContainer title="User Management" maxWidth="xl">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                  <path strokeLinecap="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
              }
            />
          </div>
          <p className="text-sm text-slate-500 flex-shrink-0">{filtered.length} users</p>
        </div>

        <Card padding="none" className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              {search ? 'No users match your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${user.avatar_color} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{initials(user.full_name)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          disabled={updating === user.id}
                          onChange={(e) => updateField(user.id, 'role', e.target.value)}
                          className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          aria-label="Change role"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.account_status}
                          disabled={updating === user.id}
                          onChange={(e) => updateField(user.id, 'account_status', e.target.value)}
                          className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          aria-label="Change status"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageContainer>
    </AppShell>
  );
}
