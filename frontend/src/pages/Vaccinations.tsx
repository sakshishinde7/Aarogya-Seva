import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Syringe, Plus, ChevronLeft, ChevronRight, Filter, Loader2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getVaccinationRecords, type VaccinationRecord, type PaginatedResponse } from '../api/client';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

const STATUS_OPTIONS = ['All', 'Scheduled', 'Completed', 'Overdue', 'Cancelled'] as const;

const statusBadgeClass: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Scheduled: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-600',
};

export default function Vaccinations() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<PaginatedResponse<VaccinationRecord> | null>(null);
  const [status, setStatus] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const perPage = 10;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getVaccinationRecords({
        status: status === 'All' ? undefined : status,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: perPage,
      });
      setData(res.data);
    } catch {
      setError('Failed to load vaccination records.');
    } finally {
      setLoading(false);
    }
  }, [status, dateFrom, dateTo, page]);

  useEffect(() => {
    if (user) fetchRecords();
  }, [user, fetchRecords]);

  useEffect(() => { setPage(1); }, [status, dateFrom, dateTo]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  const records = data?.data ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text flex items-center gap-2">
            <Syringe className="w-7 h-7 text-sage-dark" />
            Vaccinations
          </h1>
          <p className="text-secondary-text text-sm mt-1">Track and manage vaccination records</p>
        </div>
        <Link
          to="/vaccinations/new"
          className="inline-flex items-center gap-2 bg-sage-dark hover:bg-sage text-white hover:text-primary-text font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Vaccination
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-border-subtle shadow-sm p-4">
        <div className="flex items-center gap-2 text-secondary-text text-sm">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
        </div>
        <div>
          <label htmlFor="vac-status" className="block text-xs text-secondary-text mb-1">Status</label>
          <select
            id="vac-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm bg-white text-primary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vac-from" className="block text-xs text-secondary-text mb-1">From</label>
          <input
            id="vac-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm bg-white text-primary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30"
          />
        </div>
        <div>
          <label htmlFor="vac-to" className="block text-xs text-secondary-text mb-1">To</label>
          <input
            id="vac-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm bg-white text-primary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-blush border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-sage-dark" />
            <span className="ml-2 text-secondary-text">Loading records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20">
            <Syringe className="w-12 h-12 text-border-subtle mx-auto mb-3" />
            <p className="text-secondary-text font-medium">No vaccination records found</p>
            <p className="text-secondary-text text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mint-light border-b border-border-subtle">
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Patient Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Vaccine</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Dose</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Scheduled</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Administered</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Worker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-mint-light/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-text">
                      <Link to={`/patients/${r.patient_id}`} className="hover:text-sage-dark hover:underline">
                        {r.patient_name ?? `Patient #${r.patient_id}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-secondary-text">{r.vaccine_name ?? `#${r.vaccine_id}`}</td>
                    <td className="px-4 py-3 text-secondary-text">Dose {r.dose_number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary-text">{formatDate(r.scheduled_date)}</td>
                    <td className="px-4 py-3 text-secondary-text">{formatDate(r.administration_date)}</td>
                    <td className="px-4 py-3 text-secondary-text">{r.administered_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && records.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-text">
            Page {page} of {totalPages} · {data?.total ?? 0} total records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-medium text-primary-text hover:bg-mint-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-medium text-primary-text hover:bg-mint-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
