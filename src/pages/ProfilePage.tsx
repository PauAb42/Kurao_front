import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, MapPin, Save, Loader2, 
  CheckCircle, Briefcase, Hash, Edit2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateProfile } from '../services/api';

/* ─────────────────────────────────────────────
   PALETA Y TIPOGRAFÍA (Estilo Dashboard)
───────────────────────────────────────────── */
const STYLES = `
  :root {
    --navy:   #0B1F3A;
    --navy2:  #132845;
    --blue:   #1047A9;
    --blue-l: #3D6FC7;
    --mint:   #00C9A7;
    --mist:   #EEF3FA;
    --line:   #DDE6F0;
    --white:  #FFFFFF;
    --text:   #0B1F3A;
    --sub:    #4E6B8C;
  }
  
  .pro-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  
  .pro-input {
    width: 100%;
    border-radius: 12px;
    border: 1.5px solid var(--line);
    padding: 14px 16px 14px 44px;
    font-size: 14px;
    color: var(--text);
    font-weight: 500;
    background: #FAFBFD;
    transition: all .2s ease;
    outline: none;
  }
  
  .pro-input:focus { 
    border-color: var(--blue) !important; 
    box-shadow: 0 0 0 3px rgba(16,71,169,.1); 
    background: var(--white);
  }

  /* ESTILO PARA INPUTS BLOQUEADOS */
  .pro-input:disabled {
    background: var(--mist);
    color: var(--sub);
    cursor: not-allowed;
    border-color: transparent;
  }
  
  .pro-card { 
    transition: box-shadow .2s ease, transform .2s ease; 
    background: var(--white);
    border-radius: 20px;
    border: 1.5px solid var(--line);
  }
  
  .pro-save-btn { transition: transform .15s, box-shadow .15s; }
  .pro-save-btn:hover:not(:disabled) { 
    transform: translateY(-2px); 
    box-shadow: 0 8px 24px rgba(16,71,169,.25) !important; 
  }

  /* RESPONSIVE DESIGN */
  .pro-main-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
  }
  .pro-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 900px) {
    .pro-main-grid { grid-template-columns: 1fr; }
    .pro-form-grid { grid-template-columns: 1fr; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('pro-styles-v3')) {
  const el = document.createElement('style');
  el.id = 'pro-styles-v3'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────
   HELPERS & COMPONENTES
───────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.6px' }}>
      {label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const ProfilePage = () => {
  const { user } = useAuth() || { user: { name: 'Admin Kurao', email: 'admin@kurao.com', role: 'admin', id: '1' } };
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '555-0123',
    address: user?.address || 'Ciudad de México, México',
  });
  
  // NUEVO: Estado para controlar si estamos en modo edición
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // NUEVO: Función para cancelar la edición y restaurar los datos
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '555-0123',
      address: user?.address || 'Ciudad de México, México',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const updatedUser = await updateProfile(user.id, formData);
      const savedUser = JSON.parse(localStorage.getItem('kurao_user') || '{}');
      const newUser = { ...savedUser, ...updatedUser };
      localStorage.setItem('kurao_user', JSON.stringify(newUser));
      
      setSuccess(true);
      setIsEditing(false); // NUEVO: Bloquear de nuevo el formulario tras guardar
      setTimeout(() => setSuccess(false), 3500);
    } catch (error) {
      console.error("Error updating profile", error);
      alert("Hubo un error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = { admin: 'Administración', doctor: 'Cuerpo Médico', patient: 'Paciente', reception: 'Recepción' };
    return roles[role] || 'Usuario';
  };

  return (
    <div className="pro-root" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '16px' }}>
      
      {/* ── HEADER TIPO DASHBOARD ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, ease: [.22,1,.36,1] }}
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1A3A6B 100%)',
          borderRadius: 20, padding: '32px', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'absolute', right:60, bottom:-60, width:200, height:200, borderRadius:'50%', background:'rgba(0,201,167,.07)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 30, color: 'var(--white)', fontWeight: 700, lineHeight: 1.2, margin: '0 0 6px' }}>
            Mi Perfil
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', fontWeight: 500, margin: 0 }}>
            Configuración de cuenta y datos de contacto
          </p>
        </div>
      </motion.div>

      <div className="pro-main-grid">
        
        {/* ── COLUMNA IZQUIERDA: RESUMEN DE USUARIO ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <div className="pro-card" style={{ padding: '32px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ 
              width: 100, height: 100, margin: '0 auto 20px', borderRadius: 24, 
              background: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 36, fontWeight: 800, color: 'var(--blue)', position: 'relative'
            }}>
              {user?.name?.charAt(0) || 'U'}
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--mint)', border: '4px solid var(--white)' }} />
            </div>
            
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: '0 0 8px' }}>{user?.name}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--mist)', color: 'var(--blue)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, margin: '0 auto 32px' }}>
              <Briefcase size={14} /> {getRoleLabel(user?.role)}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 'auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FAFBFD', color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                  <Mail size={16} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', margin: 0 }}>Correo Electrónico</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FAFBFD', color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                  <Hash size={16} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', margin: 0 }}>ID de Sistema</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: '2px 0 0' }}>{user?.id}</p>
                </div>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── COLUMNA DERECHA: FORMULARIO ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
          <div className="pro-card" style={{ padding: '32px 36px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 20, borderBottom: '1.5px solid var(--line)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--mist)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Datos Generales</h3>
                <p style={{ fontSize: 13, color: 'var(--sub)', margin: '4px 0 0' }}>Actualiza tu información de contacto</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              
              <div className="pro-form-grid" style={{ marginBottom: 24 }}>
                <Field label="Nombre Completo" required>
                  <User style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--sub)' }} size={18} />
                  <input
                    className="pro-input" type="text"
                    disabled={!isEditing}
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Field>
                <Field label="Correo Electrónico" required>
                  <Mail style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--sub)' }} size={18} />
                  <input
                    className="pro-input" type="email"
                    disabled={!isEditing}
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </Field>
              </div>

              <div className="pro-form-grid" style={{ marginBottom: 40 }}>
                <Field label="Teléfono Fijo / Celular" required>
                  <Phone style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--sub)' }} size={18} />
                  <input
                    className="pro-input" type="tel"
                    disabled={!isEditing}
                    value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Field>
                <Field label="Dirección de Residencia" required>
                  <MapPin style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--sub)' }} size={18} />
                  <input
                    className="pro-input" type="text"
                    disabled={!isEditing}
                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Field>
              </div>

              {/* Footer del Formulario */}
              <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                
                <div style={{ flex: 1, minHeight: 40, display: 'flex', alignItems: 'center' }}>
                  <AnimatePresence>
                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', background: '#D1FAE5', padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}
                      >
                        <CheckCircle size={18} /> ¡Cambios guardados con éxito!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* NUEVO: Renderizado condicional de los botones basado en isEditing */}
                {!isEditing ? (
                  <button
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="pro-save-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, 
                      background: 'var(--blue)', border: 'none', 
                      borderRadius: 14, padding: '14px 32px', color: 'var(--white)', fontSize: 14, 
                      fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16,71,169,.26)'
                    }}
                  >
                    <Edit2 size={18} /> Editar Perfil
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button" 
                      onClick={handleCancel}
                      disabled={loading}
                      className="pro-save-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, 
                        background: 'transparent', border: '1.5px solid var(--line)', 
                        borderRadius: 14, padding: '13px 24px', color: 'var(--sub)', fontSize: 14, 
                        fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                      }}
                    >
                      <X size={18} /> Cancelar
                    </button>
                    
                    <button
                      type="submit" 
                      disabled={loading} 
                      className="pro-save-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, 
                        background: 'var(--blue)', border: 'none', 
                        borderRadius: 14, padding: '14px 32px', color: 'var(--white)', fontSize: 14, 
                        fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(16,71,169,.26)', opacity: loading ? 0.7 : 1
                      }}
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>

            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ProfilePage;