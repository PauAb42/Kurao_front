import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  UserRound,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  ClipboardList,
  Heart,
  Activity as ActivityIcon,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  ChevronLeft,
  Pill,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────
   PALETA Y TIPOGRAFÍA
───────────────────────────────────────────── */
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';

if (typeof document !== 'undefined' && !document.getElementById('dash-fonts')) {
  const link = document.createElement('link');
  link.id = 'dash-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_LINK;
  document.head.appendChild(link);
}

const STYLES = `
  :root {
    --navy:   #0B1F3A;
    --navy2:  #132845;
    --blue:   #1047A9;
    --blue-l: #3D6FC7;
    --mint:   #00C9A7;
    --mint-l: #D1FAF3;
    --slate:  #4E6B8C;
    --mist:   #EEF3FA;
    --line:   #DDE6F0;
    --white:  #FFFFFF;
    --warn:   #F59E0B;
    --danger: #EF4444;
    --success:#10B981;
    --text:   #0B1F3A;
    --sub:    #4E6B8C;
  }
  .dash-root * { font-family: 'DM Sans', sans-serif; }

  /* stat card hover lift */
  .stat-card { transition: transform .2s ease, box-shadow .2s ease; }
  .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(11,31,58,.10); }

  /* quick-link hover */
  .quick-link { transition: all .18s ease; }
  .quick-link:hover { border-color: var(--blue) !important; background: var(--mist) !important; }
  .quick-link:hover .ql-icon { background: var(--blue) !important; color: var(--white) !important; }
  .quick-link:hover .ql-arrow { transform: translateX(4px); color: var(--blue) !important; }

  /* row hover */
  .tbl-row { transition: background .15s; }
  .tbl-row:hover { background: var(--mist); }

  /* pulse dot */
  @keyframes pulseDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: .5; transform: scale(1.4); }
  }
  .pulse-dot { animation: pulseDot 1.8s infinite; }

  /* skeleton shimmer */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, #e8eef5 25%, #f5f8fc 50%, #e8eef5 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 12px;
  }

  /* RESPONSIVE DESIGN */
  .dash-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  
  .dash-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 18px;
  }

  .dash-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 2.5fr) minmax(0, 1fr);
    gap: 20px;
  }

  .quick-links-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  @media (max-width: 1100px) {
    .dash-main-grid {
      grid-template-columns: 1fr;
    }
    .quick-links-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
  }

  @media (max-width: 768px) {
    .dash-root {
      padding-top: 72px !important; 
    }
    .dash-header {
      flex-direction: column;
      align-items: flex-start;
      padding: 24px 20px !important;
    }
    .dash-stat-grid {
      grid-template-columns: 1fr;
    }
    .table-container {
      padding: 0 !important;
    }
    th, td {
      padding: 12px 16px !important;
    }
    .quick-links-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('dash-styles')) {
  const s = document.createElement('style');
  s.id = 'dash-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════ */

const StatCard = ({ title, value, icon: Icon, trend, trendValue, accent = 'blue', delay = 0, subtitle }) => {
  const accents = {
    blue:    { bg: '#EEF3FA', color: '#1047A9', badge: '#DBEAFE' },
    mint:    { bg: '#D1FAF3', color: '#00A88D', badge: '#A7F3D0' },
    purple:  { bg: '#EDE9FE', color: '#7C3AED', badge: '#DDD6FE' },
    amber:   { bg: '#FEF3C7', color: '#D97706', badge: '#FDE68A' },
  };
  const a = accents[accent] || accents.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="stat-card"
      style={{
        background: '#fff',
        borderRadius: 18,
        border: '1.5px solid var(--line)',
        padding: '24px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 90, height: 90, borderRadius: '50%',
        background: a.bg, opacity: 0.6,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: a.bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: a.color, flexShrink: 0,
        }}>
          <Icon size={22} />
        </div>
        {trendValue && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3,
            background: trend === 'up' ? '#D1FAE5' : '#FEE2E2',
            color: trend === 'up' ? '#059669' : '#DC2626',
          }}>
            {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trendValue}
          </span>
        )}
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 4 }}>
        {title}
      </p>
      <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>{value}</h3>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--sub)', marginTop: 4 }}>{subtitle}</p>}
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Confirmada: { bg: '#D1FAE5', color: '#065F46' }, 
    Completada: { bg: '#E0F2FE', color: '#0369A1' }, 
    Pendiente:  { bg: '#FEF3C7', color: '#92400E' }, 
    Cancelada:  { bg: '#FEE2E2', color: '#991B1B' }, 
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 700,
      padding: '4px 12px', borderRadius: 20,
      whiteSpace: 'nowrap', display: 'inline-block'
    }}>
      {status}
    </span>
  );
};

// MODIFICACIÓN AQUI: Se agregó la propiedad `state` para pasar datos entre rutas
const QuickLink = ({ to, icon: Icon, label, accent = '#1047A9', onClick, state }) => {
  const content = (
    <div
      className="quick-link"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 14,
        border: '1.5px solid var(--line)', background: '#fff',
        cursor: 'pointer', textDecoration: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          className="ql-icon"
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--mist)', color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .18s',
          }}
        >
          <Icon size={18} />
        </div>
        <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{label}</span>
      </div>
      <ChevronRight size={16} className="ql-arrow" style={{ color: 'var(--sub)', transition: 'all .18s' }} />
    </div>
  );

  if (onClick) return <div onClick={onClick}>{content}</div>;
  // MODIFICACIÓN AQUI: Pasar el state al componente Link
  return <Link to={to} state={state} style={{ textDecoration: 'none' }}>{content}</Link>;
};

const SkeletonLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div className="shimmer" style={{ height: 34, width: 280, marginBottom: 10 }} />
        <div className="shimmer" style={{ height: 18, width: 200 }} />
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
      {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 140 }} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
      <div className="shimmer" style={{ height: 380 }} />
      <div className="shimmer" style={{ height: 380 }} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useApi(getDashboardStats);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  if (loading) return <div className="dash-root p-4"><SkeletonLoader /></div>;

  if (error) return (
    <div className="dash-root p-4" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh',
      background: '#fff', borderRadius: 20,
      border: '1.5px solid #FEE2E2', padding: 48, textAlign: 'center',
    }}>
      <div style={{ background: '#FEF2F2', borderRadius: '50%', padding: 20, marginBottom: 20 }}>
        <AlertCircle size={40} color="#EF4444" />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        Error de conexión
      </h3>
      <p style={{ color: 'var(--sub)', maxWidth: 360, marginBottom: 28, lineHeight: 1.6 }}>{error}</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'var(--blue)', color: '#fff', border: 'none',
          borderRadius: 12, padding: '12px 28px', fontWeight: 700,
          fontSize: 15, cursor: 'pointer',
        }}
      >
        Reintentar conexión
      </button>
    </div>
  );

  const stats = data || {
    totalPatients: 1248,
    appointmentsToday: 42,
    activeDoctors: 18,
    pendingAppointments: 12,
    nextAppointmentDate: '25 Mar 2026',
    totalConsultations: 12,
    activePrescriptions: 3,
    upcomingAppointments: [
      { id: 1, patient: 'Juan Pérez',    doctor: 'Dra. Elena García',    time: '09:00 AM', status: 'Confirmada' },
      { id: 2, patient: 'María García',  doctor: 'Dr. Ricardo Martínez', time: '10:30 AM', status: 'Pendiente'  },
      { id: 3, patient: 'Carlos López',  doctor: 'Dra. Elena García',    time: '11:15 AM', status: 'Confirmada' },
      { id: 4, patient: 'Ana Beltrán',   doctor: 'Dr. Roberto Sánchez',  time: '12:00 PM', status: 'Cancelada'  },
      { id: 5, patient: 'Luis Medrano',  doctor: 'Dr. Ricardo Martínez', time: '01:30 PM', status: 'Pendiente'  },
      { id: 6, patient: 'Sofía Castro',  doctor: 'Dra. Elena García',    time: '02:00 PM', status: 'Confirmada' },
      { id: 7, patient: 'Diego Herrera', doctor: 'Dr. Roberto Sánchez',  time: '03:15 PM', status: 'Confirmada' },
    ],
    patientHistory: [
      { id: 1, date: '10 Mar 2026', doctor: 'Dra. Elena García',    diag: 'Faringitis aguda',       status: 'Completada' },
      { id: 2, date: '15 Ene 2026', doctor: 'Dr. Ricardo Martínez', diag: 'Control Hipertensión',   status: 'Completada' },
      { id: 3, date: '02 Dic 2025', doctor: 'Dra. Elena García',    diag: 'Revisión general',       status: 'Completada' },
    ],
  };

  const isPatient  = user?.role === 'patient';
  const isDoctor   = user?.role === 'doctor';
  const isAdmin    = user?.role === 'admin';
  const isReception = user?.role === 'reception';

  const roleLabel = isAdmin ? 'Administración' : isDoctor ? 'Médico' : isPatient ? 'Paciente' : 'Recepción';
  const today = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const listToPaginate = isPatient ? (stats.patientHistory || []) : (stats.upcomingAppointments || []);
  const totalPages = Math.ceil(listToPaginate.length / ITEMS_PER_PAGE);
  const paginatedData = listToPaginate.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="dash-root" style={{ display: 'flex', flexDirection: 'column', gap: 28, padding: '16px' }}>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .45, ease: [.22,1,.36,1] }}
        className="dash-header"
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1A3A6B 100%)',
          borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position:'absolute', right:-40, top:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,.05)' }} />
        <div style={{ position:'absolute', right:60, bottom:-60, width:200, height:200, borderRadius:'50%', background:'rgba(0,201,167,.07)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500, marginBottom: 4, textTransform: 'capitalize' }}>
            {today}
          </p>
          <h1 style={{ fontSize: 30, color: '#fff', fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
            Bienvenido, {user?.name || 'Usuario'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(0,201,167,.18)', color: '#00C9A7',
              fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
              border: '1px solid rgba(0,201,167,.35)',
            }}>
              {roleLabel}
            </span>
            <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
              · Panel de control del sistema
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, marginTop: '10px' }}>
          {isPatient && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.1)', borderRadius: 12,
              padding: '10px 16px', border: '1px solid rgba(255,255,255,.15)',
            }}>
              <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C9A7' }} />
              <Heart size={14} color="#00C9A7" />
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Salud: Estable</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="dash-stat-grid">
        {isPatient ? (
          <>
            <StatCard title="Próxima Cita"         value={stats.nextAppointmentDate}  icon={Calendar}      accent="blue"   delay={.1} subtitle="Cita programada" />
            <StatCard title="Consultas Realizadas" value={stats.totalConsultations}   icon={ClipboardList} accent="mint"   delay={.2} subtitle="Historial médico" />
            <StatCard title="Recetas Activas"      value={stats.activePrescriptions}  icon={Pill}          accent="purple" delay={.3} subtitle="En tratamiento" />
          </>
        ) : (
          <>
            <StatCard title={isDoctor ? 'Mis Pacientes' : 'Total Pacientes'} value={isDoctor ? '85' : stats.totalPatients} icon={Users} accent="blue" trend="up" trendValue="+12%" delay={.1} subtitle="Registros activos" />
            <StatCard title="Citas Hoy" value={isDoctor ? '8' : stats.appointmentsToday} icon={Calendar} accent="mint" trend="up" trendValue="+5%" delay={.2} subtitle={`${new Date().toLocaleDateString('es-MX',{day:'numeric',month:'short'})}`} />
            <StatCard title="Médicos Activos" value={stats.activeDoctors} icon={Stethoscope} accent="purple" trend="down" trendValue="-2%" delay={.3} subtitle="En servicio" />
            <StatCard title="Citas Pendientes" value={stats.pendingAppointments} icon={Clock} accent="amber" trend="up" trendValue="+8%" delay={.4} subtitle="Requieren atención" />
          </>
        )}
      </div>

      {/* ── MAIN GRID: table + quick links ── */}
      <div className="dash-main-grid">

        {/* TABLE CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: .25, duration: .45, ease: [.22,1,.36,1] }}
          style={{
            background: '#fff', borderRadius: 20,
            border: '1.5px solid var(--line)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', width: '100%'
          }}
        >
          {/* table header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 18px', borderBottom: '1.5px solid var(--line)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'var(--mist)', borderRadius: 10, padding: 8, color: 'var(--blue)' }}>
                {isPatient ? <FileText size={18} /> : <Calendar size={18} />}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                {isPatient ? 'Mis últimas consultas' : 'Citas del día'}
              </h3>
            </div>
            <Link
              to={isPatient ? '/history' : '/appointments'}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 13, fontWeight: 700, color: 'var(--blue)', textDecoration: 'none',
              }}
            >
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>

          {/* table */}
          <div className="table-container" style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--line)' }}>
                  {[
                    isPatient ? 'Fecha' : 'Paciente',
                    'Médico',
                    isPatient ? 'Diagnóstico' : 'Hora',
                    'Estado',
                    '',
                  ].map((h, i) => (
                    <th key={i} style={{
                      padding: '12px 24px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: 'var(--sub)',
                      letterSpacing: '.6px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((apt) => (
                  <tr key={apt.id} className="tbl-row" style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      {isPatient ? (
                        <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{apt.date}</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--mist)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--blue)',
                            flexShrink: 0,
                          }}>
                            {apt.patient.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{apt.patient}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--sub)', fontSize: 14, fontWeight: 500 }}>{apt.doctor}</td>
                    <td style={{ padding: '16px 24px' }}>
                      {isPatient ? (
                        <span style={{ color: 'var(--sub)', fontSize: 14 }}>{apt.diag}</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} color="var(--sub)" />
                          <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{apt.time}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}><StatusBadge status={apt.status} /></td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Link
                        to={isPatient ? "/history" : "/appointments"}
                        style={{
                          fontSize: 13, fontWeight: 700, color: 'var(--blue)',
                          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        Ver <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--sub)', fontSize: 14 }}>
                      No hay registros disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
              padding: '16px 24px', borderTop: '1px solid var(--line)', background: '#FAFAFA'
            }}>
              <span style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 500 }}>
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, listToPaginate.length)} de {listToPaginate.length}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)',
                    background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 13, fontWeight: 600, color: 'var(--text)'
                  }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)',
                    background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 13, fontWeight: 600, color: 'var(--text)'
                  }}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .3, duration: .45, ease: [.22,1,.36,1] }}
            style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--line)', padding: 22 }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>
              Accesos rápidos
            </h3>
            <div className="quick-links-container">
              {isPatient ? (
                <>
                  <QuickLink to="/history"      icon={ClipboardList} label="Mi Historial Médico" />
                  <QuickLink to="/appointments" icon={Calendar}      label="Mis Citas"           />
                  <QuickLink to="/profile"      icon={UserRound}     label="Mi Perfil"            />
                </>
              ) : (
                <>
                  {(isAdmin || isReception) && (
                    /* MODIFICACIÓN AQUI: Le decimos a React Router que envíe esta variable de estado al destino */
                    <QuickLink to="/patients" state={{ openNewPatient: true }} icon={Plus} label="Nuevo Paciente"  />
                  )}
                  <QuickLink to="/appointments"      icon={Calendar}     label="Agendar Cita"    />
                  <QuickLink to="/patients"          icon={Users}        label="Ver Pacientes"   />
                  {(isAdmin || isReception) && (
                    <QuickLink to="/doctors"         icon={Stethoscope}  label="Ver Médicos"     />
                  )}
                  <QuickLink to="/history"           icon={FileText}     label="Historial Médico" />
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;