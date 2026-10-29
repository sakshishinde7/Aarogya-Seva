import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Syringe, ClipboardPlus, CalendarClock,
  User, MapPin, Phone, ShieldCheck, Loader2, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getPatient, getPatientVaccinations, getPatientDiseases, getPatientFollowups,
  type Patient, type VaccinationRecord, type DiseaseRecord, type Followup,
} from '../api/client';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

type Tab = 'overview' | 'vaccinations' | 'diseases' | 'followups';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Completed: 'bg-green-100 text-green-700',
    Scheduled: 'bg-yellow-100 text-yellow-700',
    Overdue: 'bg-red-100 text-red-700',
    Cancelled: 'bg-gray-100 text-gray-600',
    Pending: 'bg-yellow-100 text-yellow-700',
    Active: 'bg-red-100 text-red-700',
    Recovered: 'bg-green-100 text-green-700',
    Chronic: 'bg-orange-100 text-orange-700',
    Deceased: 'bg-gray-200 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default function PatientDetail() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    setLoading(true);
    setError('');
    getPatient(id)
      .then((res) => setPatient(res.data))
      .catch(() => setError('Failed to load patient.'))
      .finally(() => setLoading(false));
  }, [id, user]);

  // Lazy-fetch tab data
  useEffect(() => {
    if (!id || !user) return;
    if (activeTab === 'vaccinations' && vaccinations.length === 0) {
      getPatientVaccinations(id).then((r) => setVaccinations(r.data)).catch(() => {});
    }
    if (activeTab === 'diseases' && diseases.length === 0) {
      getPatientDiseases(id).then((r) => setDiseases(r.data)).catch(() => {});
    }
    if (activeTab === 'followups' && followups.length === 0) {
      getPatientFollowups(id).then((r) => setFollowups(r.data)).catch(() => {});
    }
  }, [activeTab, id, user, vaccinations.length, diseases.length, followups.length]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 font-medium">{error || 'Patient not found.'}</p>
        <Link to="/patients" className="text-sage-dark hover:underline text-sm mt-2 inline-block">
          ← Back to patients
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'vaccinations', label: 'Vaccination History' },
    { key: 'diseases', label: 'Healthcare Records' },
    { key: 'followups', label: 'Follow-ups' },
  ];

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <div>
      <dt className="text-xs text-secondary-text uppercase tracking-wide">{label}</dt>
      <dd className="text-primary-text font-medium mt-0.5">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/patients"
          className="inline-flex items-center gap-1 text-secondary-text hover:text-primary-text text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/patients/${id}/edit`}
            className="inline-flex items-center gap-1.5 bg-white border border-border-subtle hover:bg-mint-light text-primary-text font-medium px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Patient
          </Link>
          <Link
            to={`/vaccinations/new?patient_id=${id}`}
            className="inline-flex items-center gap-1.5 bg-white border border-border-subtle hover:bg-mint-light text-primary-text font-medium px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <Syringe className="w-3.5 h-3.5" /> Record Vaccination
          </Link>
          <Link
            to={`/diseases/new?patient_id=${id}`}
            className="inline-flex items-center gap-1.5 bg-white border border-border-subtle hover:bg-mint-light text-primary-text font-medium px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <ClipboardPlus className="w-3.5 h-3.5" /> Add Visit
          </Link>
          <Link
            to={`/followups/new?patient_id=${id}`}
            className="inline-flex items-center gap-1.5 bg-sage-dark hover:bg-sage text-white hover:text-primary-text font-medium px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" /> Schedule Follow-up
          </Link>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="bg-mint-light rounded-full p-3">
            <User className="w-6 h-6 text-sage-dark" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-text">{patient.full_name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-secondary-text">
              <span>{patient.sex} · {calculateAge(patient.date_of_birth)} years</span>
              {patient.village && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {patient.village}
                </span>
              )}
              {patient.contact_number && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {patient.contact_number}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs bg-mint-light text-sage-dark px-2 py-1 rounded-full font-medium">
            ID #{patient.id}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-sage-dark text-sage-dark'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:border-border-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-border-subtle shadow-sm p-6">
        {activeTab === 'overview' && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Full Name" value={patient.full_name} />
            <InfoItem label="Date of Birth" value={formatDate(patient.date_of_birth)} />
            <InfoItem label="Age" value={`${calculateAge(patient.date_of_birth)} years`} />
            <InfoItem label="Sex" value={patient.sex} />
            <InfoItem label="Village" value={patient.village} />
            <InfoItem label="District" value={patient.district} />
            <InfoItem label="State" value={patient.state} />
            <InfoItem label="Contact Number" value={patient.contact_number} />
            <InfoItem label="Guardian Name" value={patient.guardian_name} />
            <InfoItem label="Guardian Contact" value={patient.guardian_contact} />
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoItem label="Notes" value={patient.notes} />
            </div>
          </dl>
        )}

        {activeTab === 'vaccinations' && (
          vaccinations.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="w-10 h-10 text-border-subtle mx-auto mb-2" />
              <p className="text-secondary-text">No vaccination records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-mint-light border-b border-border-subtle">
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Vaccine</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Dose</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Status</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Scheduled</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Administered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {vaccinations.map((v) => (
                    <tr key={v.id} className="hover:bg-mint-light/50">
                      <td className="px-4 py-2.5 font-medium">{v.vaccine_name ?? `Vaccine #${v.vaccine_id}`}</td>
                      <td className="px-4 py-2.5 text-secondary-text">Dose {v.dose_number}</td>
                      <td className="px-4 py-2.5">{statusBadge(v.status)}</td>
                      <td className="px-4 py-2.5 text-secondary-text">{formatDate(v.scheduled_date)}</td>
                      <td className="px-4 py-2.5 text-secondary-text">{formatDate(v.administration_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'diseases' && (
          diseases.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardPlus className="w-10 h-10 text-border-subtle mx-auto mb-2" />
              <p className="text-secondary-text">No healthcare records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-mint-light border-b border-border-subtle">
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Disease Category</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Status</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Date Reported</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {diseases.map((d) => (
                    <tr key={d.id} className="hover:bg-mint-light/50">
                      <td className="px-4 py-2.5 font-medium">{d.disease_category}</td>
                      <td className="px-4 py-2.5">{statusBadge(d.status)}</td>
                      <td className="px-4 py-2.5 text-secondary-text">{formatDate(d.date_reported)}</td>
                      <td className="px-4 py-2.5 text-secondary-text truncate max-w-xs">{d.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'followups' && (
          followups.length === 0 ? (
            <div className="text-center py-12">
              <CalendarClock className="w-10 h-10 text-border-subtle mx-auto mb-2" />
              <p className="text-secondary-text">No follow-ups scheduled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-mint-light border-b border-border-subtle">
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Type</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Scheduled Date</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Status</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Assigned Worker</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-primary-text">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {followups.map((f) => (
                    <tr key={f.id} className="hover:bg-mint-light/50">
                      <td className="px-4 py-2.5 font-medium">{f.type}</td>
                      <td className="px-4 py-2.5 text-secondary-text">{formatDate(f.scheduled_date)}</td>
                      <td className="px-4 py-2.5">{statusBadge(f.status)}</td>
                      <td className="px-4 py-2.5 text-secondary-text">{f.assigned_worker || '—'}</td>
                      <td className="px-4 py-2.5 text-secondary-text truncate max-w-xs">{f.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
