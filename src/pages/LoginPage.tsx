import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import AccessibilityButton from '../components/accessibility/AccessibilityButton';

const colors = {
  primaryBlue: '#1047A9', 
  surfaceWhite: '#FFFFFF', 
  textDark: '#1A1A1A',     
  textMuted: '#8DAAC8',   
  inputBorder: '#E1E1E1',  
  dangerRed: '#EF4444'     
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      // Mensaje de error profesional y seguro
      setError(err.message || 'El correo electrónico o la contraseña son incorrectos. Por favor, verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/fondo1.png')" }} 
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl shadow-blue-900/20 border border-blue-50"
        style={{ backgroundColor: colors.surfaceWhite }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div 
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: colors.primaryBlue }}
          >
            <Activity size={40} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: colors.primaryBlue }}>Kurao</h1>
          <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>Sistema de Gestión Hospitalaria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm border border-red-100" style={{ color: colors.dangerRed }}>
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: colors.textDark }}>Correo electrónico *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@kurao.com"
              className="w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-100"
              style={{ 
                borderColor: colors.inputBorder,
                backgroundColor: colors.surfaceWhite,
                color: colors.textDark
              }}
              onFocus={(e) => e.target.style.borderColor = colors.primaryBlue}
              onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: colors.textDark }}>Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border px-4 py-3 pr-12 outline-none transition-all focus:ring-2 focus:ring-blue-100"
                style={{ 
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.surfaceWhite,
                  color: colors.textDark
                }}
                onFocus={(e) => e.target.style.borderColor = colors.primaryBlue}
                onBlur={(e) => e.target.style.borderColor = colors.inputBorder}
              />
              {/* 6. Botón para alternar la visibilidad */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-70 focus:outline-none"
                style={{ color: colors.textMuted }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-70"
            style={{ backgroundColor: colors.primaryBlue }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0A337E'}
            onMouseLeave={(e) => e.target.style.backgroundColor = colors.primaryBlue}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs" style={{ color: colors.textMuted }}>
          <p>© 2026 Kurao Health Systems. Todos los derechos reservados.</p>
        </div>
      </motion.div>

      <div className="relative z-20">
        <AccessibilityButton 
          isOpen={isAccessibilityOpen} 
          onToggle={() => setIsAccessibilityOpen(!isAccessibilityOpen)} 
        />
      </div>
    </div>
  );
};

export default LoginPage;