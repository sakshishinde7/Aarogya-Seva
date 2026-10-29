import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPatients, type Patient, type PaginatedResponse } from '../api/client';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function Patients() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<PaginatedResponse<Patient> | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const perPage = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPatients({ search: search || undefined, page, per_page: perPage });
      setData(res.data);
    } catch {
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (user) fetchPatients();
  }, [user, fetchPatients]);

  // Debounced search
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  const patients = data?.data ?? [];
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text flex items-center gap-2">
            <Users className="w-7 h-7 text-sage-dark" />
            Patients
          </h1>
          <p className="text-secondary-text text-sm mt-1">
            Manage patient registrations and records
          </p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex items-center gap-2 bg-sage-dark hover:bg-sage text-white hover:text-primary-text font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register Patient
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
        <input
          type="text"
          placeholder="Search by name, village, or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-border-subtle rounded-lg bg-white text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-blush border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-sage-dark" />
            <span className="ml-2 text-secondary-text">Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-border-subtle mx-auto mb-3" />
            <p className="text-secondary-text font-medium">No patients found</p>
            <p className="text-secondary-text text-sm mt-1">
              {search ? 'Try adjusting your search.' : 'Register your first patient to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-mint-light border-b border-border-subtle">
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Age</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Sex</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Village</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary-text">Contact</th>
                  <th className="text-right px-4 py-3 font-semibold text-primary-text">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-mint-light/50 transition-colors">
                    <td className="px-4 py-3 text-secondary-text font-mono text-xs">
                      #{patient.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-primary-text">
                      {patient.full_name}
                    </td>
                    <td className="px-4 py-3 text-secondary-text">
                      {calculateAge(patient.date_of_birth)}
                    </td>
                    <td className="px-4 py-3 text-secondary-text">{patient.sex}</td>
                    <td className="px-4 py-3 text-secondary-text">{patient.village || '—'}</td>
                    <td className="px-4 py-3 text-secondary-text">
                      {patient.contact_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 text-sage-dark hover:text-primary-text px-2 py-1 rounded hover:bg-mint-light transition-colors text-xs font-medium"
                          title="View patient"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <Link
                          to={`/patients/${patient.id}/edit`}
                          className="inline-flex items-center gap-1 text-secondary-text hover:text-primary-text px-2 py-1 rounded hover:bg-mint-light transition-colors text-xs font-medium"
                          title="Edit patient"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && patients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-text">
            Page {page} of {totalPages} · {data?.total ?? 0} total patients
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-medium text-primary-text hover:bg-mint-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-border-subtle rounded-lg text-sm font-medium text-primary-text hover:bg-mint-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
