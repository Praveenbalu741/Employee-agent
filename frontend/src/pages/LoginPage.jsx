/**
 * pages/LoginPage.jsx — Split-screen login with employee/manager toggle
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ConstellationBackground from '../components/ConstellationBackground';
import toast from 'react-hot-toast';

const WaveLogoFull = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="21" stroke="#F4A261" strokeWidth="1.5" opacity="0.3"/>
    <path d="M14 22 Q18 14 22 22 Q26 30 30 22" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M10 22 Q15.5 10 22 22 Q28.5 34 34 22" stroke="#2EC4B6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <circle cx="22" cy="22" r="3" fill="#F4A261"/>
  </svg>
);

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 font-body mb-1.5">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="input-field"
      aria-required={required}
    />
  </div>
);

const LoginPage = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { login, register } = useAuth();

  const [tab, setTab]         = useState(searchParams.get('role') === 'manager' ? 'manager' : 'employee');
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [backendOk, setBackendOk] = useState(null); // null=checking, true=ok, false=down

  // ─── Ping backend health on mount ──────────────────────────────────────────
  useEffect(() => {
    fetch('/api/health', { signal: AbortSignal.timeout(4000) })
      .then((r) => setBackendOk(r.ok))
      .catch(() => setBackendOk(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;             // Guard against double-submit
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else {
        user = await register(form.name, form.email, form.password, tab);
      }
      toast.success(`Welcome${user.name ? ', ' + user.name : ''}! 🎉`);
      navigate(user.role === 'manager' ? '/dashboard' : '/chat');
    } catch (err) {
      // Distinguish network errors (backend down) from API errors (bad credentials)
      const isNetworkError = !err.response;
      const message = isNetworkError
        ? '⚠️ Cannot connect to server. Is the backend running?'
        : err.response?.data?.message || 'Invalid credentials. Please try again.';

      // Use a fixed toast ID to prevent stacking duplicate errors
      toast.error(message, { id: 'login-error', duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F1420' }}>
      {/* ─── LEFT: Constellation panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <ConstellationBackground />
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <WaveLogoFull />
          </div>
          <h1 className="font-heading font-bold text-5xl text-slate-100 mb-4 leading-tight">
            Echo<span className="text-gradient-amber">Agent</span>
          </h1>
          <p className="text-slate-400 font-body text-lg max-w-xs mx-auto leading-relaxed">
            Where every voice shapes a better workplace.
          </p>

          {/* Animated feature pills */}
          <div className="flex flex-col gap-3 mt-10 items-start text-left">
            {[
              { icon: '🔐', text: 'End-to-end anonymity controls' },
              { icon: '🧠', text: 'Claude AI sentiment analysis' },
              { icon: '📈', text: 'Real-time dashboard insights' },
            ].map(({ icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-2xl"
              >
                <span>{icon}</span>
                <span className="text-slate-300 text-sm font-body">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Auth form ─────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <WaveLogoFull />
            <span className="font-heading font-bold text-xl text-gradient-amber">EchoAgent</span>
          </div>

          {/* Backend status banner */}
          {backendOk === false && (
            <div className="mb-5 p-3 rounded-xl border border-amber-400/30 bg-amber-400/10 flex items-start gap-2.5" role="alert">
              <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-amber-300 text-sm font-heading font-semibold">Backend Offline</p>
                <p className="text-amber-400/80 text-xs font-body mt-0.5">
                  The API server is not reachable. Start the backend with{' '}
                  <code className="bg-navy-900 px-1 rounded text-amber-300">npm run dev</code>{' '}
                  from the project root.
                </p>
              </div>
            </div>
          )}

          {/* Role toggle */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl mb-8" role="tablist" aria-label="User type">
            {['employee', 'manager'].map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={tab === r}
                onClick={() => setTab(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-heading font-semibold capitalize transition-all duration-200 ${
                  tab === r
                    ? 'bg-amber-400 text-navy-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'employee' ? '👤 Employee' : '📊 Manager / HR'}
              </button>
            ))}
          </div>

          <h2 className="font-heading font-bold text-3xl text-slate-100 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-400 font-body text-sm mb-8">
            {mode === 'login'
              ? `Sign in as ${tab}`
              : `Register as ${tab}`}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <InputField
                    label="Full Name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              label="Email Address"
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              required
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-amber w-full py-3.5 text-base mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-sm font-body mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-slate-500 text-xs font-body mt-4">
            <Link to="/" className="hover:text-slate-400 transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
