import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Loader2, Mail, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email/Pass, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unable to reach the authentication service. Please try again later.');
      }

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unable to reach the authentication service. Please try again later.');
      }

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
      
      // Store minimal auth state if needed, or rely solely on HttpOnly cookie
      localStorage.setItem('admin_auth', 'true');
      if (data.data && data.data.admin) {
        localStorage.setItem('admin_data', JSON.stringify(data.data.admin));
      }
      navigate('/control/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="h-12 w-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 shadow-xl shadow-slate-900/10">
          <ShieldAlert className="text-white" size={24} />
        </div>
        <h2 className="mt-2 text-center text-3xl font-heading font-black tracking-tight text-slate-900 uppercase">
          Admin Control
        </h2>
        <p className="mt-2 text-center text-sm font-mono tracking-widest text-slate-500 uppercase">
          Brainstorm Secure Portal
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-2xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md flex items-start gap-3">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRequestOTP}>
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase font-bold text-slate-700">Email Address</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-slate-400" size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors outline-none bg-slate-50 focus:bg-white"
                    placeholder="admin@brainstorm.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-widest uppercase font-bold text-slate-700">Password</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-slate-400" size={18} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors outline-none bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <Link to="/control/forgot-password" className="text-xs font-mono tracking-widest uppercase font-bold text-brand-primary hover:text-brand-secondary transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-lg shadow-brand-primary/20 text-sm font-mono tracking-widest uppercase font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Request Access'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div className="text-center mb-8">
                 <p className="text-sm text-slate-600 mb-2">We've sent a temporary access code to</p>
                 <p className="font-mono text-xs tracking-widest font-bold text-slate-900 bg-slate-100 py-1 px-3 rounded-full inline-block">{formData.email}</p>
              </div>
              
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase font-bold text-slate-700 text-center mb-4">Enter 6-Digit OTP</label>
                <div className="relative max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="text-slate-400" size={18} />
                  </div>
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    autoComplete="off"
                    className="block w-full pl-10 pr-3 py-4 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-center tracking-[0.5em] font-mono text-xl outline-none bg-slate-50 focus:bg-white transition-colors"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-lg shadow-slate-900/20 text-sm font-mono tracking-widest uppercase font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
              </button>
              
              <div className="text-center mt-6">
                <button type="button" onClick={() => setStep(1)} className="text-xs font-mono tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors">
                  ← Back to Email
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
