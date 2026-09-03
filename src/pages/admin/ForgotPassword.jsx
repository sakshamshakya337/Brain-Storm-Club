import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Loader2, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unable to contact the password recovery service. Please try again later.');
      }

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Request failed');
      
      setMessage(data.message);
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
          Recover Access
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

          {message ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-6">{message}</p>
              <Link to="/control" className="text-xs font-mono tracking-widest uppercase font-bold text-brand-primary hover:text-brand-secondary transition-colors">
                ← Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <p className="text-sm text-slate-600 mb-6 text-center">
                Enter your administrator email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase font-bold text-slate-700">Email Address</label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-slate-400" size={18} />
                  </div>
                  <input
                    type="email"
                    name="admin_recovery_email"
                    autoComplete="off"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors outline-none bg-slate-50 focus:bg-white"
                    placeholder="admin@brainstorm.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-lg shadow-brand-primary/20 text-sm font-mono tracking-widest uppercase font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Recovery Link'}
              </button>
              
              <div className="text-center mt-6">
                <Link to="/control" className="text-xs font-mono tracking-widest uppercase text-slate-500 hover:text-slate-900 transition-colors">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
