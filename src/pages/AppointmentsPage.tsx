import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { getAppointments, getAppointmentById, cancelAppointment, completeAppointment, getDoctors, getPatients, createAppointment, updateAppointment } from '../services/api';
import { 
  Search, Plus, ChevronLeft, ChevronRight, AlertCircle, X, Pencil,
  Calendar, Clock, User, UserCheck, UserX, CheckCircle2, XCircle,
  FileText, Activity, HeartPulse,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Estilos Globales e Inyectados ── */
const STYLES = `
  .apt-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .apt-row { transition: background .13s; }
  .apt-row:hover { background: #F4F7FB; }
  .apt-btn { 
    transition: transform .15s, background .15s; 
    border: none; 
    cursor: pointer;
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .apt-btn:hover { transform: scale(1.1); }
  .apt-input-focus:focus { 
    border-color: #1047A9 !important; 
    outline: none;
    box-shadow: 0 0 0 3px rgba(16,71,169,.1); 
  }
  .apt-add-btn { transition: all .18s; }
  .apt-add-btn:hover { 
    background: #1047A9 !important; 
    color: #fff !important;
    box-shadow: 0 4px 16px rgba(16,71,169,.28) !important; 
  }
  .apt-scroll::-webkit-scrollbar { width: 6px; }
  .apt-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('apt-styles-v1')) {
  const el = document.createElement('style');
  el.id = 'apt-styles-v1'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ── Sub-componentes Visuales ── */
const StatusChip = ({ status }) => {
  const map = {
    Completada: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    Programada: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    Cancelada:  { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' }
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
  
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
};

const MiniStat = ({ icon: Icon, label, value, bg, color, delay }) => (
  <motion.div
    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
    transition={{ delay, duration:.36, ease:[.22,1,.36,1] }}
    style={{ background:'#fff', borderRadius:14, border:'1.5px solid #DDE6F0',
             padding:'16px 18px', display:'flex', alignItems:'center', gap:12,
             position:'relative', overflow:'hidden' }}
  >
    <div style={{ position:'absolute', top:-12, right:-12, width:56, height:56,
                  borderRadius:'50%', background:bg, opacity:.45 }} />
    <div style={{ width:40, height:40, borderRadius:11, background:bg, color,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={18} />
    </div>
    <div>
      <p style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</p>
      <p style={{ fontSize:22, fontWeight:800, color:'#0B1F3A', lineHeight:1.1 }}>{value}</p>
    </div>
  </motion.div>
);

const inputBase = {
  width:'100%', borderRadius:11, border:'1.5px solid #DDE6F0',
  padding:'10px 13px', fontSize:13, color:'#0B1F3A',
  background:'#FAFBFD', fontFamily:'DM Sans, sans-serif',
};

const Field = ({ label, required, children, span = 1 }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:5, gridColumn: `span ${span}` }}>
    <label style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', textTransform:'uppercase', letterSpacing:'.5px' }}>
      {label}{required && <span style={{ color:'#EF4444', marginLeft:2 }}>*</span>}
    </label>
    {children}
  </div>
);

const SectionDivider = ({ icon: Icon, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, marginTop:8 }}>
    <div style={{ width:30, height:30, borderRadius:8, background:'rgba(16,71,169,0.08)', color:'#1047A9', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {Icon && <Icon size={14} />}
    </div>
    <span style={{ fontSize:11, fontWeight:800, color:'#1047A9', textTransform:'uppercase', letterSpacing:'.8px', whiteSpace:'nowrap' }}>{label}</span>
    <div style={{ flex:1, height:1, background:'#DDE6F0' }} />
  </div>
);

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
const AppointmentsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const ITEMS_PER_PAGE = 10;
  const [refreshKey, setRefreshKey] = useState(0);

  // ── ESTADO Y LÓGICA DE ALERTAS ──
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Hooks de datos
  const { data: appointmentsData, loading } = useApi(getAppointments, [refreshKey]);
  const { data: doctorsData } = useApi(getDoctors);
  const { data: patientsData } = useApi(getPatients);

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData?.appointments || []);
  const doctors = Array.isArray(doctorsData) ? doctorsData : [];
  const patients = patientsData?.pacientes || [];

  const initialForm = { pacienteId: '', medicoId: '', fecha: '', hora: '', motivo: '' };
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);

  // Filtrado
  const filtered = useMemo(() => {
    return appointments.filter(apt => {
      const q = search.toLowerCase();
      const matchSearch = (
        (apt.paciente && apt.paciente.toLowerCase().includes(q)) || 
        (apt.medico && apt.medico.toLowerCase().includes(q)) || 
        (apt.id && apt.id.toLowerCase().includes(q))
      );
      const matchFilter = filterStatus === 'Todas' || apt.estado === filterStatus;
      return matchSearch && matchFilter;
    });
  }, [appointments, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Estadísticas globales (sin importar filtro)
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      programadas: appointments.filter(a => a.estado === 'Programada').length,
      completadas: appointments.filter(a => a.estado === 'Completada').length,
      canceladas: appointments.filter(a => a.estado === 'Cancelada').length
    };
  }, [appointments]);

  // Handlers de API
  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setConfirmCancel(null);
      setRefreshKey(k => k + 1);
      showToast('Cita cancelada correctamente.', 'success');
    } catch (err) { 
      showToast("Error al cancelar cita: " + (err?.message || err), 'error'); 
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id);
      setRefreshKey(k => k + 1);
      showToast('Cita completada con éxito.', 'success');
    } catch (err) { 
      showToast("Error al completar cita: " + (err?.message || err), 'error'); 
    }
  };

  const setField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pacienteId || !form.medicoId || !form.fecha || !form.hora || !form.motivo) {
        showToast("Por favor completa todos los campos requeridos.", 'error');
        return;
    }

    setIsSubmitting(true);
    try {
        if (isEditing && editingId) {
            await updateAppointment(editingId, {
                medico_id: Number(form.medicoId),
                fecha: form.fecha,
                hora: form.hora,
                motivo: form.motivo
            });
            showToast('Cita actualizada correctamente.', 'success');
        } else {
            await createAppointment({
                paciente_id: Number(form.pacienteId),
                medico_id: Number(form.medicoId),
                fecha: form.fecha,
                hora: form.hora,
                motivo: form.motivo
            });
            showToast('Cita agendada correctamente.', 'success');
        }

        setPanelOpen(false);
        setForm(initialForm);
        setIsEditing(false);
        setEditingId(null);
        setFilterStatus('Todas');
        setRefreshKey(k => k + 1);
    } catch (err) {
        showToast(isEditing ? "Error al actualizar la cita." : "Error al crear la cita.", 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const openAddPanel = () => {
    setForm(initialForm);
    setIsEditing(false);
    setEditingId(null);
    setPanelOpen(true);
  };

  const openEditPanel = async (apt) => {
    setLoadingAppointment(true);
    try {
      const detail = await getAppointmentById(apt.rawId || apt.id);
      setForm({
        pacienteId: String(detail.paciente_id || ''),
        medicoId: String(detail.medico_id || ''),
        fecha: detail.fecha || '',
        hora: detail.hora || '',
        motivo: detail.motivo || '',
      });
      setIsEditing(true);
      setEditingId(apt.rawId || apt.id);
      setPanelOpen(true);
    } catch (err) {
      showToast('No se pudo cargar la cita para edición.', 'error');
    } finally {
      setLoadingAppointment(false);
    }
  };

  return (
    <div className="apt-root" style={{ display:'flex', flexDirection:'column', gap:22, position: 'relative' }}>
      
      {/* ── SISTEMA DE ALERTAS (TOAST) ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              background: '#fff',
              padding: '14px 18px',
              borderRadius: 14,
              boxShadow: '0 8px 30px rgba(11,31,58,0.12)',
              border: '1px solid #DDE6F0',
              borderLeft: toast.type === 'success' ? '4px solid #10B981' : '4px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 300,
              maxWidth: 400
            }}
          >
            {toast.type === 'success' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#D1FAE5', color: '#10B981', width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}>
                <CheckCircle size={18} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEE2E2', color: '#EF4444', width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}>
                <AlertTriangle size={18} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0B1F3A' }}>
                {toast.type === 'success' ? 'Operación exitosa' : 'Atención requerida'}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#4E6B8C', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, show: false })} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex' }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FILA SUPERIOR ── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#0B1F3A', margin:0 }}>Citas Médicas</h1>
            <p style={{ fontSize:13, color:'#4E6B8C' }}>Programación y seguimiento de consultas</p>
        </div>
        <button className="apt-add-btn" onClick={openAddPanel}
          style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'2px solid #1047A9', borderRadius:999, padding:'10px 22px', color:'#1047A9', fontSize:13, fontWeight:700, cursor:'pointer' }}
        >
          <Plus size={15} strokeWidth={2.6} /> Nueva Cita
        </button>
      </motion.div>

      {/* ── ESTADÍSTICAS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        <MiniStat icon={Calendar} label="Total Citas" value={stats.total} bg="#EEF3FA" color="#1047A9" delay={.07} />
        <MiniStat icon={Clock} label="Programadas" value={stats.programadas} bg="#FEF3C7" color="#D97706" delay={.13} />
        <MiniStat icon={CheckCircle2} label="Completadas" value={stats.completadas} bg="#D1FAE5" color="#059669" delay={.19} />
        <MiniStat icon={XCircle} label="Canceladas" value={stats.canceladas} bg="#FEE2E2" color="#DC2626" delay={.25} />
      </div>

      {/* ── CONTENEDOR PRINCIPAL TABLA ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ background:'#fff', borderRadius:18, border:'1.5px solid #DDE6F0', overflow:'hidden' }}>
        
        {/* BARRA BÚSQUEDA Y FILTROS */}
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, padding:'16px 20px', borderBottom:'1.5px solid #DDE6F0' }}>
          <div style={{ position:'relative', flex:1, minWidth:250 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4E6B8C' }} />
            <input className="apt-input-focus" type="text" placeholder="Buscar por folio, paciente o médico..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ ...inputBase, paddingLeft:36, background:'#F5F8FC' }} />
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['Todas','Programada','Completada','Cancelada'].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{ padding:'7px 14px', borderRadius:999, fontSize:12, fontWeight:700, border: filterStatus===s ? 'none' : '1.5px solid #DDE6F0', background: filterStatus===s ? '#1047A9' : 'transparent', color: filterStatus===s ? '#fff' : '#4E6B8C', cursor:'pointer' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* TABLA */}
        <div style={{ overflowX:'auto', minHeight:200 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
            <thead>
              <tr style={{ background:'#FAFBFD', borderBottom:'1.5px solid #DDE6F0' }}>
                {['Folio','Paciente','Médico','Fecha / Hora','Motivo','Estado','Acciones'].map((h,i) => (
                  <th key={i} style={{ padding:'12px 16px', textAlign: i===6 ? 'center' : 'left', fontSize:10, fontWeight:800, color:'#4E6B8C', letterSpacing:'.6px', textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#4E6B8C' }}>Cargando citas...</td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((apt, idx) => (
                  <motion.tr key={apt.id} className="apt-row" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx * 0.03 }} style={{ borderBottom:'1px solid #EEF3FA' }}>
                    <td style={{ padding:'12px 16px' }}><span style={{ fontFamily:'monospace', fontSize:12, fontWeight:800, color:'#1047A9', background:'#EEF3FA', padding:'3px 8px', borderRadius:6 }}>{apt.id}</span></td>
                    <td style={{ padding:'12px 16px' }}><span style={{ fontWeight:800, color:'#0B1F3A', fontSize:13 }}>{apt.paciente}</span></td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'#0B1F3A', fontWeight:600 }}>{apt.medico}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'#0B1F3A', display:'flex', alignItems:'center', gap:5 }}><Calendar size={12} color="#4E6B8C" /> {apt.fecha}</span>
                        <span style={{ fontSize:11, color:'#4E6B8C', display:'flex', alignItems:'center', gap:5 }}><Clock size={12} color="#4E6B8C" /> {apt.hora}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:12, color:'#4E6B8C', maxWidth:180, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={apt.motivo}>{apt.motivo}</td>
                    <td style={{ padding:'12px 16px' }}><StatusChip status={apt.estado} /></td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'center', gap:6 }}>
                        {apt.estado === 'Programada' ? (
                          <>
                            <button onClick={() => openEditPanel(apt)} className="apt-btn" style={{ width:32, height:32, borderRadius:8, background:'#F5F8FC', color:'#4E6B8C' }} title="Editar Cita"><Pencil size={16} /></button>
                            <button onClick={() => handleComplete(apt.rawId || apt.id)} className="apt-btn" style={{ width:32, height:32, borderRadius:8, background:'#D1FAE5', color:'#059669' }} title="Completar Cita"><CheckCircle2 size={16} /></button>
                            <button onClick={() => setConfirmCancel(apt)} className="apt-btn" style={{ width:32, height:32, borderRadius:8, background:'#FEE2E2', color:'#DC2626' }} title="Cancelar Cita"><XCircle size={16} /></button>
                          </>
                        ) : (
                          <span style={{ fontSize:11, color:'#DDE6F0', fontWeight:600 }}>Cerrada</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'#4E6B8C', fontSize:13 }}>No se encontraron citas.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', borderTop:'1.5px solid #DDE6F0' }}>
          <p style={{ fontSize:12, color:'#4E6B8C' }}>Mostrando <strong>{paginatedData.length}</strong> de <strong>{filtered.length}</strong> citas</p>
          <div style={{ display:'flex', gap:6 }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', opacity:page===1?.4:1, cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}><ChevronLeft size={15} /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
                 <button key={i+1} onClick={() => setPage(i+1)} style={{ width:32, height:32, borderRadius:8, fontSize:12, fontWeight:700, border: page===i+1 ? 'none' : '1.5px solid #DDE6F0', background: page===i+1 ? '#1047A9' : '#fff', color: page===i+1 ? '#fff' : '#4E6B8C', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>{i+1}</button>
            ))}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', opacity:page===totalPages?.4:1, cursor:page===totalPages?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}><ChevronRight size={15} /></button>
          </div>
        </div>
      </motion.div>

      {/* ══ PANEL LATERAL: AGENDAR CITA (DRAWER) ══ */}
      <AnimatePresence>
        {panelOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', background:'rgba(11,31,58,.45)', backdropFilter:'blur(4px)' }}>
            <div style={{ flex:1 }} onClick={() => { setPanelOpen(false); setIsEditing(false); setEditingId(null); }} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring', damping:30, stiffness:200 }} className="apt-scroll" style={{ width:'100%', maxWidth:550, height:'100%', background:'#fff', display:'flex', flexDirection:'column', overflowY:'auto' }}>
              
              <div style={{ padding:'22px 24px 18px', borderBottom:'1.5px solid #DDE6F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:10 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:'#0B1F3A', margin:0 }}>{isEditing ? 'Editar Cita' : 'Agendar Nueva Cita'}</h2>
                  <p style={{ fontSize:12, color:'#4E6B8C', marginTop:2 }}>{isEditing ? 'Modifica los datos de la cita existente.' : 'Vincula a un paciente con un especialista.'}</p>
                </div>
                <button onClick={() => { setPanelOpen(false); setIsEditing(false); setEditingId(null); }} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4E6B8C' }}><X size={18} /></button>
              </div>

              <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:32, flex:1 }}>
                <form id="appointment-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:32 }}>
                  
                  <section>
                    <SectionDivider icon={User} label="Participantes" />
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <Field label="Paciente" required>
                        <select className="apt-input-focus" required name="pacienteId" value={form.pacienteId} onChange={setField} disabled={isEditing} style={{ ...inputBase, ...(isEditing ? { background: '#F3F4F6', cursor: 'not-allowed', opacity: 0.7 } : {}) }}>
                          <option value="">Selecciona un paciente...</option>
                          {patients.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellidos} ({p.expediente})</option>)}
                        </select>
                      </Field>
                      <Field label="Médico Especialista" required>
                        <select className="apt-input-focus" required name="medicoId" value={form.medicoId} onChange={setField} style={inputBase}>
                          <option value="">Selecciona un médico...</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.nombre} {d.apellidos} - {d.especialidad}</option>)}
                        </select>
                      </Field>
                    </div>
                  </section>

                  <section style={{ background:'#F8FAFD', padding:16, borderRadius:16, border:'1px solid #E2E8F0' }}>
                    <SectionDivider icon={Clock} label="Programación" />
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Field label="Fecha" required><input className="apt-input-focus" required type="date" name="fecha" value={form.fecha} onChange={setField} style={inputBase}/></Field>
                      <Field label="Hora" required><input className="apt-input-focus" required type="time" name="hora" value={form.hora} onChange={setField} style={inputBase}/></Field>
                    </div>
                  </section>

                  <section>
                    <SectionDivider icon={FileText} label="Detalles Clínicos" />
                    <Field label="Motivo de la consulta" required>
                      <textarea className="apt-input-focus" required name="motivo" value={form.motivo} onChange={setField} placeholder="Describe los síntomas o el propósito de la visita..." style={{ ...inputBase, minHeight:90, resize:'none' }} />
                    </Field>
                  </section>
                </form>
              </div>

              <div style={{ padding:'20px 24px', borderTop:'1.5px solid #DDE6F0', display:'flex', gap:10, position:'sticky', bottom:0, background:'#fff' }}>
                <button type="button" onClick={() => { setPanelOpen(false); setIsEditing(false); setEditingId(null); }} style={{ flex:1, borderRadius:11, border:'1.5px solid #DDE6F0', padding:'12px', fontWeight:700, fontSize:13, color:'#4E6B8C', background:'#fff', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" form="appointment-form" disabled={isSubmitting} style={{ flex:2, borderRadius:11, border:'none', padding:'12px', fontWeight:700, fontSize:13, color:'#fff', background:'linear-gradient(135deg,#1047A9,#3D6FC7)', cursor:isSubmitting ? 'not-allowed' : 'pointer', boxShadow:'0 4px 14px rgba(16,71,169,.26)', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Confirmar Cita')}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ MODAL DE CONFIRMACIÓN: CANCELAR CITA ══ */}
      <AnimatePresence>
        {confirmCancel && (
          <div style={{ position:'fixed', inset:0, zIndex:110, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,31,58,.45)', backdropFilter:'blur(4px)' }}>
            <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ background:'#fff', borderRadius:20, padding:24, maxWidth:400, width:'90%', textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'#FEE2E2', color:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><AlertCircle size={28}/></div>
              <h3 style={{ fontSize:20, fontWeight:800, color:'#0B1F3A', margin:0 }}>¿Cancelar cita?</h3>
              <p style={{ fontSize:14, color:'#4E6B8C', margin:'12px 0 24px', lineHeight:1.5 }}>
                Estás a punto de cancelar la cita del paciente <strong style={{color:'#0B1F3A'}}>{confirmCancel.paciente}</strong> programada para el <strong style={{color:'#0B1F3A'}}>{confirmCancel.fecha}</strong> a las <strong style={{color:'#0B1F3A'}}>{confirmCancel.hora}</strong>.
              </p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setConfirmCancel(null)} style={{ flex:1, padding:'12px', borderRadius:11, border:'1.5px solid #DDE6F0', background:'#fff', fontWeight:700, cursor:'pointer', color:'#4E6B8C' }}>Atrás</button>
                <button onClick={() => handleCancel(confirmCancel.rawId || confirmCancel.id)} style={{ flex:1, padding:'12px', borderRadius:11, border:'none', background:'#DC2626', color:'#fff', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(220,38,38,.25)' }}>Sí, Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AppointmentsPage;