import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDoctorById, getAppointments } from '../services/api';
import { 
  ChevronLeft, Phone, Mail, Award, Clock,
  Calendar, MapPin, FileText, Stethoscope,
  Award as Medal, Briefcase, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ─────────────────────────────────────────
   FONTS & STYLES
───────────────────────────────────────── */
const STYLES = `
  .det-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .det-tab { transition: all .18s; cursor: pointer; border: none; background: none; white-space: nowrap; flex-shrink: 0; }
  .det-tab:hover { color: #1047A9 !important; }
  .det-apt-row { transition: background .13s; border-bottom: 1px solid #EEF3FA; }
  .det-apt-row:hover { background: #F4F7FB; }
  .det-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .det-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
  
  @keyframes shim { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .skeleton-box { animation: shim 1.5s infinite; background: #EEF3FA; border-radius: 12px; }

  @media (max-width: 768px) {
    .det-header-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('det-styles-v5')) {
  const el = document.createElement('style');
  el.id = 'det-styles-v5'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────
   HELPERS & SUBCOMPONENTS
───────────────────────────────────────── */
const SectionDivider = ({ label, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 8 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(16,71,169,.08)', color: '#1047A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {Icon && <Icon size={13} />}
    </div>
    <span style={{ fontSize: 10, fontWeight: 800, color: '#1047A9', textTransform: 'uppercase', letterSpacing: '.8px', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: '#DDE6F0' }} />
  </div>
);

const StatusChip = ({ status }) => {
  const map = {
    Completada: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    Programada: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    Cancelada:  { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    Activo:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    Inactivo:   { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, val }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
    borderRadius: 12, background: '#FAFBFD', border: '1px solid #EEF3FA',
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF3FA', color: '#1047A9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} />
    </div>
    <div style={{ overflow: 'hidden' }}>
      <p style={{ fontSize: 9, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.4px', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0B1F3A', margin: 0, marginTop: 2 }}>{val || '—'}</p>
    </div>
  </div>
);

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  const { data: doctor, loading } = useApi(() => getDoctorById(id), [id]);
  const { data: appointments } = useApi(() => getAppointments({ doctorId: id }), [id]);

  if (loading || !doctor) return (
    <div className="det-root" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[100, 380].map((h, i) => (
        <div key={i} className="skeleton-box" style={{ height: h, width: '100%' }} />
      ))}
    </div>
  );

  // Formatear el horario desde los campos de la API
  const fullSchedule = doctor.horarioInicio && doctor.horarioFin 
    ? `${doctor.horarioInicio} - ${doctor.horarioFin} hrs`
    : '—';

  return (
    <div className="det-root" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to="/doctors" style={{
          width: 36, height: 36, borderRadius: 10, border: '1.5px solid #DDE6F0',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4E6B8C'
        }}>
          <ChevronLeft size={18} />
        </Link>
        <span style={{ fontSize: 13, color: '#4E6B8C' }}>
          <Link to="/doctors" style={{ color: '#4E6B8C', textDecoration: 'none', fontWeight: 600 }}>Médicos</Link>
          <span style={{ margin: '0 6px', color: '#DDE6F0' }}>/</span>
          <strong style={{ color: '#0B1F3A' }}>Dr. {doctor.nombre} {doctor.apellidos}</strong>
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #DDE6F0', overflow: 'hidden' }}>
        
        <div style={{ height: 6, background: 'linear-gradient(90deg,#1047A9,#3D6FC7)' }} />

        <div className="det-header-wrap" style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ 
              width: 68, height: 68, borderRadius: 18, background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff',
              boxShadow: '0 6px 22px rgba(16,71,169,.26)'
            }}>
              {(doctor.nombre || '').charAt(0)}{(doctor.apellidos || '').charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: 24, color: '#0B1F3A', margin: 0, fontWeight: 800 }}>Dr. {doctor.nombre} {doctor.apellidos}</h1>
              <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#1047A9', fontWeight: 700 }}>{doctor.especialidad}</span>
                <StatusChip status={doctor.estado} />
              </div>
            </div>
          </div>
        </div>

        <div className="det-scroll" style={{ display: 'flex', borderBottom: '1.5px solid #DDE6F0', padding: '0 28px', marginTop: 24, overflowX: 'auto' }}>
          {[
            { id: 'info', label: 'Información Profesional', icon: Award },
            { id: 'citas', label: 'Agenda de Citas', icon: Calendar }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 18px',
              borderBottom: activeTab === tab.id ? '2.5px solid #1047A9' : '2.5px solid transparent',
              color: activeTab === tab.id ? '#1047A9' : '#4E6B8C',
              fontSize: 13, fontWeight: 700, marginBottom: -1.5, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all .18s'
            }}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionDivider label="Datos de Ubicación y Turno" icon={MapPin} />
                  <InfoRow icon={Briefcase} label="Consultorio" val={doctor.consultorio} />
                  <InfoRow icon={Clock} label="Horario de Atención" val={fullSchedule} />
                  
                  <div style={{ marginTop: 10 }}>
                    <SectionDivider label="Contacto Directo" icon={Phone} />
                    <InfoRow icon={Mail} label="Correo Institucional" val={doctor.email} />
                    <InfoRow icon={Phone} label="Teléfono de Oficina" val={doctor.telefono} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionDivider label="Certificaciones y Cédula" icon={ShieldCheck} />
                  <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 14, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Medal size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', margin: 0 }}>Cédula Profesional</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0, fontFamily: 'monospace' }}>{doctor.cedula}</p>
                    </div>
                  </div>

                  <SectionDivider label="Semblanza Médica" icon={FileText} />
                  <div style={{ background: '#F8FAFF', borderRadius: 12, padding: 16, border: '1px solid #DBEAFE' }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: '#1047A9', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Especialista en {doctor.especialidad}</p>
                    <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.6, margin: 0 }}>
                      {doctor.biografia || `El Dr. ${doctor.nombre} ${doctor.apellidos} es un especialista certificado en ${doctor.especialidad} con atención en el consultorio ${doctor.consultorio}.`}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="citas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
                <div style={{ overflowX: 'auto' }} className="det-scroll">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: '#FAFBFD', borderBottom: '1.5px solid #DDE6F0' }}>
                        {['Paciente', 'Fecha', 'Hora', 'Motivo', 'Estado'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(appointments || []).map((apt) => (
                        <tr key={apt.id} className="det-apt-row">
                          <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 700, color: '#0B1F3A' }}>{apt.paciente}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#4E6B8C' }}>{apt.fecha}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#4E6B8C' }}>{apt.hora}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#4E6B8C' }}>{apt.motivo}</td>
                          <td style={{ padding: '13px 14px' }}><StatusChip status={apt.estado} /></td>
                        </tr>
                      ))}
                      {(!appointments || appointments.length === 0) && (
                        <tr>
                          <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No hay citas registradas para este médico.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorDetailPage;