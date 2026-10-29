import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Redirect to /login on 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  sex: 'Male' | 'Female' | 'Other';
  village?: string;
  district?: string;
  state?: string;
  contact_number?: string;
  guardian_name?: string;
  guardian_contact?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface VaccinationRecord {
  id: number;
  patient_id: number;
  patient_name?: string;
  vaccine_id: number;
  vaccine_name?: string;
  dose_number: number;
  scheduled_date: string;
  administration_date?: string | null;
  status: 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled';
  administered_by?: string;
  notes?: string;
  created_at?: string;
}

export interface Vaccine {
  id: number;
  name: string;
  description?: string;
  total_doses: number;
}

export interface DiseaseRecord {
  id: number;
  patient_id: number;
  patient_name?: string;
  disease_category: string;
  status: 'Active' | 'Recovered' | 'Chronic' | 'Deceased';
  date_reported: string;
  followup_status?: string;
  notes?: string;
  created_at?: string;
}

export interface Followup {
  id: number;
  patient_id: number;
  patient_name?: string;
  type: string;
  scheduled_date: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  assigned_worker?: string;
  notes?: string;
  completed_date?: string;
  created_at?: string;
}

export interface ReportSummary {
  total_patients: number;
  total_vaccinations: number;
  total_diseases: number;
  pending_followups: number;
  monthly_registrations: { month: string; count: number }[];
  monthly_vaccinations: { month: string; count: number }[];
  disease_distribution: { category: string; count: number }[];
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = (username: string, password: string) =>
  api.post('/api/v1/auth/login', { username, password });

export const logoutUser = () => api.post('/api/v1/auth/logout');

export const getCurrentUser = () => api.get('/api/v1/auth/me');

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboardStats = () => api.get('/api/v1/dashboard/stats');

// ─── Patients ────────────────────────────────────────────────────────────────

export const getPatients = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Patient>>('/api/v1/patients', { params });

export const getPatient = (id: number | string) =>
  api.get<Patient>(`/api/v1/patients/${id}`);

export const createPatient = (data: Record<string, unknown>) =>
  api.post<Patient>('/api/v1/patients', data);

export const updatePatient = (id: number | string, data: Record<string, unknown>) =>
  api.put<Patient>(`/api/v1/patients/${id}`, data);

export const deletePatient = (id: number | string) =>
  api.delete(`/api/v1/patients/${id}`);

// ─── Vaccinations ────────────────────────────────────────────────────────────

export const getVaccines = () => api.get<Vaccine[]>('/api/v1/vaccines/catalog');

export const getVaccinationRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<VaccinationRecord>>('/api/v1/vaccines/records', { params });

export const createVaccinationRecord = (data: Record<string, unknown>) =>
  api.post<VaccinationRecord>('/api/v1/vaccines/records', data);

export const updateVaccinationRecord = (
  id: number | string,
  data: Record<string, unknown>,
) => api.put<VaccinationRecord>(`/api/v1/vaccines/records/${id}`, data);

// ─── Healthcare visits ──────────────────────────────────────────────────────

export const getHealthcareVisits = (params?: Record<string, unknown>) =>
  api.get('/api/v1/healthcare/visits', { params });

export const createHealthcareVisit = (data: Record<string, unknown>) =>
  api.post('/api/v1/healthcare/visits', data);

// ─── Disease records ─────────────────────────────────────────────────────────

export const getDiseaseCategories = () =>
  api.get('/api/v1/diseases/categories');

export const getDiseaseRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<DiseaseRecord>>('/api/v1/diseases/records', { params });

export const createDiseaseRecord = (data: Record<string, unknown>) =>
  api.post<DiseaseRecord>('/api/v1/diseases/records', data);

// ─── Follow-ups ──────────────────────────────────────────────────────────────

export const getFollowups = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Followup>>('/api/v1/followups', { params });

export const createFollowup = (data: Record<string, unknown>) =>
  api.post<Followup>('/api/v1/followups', data);

export const updateFollowup = (
  id: number | string,
  data: Record<string, unknown>,
) => api.put<Followup>(`/api/v1/followups/${id}`, data);

// ─── Reports ─────────────────────────────────────────────────────────────────

export const getReportsSummary = (params?: Record<string, unknown>) =>
  api.get<ReportSummary>('/api/v1/reports/summary', { params });

export const exportReportCSV = (params?: Record<string, unknown>) =>
  api.get('/api/v1/reports/export', { params, responseType: 'blob' });

// ─── Audit logs ──────────────────────────────────────────────────────────────

export const getAuditLogs = (params?: Record<string, unknown>) =>
  api.get('/api/v1/audit', { params });

// ─── Patient sub-resources ───────────────────────────────────────────────────

export const getPatientVaccinations = (patientId: number | string) =>
  api.get<VaccinationRecord[]>(`/api/v1/patients/${patientId}/vaccinations`);

export const getPatientDiseases = (patientId: number | string) =>
  api.get<DiseaseRecord[]>(`/api/v1/patients/${patientId}/diseases`);

export const getPatientFollowups = (patientId: number | string) =>
  api.get<Followup[]>(`/api/v1/patients/${patientId}/followups`);

export default api;
