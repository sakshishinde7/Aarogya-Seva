import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getPatient, createPatient, updatePatient } from '../api/client';

const patientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(200, 'Name is too long'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(['Male', 'Female', 'Other'] as const),
  village: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  contact_number: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_contact: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [serverError, setServerError] = useState('');
  const [loadingPatient, setLoadingPatient] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      sex: 'Male',
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      setLoadingPatient(true);
      getPatient(id)
        .then((res) => {
          const p = res.data;
          reset({
            full_name: p.full_name,
            date_of_birth: p.date_of_birth?.split('T')[0] ?? '',
            sex: p.sex,
            village: p.village ?? '',
            district: p.district ?? '',
            state: p.state ?? '',
            contact_number: p.contact_number ?? '',
            guardian_name: p.guardian_name ?? '',
            guardian_contact: p.guardian_contact ?? '',
            notes: p.notes ?? '',
          });
        })
        .catch(() => setServerError('Failed to load patient data.'))
        .finally(() => setLoadingPatient(false));
    }
  }, [id, user, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setServerError('');
    try {
      if (isEditing && id) {
        await updatePatient(id, data);
      } else {
        await createPatient(data as PatientFormData & { full_name: string; date_of_birth: string; sex: 'Male' | 'Female' | 'Other' });
      }
      navigate('/patients');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'An error occurred. Please try again.';
      setServerError(message);
    }
  };

  if (authLoading || loadingPatient) {
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
          to="/patients"
          className="p-2 rounded-lg hover:bg-mint-light text-secondary-text hover:text-primary-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary-text">
            {isEditing ? 'Edit Patient' : 'Register New Patient'}
          </h1>
          <p className="text-secondary-text text-sm mt-0.5">
            {isEditing ? 'Update patient information' : 'Fill in the details to register a new patient'}
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
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-primary-text mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="full_name"
            {...register('full_name')}
            className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
              errors.full_name ? 'border-red-400' : 'border-border-subtle'
            }`}
            placeholder="Enter patient's full name"
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
          )}
        </div>

        {/* DOB & Sex row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-primary-text mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              id="date_of_birth"
              type="date"
              {...register('date_of_birth')}
              className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
                errors.date_of_birth ? 'border-red-400' : 'border-border-subtle'
              }`}
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-primary-text mb-1.5">
              Sex <span className="text-red-500">*</span>
            </label>
            <select
              id="sex"
              {...register('sex')}
              className={`w-full px-3 py-2.5 border rounded-lg text-primary-text bg-white focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors ${
                errors.sex ? 'border-red-400' : 'border-border-subtle'
              }`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.sex && (
              <p className="text-red-500 text-xs mt-1">{errors.sex.message}</p>
            )}
          </div>
        </div>

        {/* Address row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="village" className="block text-sm font-medium text-primary-text mb-1.5">
              Village
            </label>
            <input
              id="village"
              {...register('village')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
              placeholder="Village"
            />
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-primary-text mb-1.5">
              District
            </label>
            <input
              id="district"
              {...register('district')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
              placeholder="District"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-primary-text mb-1.5">
              State
            </label>
            <input
              id="state"
              {...register('state')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
              placeholder="State"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label htmlFor="contact_number" className="block text-sm font-medium text-primary-text mb-1.5">
            Contact Number
          </label>
          <input
            id="contact_number"
            {...register('contact_number')}
            className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        {/* Guardian */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="guardian_name" className="block text-sm font-medium text-primary-text mb-1.5">
              Guardian Name
            </label>
            <input
              id="guardian_name"
              {...register('guardian_name')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
              placeholder="Guardian's full name"
            />
          </div>
          <div>
            <label htmlFor="guardian_contact" className="block text-sm font-medium text-primary-text mb-1.5">
              Guardian Contact
            </label>
            <input
              id="guardian_contact"
              {...register('guardian_contact')}
              className="w-full px-3 py-2.5 border border-border-subtle rounded-lg text-primary-text bg-white placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-sage-dark/30 focus:border-sage-dark transition-colors"
              placeholder="Guardian's contact number"
            />
          </div>
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
            to="/patients"
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
            {isEditing ? 'Update Patient' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
