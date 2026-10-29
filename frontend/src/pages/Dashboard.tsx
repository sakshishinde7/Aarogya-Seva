import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Syringe,
  Calendar,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../api/client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface DashboardStats {
  total_patients: number;
  total_vaccinations: number;
  followups_due: number;
  active_disease_cases: number;
  monthly_vaccinations: { month: string; count: number }[];
  age_distribution: { group: string; count: number }[];
  recent_activity: { id: number; description: string; timestamp: string }[];
}

// Chart palette using our design system colors
const PIE_COLORS = ['#A8C3A0', '#6e9464', '#DCEBE0', '#E8E1F4', '#DFEAF5', '#F5E2E1'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      setStats(res.data);
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch stats on mount
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  if (!user) return null;

  // ──────────────────────────────────────────────
  // Stat cards config
  // ──────────────────────────────────────────────
  const statCards = stats
    ? [
        {
          label: 'Total Patients',
          value: stats.total_patients,
          icon: Users,
          bg: 'bg-mint-light',
          iconColor: 'text-sage-dark',
        },
        {
          label: 'Vaccinations',
          value: stats.total_vaccinations,
          icon: Syringe,
          bg: 'bg-lavender',
          iconColor: 'text-purple-600',
        },
        {
          label: 'Follow-ups Due',
          value: stats.followups_due,
          icon: Calendar,
          bg: 'bg-softblue',
          iconColor: 'text-blue-600',
        },
        {
          label: 'Active Disease Cases',
          value: stats.active_disease_cases,
          icon: Activity,
          bg: 'bg-blush',
          iconColor: 'text-red-500',
        },
      ]
    : [];

  // ──────────────────────────────────────────────
  // Quick actions
  // ──────────────────────────────────────────────
  const quickActions = [
    { label: 'Register Patient', href: '/patients/new', icon: Plus },
    { label: 'Record Vaccination', href: '/vaccinations/new', icon: Syringe },
    { label: 'Schedule Follow-up', href: '/followups/new', icon: Calendar },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">Dashboard</h1>
          <p className="text-secondary-text text-sm mt-1">
            Welcome back, {user.full_name || user.email}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
            rounded-lg border border-border-subtle bg-white hover:bg-mint-light
            transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-blush border border-red-200 text-red-700 rounded-lg px-4 py-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchStats}
            className="ml-auto text-sm font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white border border-border-subtle animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-border-subtle p-5 flex items-center gap-4
                hover:shadow-md transition-shadow"
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-lg ${card.bg}`}
              >
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-text">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-sm text-secondary-text">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly vaccination bar chart */}
          <div className="bg-white rounded-xl border border-border-subtle p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-sage-dark" />
              <h2 className="text-lg font-semibold text-primary-text">
                Monthly Vaccinations
              </h2>
            </div>
            {stats.monthly_vaccinations && stats.monthly_vaccinations.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.monthly_vaccinations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#718078' }}
                    axisLine={{ stroke: '#E2E8E4' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#718078' }}
                    axisLine={{ stroke: '#E2E8E4' }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8E4',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#6e9464"
                    radius={[4, 4, 0, 0]}
                    name="Vaccinations"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-secondary-text text-sm py-12 text-center">
                No vaccination data available.
              </p>
            )}
          </div>

          {/* Age distribution pie chart */}
          <div className="bg-white rounded-xl border border-border-subtle p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-sage-dark" />
              <h2 className="text-lg font-semibold text-primary-text">
                Patient Age Distribution
              </h2>
            </div>
            {stats.age_distribution && stats.age_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.age_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="group"
                    paddingAngle={2}
                    label={(entry: any) =>
                      `${entry.name || entry.group || ''} (${((entry.percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {stats.age_distribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8E4',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-secondary-text text-sm py-12 text-center">
                No age distribution data available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent activity & quick actions */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border-subtle p-6">
            <h2 className="text-lg font-semibold text-primary-text mb-4">
              Recent Activity
            </h2>
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              <ul className="divide-y divide-border-subtle">
                {stats.recent_activity.map((item) => (
                  <li key={item.id} className="py-3 flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-sage-dark shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary-text">
                        {item.description}
                      </p>
                      <p className="text-xs text-secondary-text mt-0.5">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary-text text-sm py-8 text-center">
                No recent activity to display.
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-border-subtle p-6">
            <h2 className="text-lg font-semibold text-primary-text mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg
                    bg-mint-light hover:bg-mint text-primary-text text-sm font-medium
                    transition-colors"
                >
                  <action.icon className="h-5 w-5 text-sage-dark" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
