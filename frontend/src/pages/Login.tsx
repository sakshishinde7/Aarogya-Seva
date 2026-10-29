import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Loader2, HeartPulse, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || 'Invalid email or password. Please try again.';
      setError('root', { message });
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sage-dark" />
      </div>
    );
  }

  // Already logged in — effect above will redirect
  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-mint mb-4">
            <HeartPulse className="h-8 w-8 text-sage-dark" />
          </div>
          <h1 className="text-2xl font-bold text-primary-text">
            Welcome Back
          </h1>
          <p className="text-secondary-text mt-1 text-sm">
            Sign in to Aarogya Seva authorized staff portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border-subtle p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Root error */}
            {errors.root && (
              <div className="flex items-center gap-2 bg-blush text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-text mb-1.5"
              >
                Staff Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="e.g. worker@aarogyaseva.org"
                {...register('email')}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm placeholder:text-secondary-text/60
                  focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage
                  ${errors.email ? 'border-red-400' : 'border-border-subtle'}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-text mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password')}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm placeholder:text-secondary-text/60
                  focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage
                  ${errors.password ? 'border-red-400' : 'border-border-subtle'}`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-sage hover:bg-sage-dark
                text-white py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-sage/50 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Quick-Fill */}
          <div className="mt-6 pt-5 border-t border-border-subtle">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary-text mb-2 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Demo Accounts (Click to Fill)</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@aarogyaseva.org', 'Admin@Aarogya2026')}
                className="w-full text-left px-2.5 py-1.5 rounded bg-mint-light hover:bg-mint text-primary-text flex justify-between items-center transition-colors"
              >
                <span className="font-medium">Administrator</span>
                <span className="text-secondary-text">admin@aarogyaseva.org</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('worker@aarogyaseva.org', 'Worker@Aarogya2026')}
                className="w-full text-left px-2.5 py-1.5 rounded bg-mint-light hover:bg-mint text-primary-text flex justify-between items-center transition-colors"
              >
                <span className="font-medium">Healthcare Worker</span>
                <span className="text-secondary-text">worker@aarogyaseva.org</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('supervisor@aarogyaseva.org', 'Supervisor@Aarogya2026')}
                className="w-full text-left px-2.5 py-1.5 rounded bg-mint-light hover:bg-mint text-primary-text flex justify-between items-center transition-colors"
              >
                <span className="font-medium">Supervisor</span>
                <span className="text-secondary-text">supervisor@aarogyaseva.org</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
