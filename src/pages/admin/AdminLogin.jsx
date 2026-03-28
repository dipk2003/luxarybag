import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await login(formData);
    setSubmitting(false);

    if (!error) {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4efe8] p-4">
      <div className="w-full max-w-md rounded-[36px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_100px_rgba(28,25,23,0.12)] md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-950 text-white">
          <LockKeyhole className="w-7 h-7" />
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-stone-400">Admin access</p>
          <h1 className="mt-3 font-display text-4xl text-stone-950">Sign in with Supabase</h1>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            Use the admin account you created in Supabase Auth and mapped to an admin role.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="relative block">
            <Mail className="absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              placeholder="Admin email"
              className="w-full rounded-2xl border border-stone-200 bg-[#faf7f3] py-3 pl-11 pr-4 outline-none transition focus:border-stone-900"
            />
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(event) =>
              setFormData({ ...formData, password: event.target.value })
            }
            placeholder="Password"
            className="w-full rounded-2xl border border-stone-200 bg-[#faf7f3] px-4 py-3 outline-none transition focus:border-stone-900"
          />
          <Button
            type="submit"
            disabled={submitting}
            className="h-12 w-full rounded-full bg-stone-950 text-white hover:bg-stone-800"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
