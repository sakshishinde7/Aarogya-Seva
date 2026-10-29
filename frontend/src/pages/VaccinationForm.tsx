import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createVaccinationRecord, getVaccines, type Vaccine } from '../api/client';

const vaccinationSchema = z.object({
  patient_id: z.coerce.number().min(1, 'Patient ID is required'),
  vaccine_id: z.coerce.number().min(1, 'Vaccine is required'),
  dose_number: z.coerce.number().min(1, 'Dose number must be at least 1'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  administration_date: z.string().optional(),
  status: z.enum(['Scheduled', 'Completed', 'Overdue', 'Cancelled'] as const),
  notes: z.string().optional(),
});

type VaccinationFormData = z.infer<typeof vaccinationSchema>;

export default function VaccinationForm() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [serverError, setServerError] = useState('');
  const [loadingVaccines, setLoadingVaccines] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      patient_id: Number(searchParams.get('patient_id')) || undefined,
      dose_number: 1,
      status: 'Scheduled',
      scheduled_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    getVaccines()
      .then((res) => setVaccines(res.data))
      .catch(() => {})
      .finally(() => setLoadingVaccines(false));
  }, []);

  const onSubmit = async (data: VaccinationFormData) => {
    setServerError('');
    try {
      await createVaccinationRecord({
        ...data,
        administration_date: data.administration_date || null,
      });
      navigate('/vaccinations');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'An error occurred. Please try again.';
      setServerError(message);
    }
  };

  if (authLoading || loadingVaccines) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/vaccinations"
          className="p-2 rounded-lg hover:bg-mint-light text-secondary-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary-text">Record Vaccination</h1>
          <p className="text-secondary-text text-sm mt-0.5">
            Record a new vaccination for a patient
          </p>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="flex items-start gap-2 bg-blush border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-border-subtle shadow-sm p-6 space-y-5">
        {/* Patient ID */}
        <div>
          <label htmlFor="patient_id" className="block text-sm font-medium text-primary-text mb-1.5">
            Patient ID <span className="text-red-500">*</span>
          </label>
          <input
            id="patient_id"
            type="number"
            {...register('patient_id')}
            className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
              errors.patient_id ? 'border-red-400' : 'border-border-subtle'
            }`}
            placeholder="Enter patient ID"
          />
          {errors.patient_id?.message && (
            <p className="text-red-500 text-xs mt-1">{String(errors.patient_id.message)}</p>
          )}
        </div>

        {/* Vaccine & Dose row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vaccine_id" className="block text-sm font-medium text-primary-text mb-1.5">
              Vaccine <span className="text-red-500">*</span>
            </label>
            <select
              id="vaccine_id"
              {...register('vaccine_id')}
              className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
                errors.vaccine_id ? 'border-red-400' : 'border-border-subtle'
              }`}
            >
              <option value="">Select vaccine</option>
              {vaccines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            {errors.vaccine_id?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.vaccine_id.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="dose_number" className="block text-sm font-medium text-primary-text mb-1.5">
              Dose Number <span className="text-red-500">*</span>
            </label>
            <input
              id="dose_number"
              type="number"
              min={1}
              {...register('dose_number')}
              className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
                errors.dose_number ? 'border-red-400' : 'border-border-subtle'
              }`}
            />
            {errors.dose_number?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.dose_number.message)}</p>
            )}
          </div>
        </div>

        {/* Dates row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-primary-text mb-1.5">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <input
              id="scheduled_date"
              type="date"
              {...register('scheduled_date')}
              className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
                errors.scheduled_date ? 'border-red-400' : 'border-border-subtle'
              }`}
            />
            {errors.scheduled_date?.message && (
              <p className="text-red-500 text-xs mt-1">{String(errors.scheduled_date.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="administration_date" className="block text-sm font-medium text-primary-text mb-1.5">
              Administration Date
            </label>
            <input
              id="administration_date"
              type="date"
              {...register('administration_date')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-primary-text mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register('status')}
            className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
              errors.status ? 'border-red-400' : 'border-border-subtle'
            }`}
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.status?.message && (
            <p className="text-red-500 text-xs mt-1">{String(errors.status.message)}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary-text mb-1.5">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register('notes')}
            className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors resize-none"
            placeholder="Any additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/vaccinations"
            className="px-4 py-2.5 border border-border-subtle rounded-lg text-secondary-text hover:text-primary-text hover:bg-mint-light font-medium text-sm transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-sage-dark hover:bg-sage text-white hover:text-primary-text font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}
