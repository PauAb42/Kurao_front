import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AccessibilityButton from '../components/accessibility/AccessibilityButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-8 shadow-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg">
            <Activity size={40} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Kurao</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">Sistema de Gestión Hospitalaria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-[var(--color-danger)] border border-red-100">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text)]">Correo electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@kurao.com"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text)]">Contraseña *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          <p>© 2026 Kurao Health Systems. Todos los derechos reservados.</p>
        </div>
      </motion.div>

      <AccessibilityButton 
        isOpen={isAccessibilityOpen} 
        onToggle={() => setIsAccessibilityOpen(!isAccessibilityOpen)} 
      />
    </div>
  );
};

export default LoginPage;
