import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Download, Loader2, Users, Syringe, Activity, CalendarCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getReportsSummary, exportReportCSV, type ReportSummary } from '../api/client';

const PIE_COLORS = ['#A8C3A0', '#E8E1F4', '#F5E2E1', '#DFEAF5', '#DCEBE0', '#6e9464', '#fbbf24', '#fb923c'];

export default function Reports() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [report, setReport] = useState<ReportSummary | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReportsSummary({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setReport(res.data);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFilter = () => {
    fetchReport();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportReportCSV({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aarogya-seva-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  const statCards = report
    ? [
        { label: 'Total Patients', value: report.total_patients, icon: Users, bgColor: 'bg-mint-light', iconColor: 'text-sage-dark' },
        { label: 'Total Vaccinations', value: report.total_vaccinations, icon: Syringe, bgColor: 'bg-lavender', iconColor: 'text-purple-600' },
        { label: 'Disease Records', value: report.total_diseases, icon: Activity, bgColor: 'bg-blush', iconColor: 'text-red-500' },
        { label: 'Pending Follow-ups', value: report.pending_followups, icon: CalendarCheck, bgColor: 'bg-softblue', iconColor: 'text-blue-600' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sage-dark" />
            Reports & Analytics
          </h1>
          <p className="text-secondary-text text-sm mt-1">View insights and export data</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 bg-sage-dark hover:bg-sage text-white hover:text-primary-text font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export CSV
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-border-subtle shadow-sm p-4">
        <div>
          <label htmlFor="rpt-start" className="block text-xs text-secondary-text mb-1">Start Date</label>
          <input
            id="rpt-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm bg-white text-primary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30"
          />
        </div>
        <div>
          <label htmlFor="rpt-end" className="block text-xs text-secondary-text mb-1">End Date</label>
          <input
            id="rpt-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-border-subtle rounded-lg text-sm bg-white text-primary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30"
          />
        </div>
        <button
          onClick={handleFilter}
          className="px-4 py-2 bg-mint hover:bg-mint-light border border-border-subtle rounded-lg text-sm font-medium text-primary-text transition-colors"
        >
          Apply Filter
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-blush border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
          <span className="ml-2 text-secondary-text">Loading report...</span>
        </div>
      ) : report ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-border-subtle shadow-sm p-5 flex items-center gap-4"
              >
                <div className={`${card.bgColor} rounded-lg p-3`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-text">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-secondary-text">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart — Monthly Registrations */}
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary-text mb-4">Monthly Registrations</h2>
              {report.monthly_registrations.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.monthly_registrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718078' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#718078' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F4',
                        border: '1px solid #E2E8E4',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="count" fill="#A8C3A0" radius={[4, 4, 0, 0]} name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-secondary-text text-sm text-center py-12">No data available.</p>
              )}
            </div>

            {/* Pie Chart — Disease Distribution */}
            <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
              <h2 className="text-lg font-semibold text-primary-text mb-4">Disease Category Distribution</h2>
              {report.disease_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={report.disease_distribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry: any) =>
                        `${entry.name || entry.category || ''} ${(((entry.percent || 0)) * 100).toFixed(0)}%`
                      }
                      labelLine={true}
                    >
                      {report.disease_distribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FAF8F4',
                        border: '1px solid #E2E8E4',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-secondary-text text-sm text-center py-12">No data available.</p>
              )}
            </div>
          </div>

          {/* Bar Chart — Monthly Vaccinations (full width) */}
          <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
            <h2 className="text-lg font-semibold text-primary-text mb-4">Monthly Vaccinations</h2>
            {report.monthly_vaccinations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.monthly_vaccinations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718078' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#718078' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F4',
                      border: '1px solid #E2E8E4',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6e9464" radius={[4, 4, 0, 0]} name="Vaccinations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-secondary-text text-sm text-center py-12">No data available.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
