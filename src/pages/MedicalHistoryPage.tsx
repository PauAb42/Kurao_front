import React, { useState, useMemo, useRef } from 'react';
import { Search, ClipboardList, Plus, Calendar, ChevronRight, X, User, Activity, FileText, Stethoscope, ChevronUp, ChevronDown, Pill, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { getPatients, getMedicalHistory, createMedicalRecord, getDoctors } from '../services/api';

/* ── Estilos Globales e Inyectados ── */
const STYLES = `
  .med-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .med-input-focus:focus { 
    border-color: #1047A9 !important; 
    outline: none;
    box-shadow: 0 0 0 3px rgba(16,71,169,.1); 
  }
  .med-scroll::-webkit-scrollbar { width: 6px; }
  .med-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
  .med-record { transition: border-color .2s, box-shadow .2s; background: #fff; cursor: pointer; }
  .med-record:hover { border-color: #1047A9 !important; box-shadow: 0 6px 24px rgba(16,71,169,.1) !important; }
`;

if (typeof document !== 'undefined' && !document.getElementById('med-styles-v3')) {
  const el = document.createElement('style');
  el.id = 'med-styles-v3'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ── Sub-componentes Visuales ── */
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
const MedicalHistoryPage = () => {
  const { user } = useAuth() || { user: { role: 'admin' } }; 
  const isPatient = user?.role === 'patient';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(isPatient ? {
    id: user.id, nombre: user.name, expediente: 'EXP-001', edad: user.age || 45
  } : null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState(null); // Estado para el acordeón

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

  // Formularios
  const initialForm = { medicoId: '', fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', observaciones: '' };
  const [form, setForm] = useState(initialForm);

  // API Hooks
  const { data: patientsData } = useApi(getPatients);
  const { data: doctorsData } = useApi(getDoctors);
  const { data: historyData, loading: loadingHistory, refetch } = useApi(
    () => selectedPatient ? getMedicalHistory(selectedPatient.id) : Promise.resolve([]), 
    [selectedPatient]
  );

  const patients = patientsData?.pacientes || [];
  const doctors = Array.isArray(doctorsData) ? doctorsData : [];
  const history = Array.isArray(historyData) ? historyData : (historyData?.records || []);

  // Búsqueda de pacientes
  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const q = searchTerm.toLowerCase();
    return patients.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(q)) || 
      (p.apellidos && p.apellidos.toLowerCase().includes(q)) || 
      (p.expediente && p.expediente.toLowerCase().includes(q))
    );
  }, [searchTerm, patients]);

  const setField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.medicoId || !form.fecha || !form.diagnostico || !form.tratamiento) {
        showToast("Por favor completa los campos requeridos.", 'error');
        return;
    }

    setIsSubmitting(true);
    try {
        const doc = doctors.find(d => d.id === Number(form.medicoId));
        await createMedicalRecord(selectedPatient.id, {
            ...form,
            medico: `Dr. ${doc.nombre} ${doc.apellidos}`,
            especialidad: doc.especialidad
        });
        setPanelOpen(false);
        setForm(initialForm);
        refetch();
        showToast('Registro clínico guardado correctamente.', 'success');
    } catch (err) {
        showToast("Error al guardar el registro clínico: " + (err?.message || err), 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="med-root" style={{ display:'flex', flexDirection:'column', gap:22, position: 'relative' }}>
      
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
          <h1 style={{ fontSize:22, fontWeight:800, color:'#0B1F3A', margin:0 }}>
            {isPatient ? 'Mi Expediente Clínico' : 'Expedientes de Pacientes'}
          </h1>
          <p style={{ fontSize:13, color:'#4E6B8C' }}>
            {isPatient ? 'Consulta tus antecedentes y tratamientos' : 'Busca y actualiza los registros médicos de los pacientes'}
          </p>
        </div>
      </motion.div>

      <div style={{ background:'#fff', borderRadius:24, border:'1px solid #DDE6F0', padding: '30px', minHeight: '65vh', boxShadow: '0 4px 20px rgba(11,31,58,0.02)' }}>
        
        {/* ── BUSCADOR DE PACIENTES ── */}
        {!isPatient && !selectedPatient && (
          <motion.div initial={{ opacity:0, y: 15 }} animate={{ opacity:1, y: 0 }} transition={{ duration: 0.4 }} style={{ maxWidth: 640, margin: '60px auto 40px', textAlign: 'center' }}>
            
            <div style={{ 
              display:'inline-flex', padding: 22, borderRadius: '28%', 
              background:'linear-gradient(135deg, #EEF3FA 0%, #E2E8F0 100%)', color:'#1047A9', 
              marginBottom: 28, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), 0 8px 24px rgba(16,71,169,0.12)' 
            }}>
              <Search size={34} strokeWidth={2.5} />
            </div>
            
            <h2 style={{ fontSize:26, fontWeight:800, color:'#0B1F3A', marginBottom:12, letterSpacing:'-0.5px' }}>Encuentra un Expediente</h2>
            <p style={{ fontSize:14, color:'#4E6B8C', marginBottom:36, maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.5 }}>
              Ingresa el nombre, apellidos o el número de folio (EXP-XXX) para consultar el historial médico del paciente.
            </p>
            
            <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
              <div style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', color:'#1047A9', display:'flex', alignItems:'center' }}>
                <Search size={20} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Ej. Juan Pérez o EXP-001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width:'100%', borderRadius:20, border:'none', background:'#fff', 
                  padding:'20px 20px 20px 56px', fontSize:15, color:'#0B1F3A', fontWeight: 500,
                  outline:'none', transition:'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 12px 30px rgba(11,31,58,0.06), 0 0 0 1.5px #DDE6F0' 
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 16px 40px rgba(16,71,169,0.1), 0 0 0 2px #1047A9'}
                onBlur={(e) => {
                  if(!searchTerm) e.target.style.boxShadow = '0 12px 30px rgba(11,31,58,0.06), 0 0 0 1.5px #DDE6F0';
                }}
              />
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    style={{ 
                      position:'absolute', top:'100%', left:0, right:0, marginTop:12, zIndex:20, 
                      background:'rgba(255, 255, 255, 0.95)', backdropFilter:'blur(12px)', 
                      borderRadius:20, border:'1px solid rgba(221, 230, 240, 0.8)', 
                      boxShadow:'0 20px 40px rgba(11,31,58,0.1)', overflow:'hidden', padding: 8
                    }}
                  >
                    {searchResults.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => { setSelectedPatient(p); setSearchTerm(''); }}
                        style={{ 
                          display:'flex', width:'100%', alignItems:'center', justifyContent:'space-between', 
                          padding:'12px 16px', borderRadius: 14, background:'transparent', 
                          border:'none', cursor:'pointer', transition:'all .2s' 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#F4F7FB'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                          <div style={{ 
                            width:44, height:44, borderRadius:14, background:'linear-gradient(135deg, #1047A9, #3D6FC7)', 
                            color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', 
                            fontSize:15, fontWeight:800, boxShadow: '0 4px 10px rgba(16,71,169,0.2)' 
                          }}>
                            {(p.nombre?.charAt(0) || '')}{(p.apellidos?.charAt(0) || '')}
                          </div>
                          <div style={{ textAlign:'left' }}>
                            <p style={{ fontSize:15, fontWeight:700, color:'#0B1F3A', margin:0 }}>{p.nombre} {p.apellidos}</p>
                            <p style={{ fontSize:12, color:'#4E6B8C', margin:0, marginTop:3 }}>
                              <span style={{ background:'#EEF3FA', color:'#1047A9', padding:'2px 6px', borderRadius:6, fontWeight:700, marginRight:6 }}>{p.expediente}</span>
                              {p.edad} años
                            </p>
                          </div>
                        </div>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '1px solid #DDE6F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronRight size={16} color="#1047A9" />
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── VISTA DEL EXPEDIENTE DEL PACIENTE ── */}
        {selectedPatient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display:'flex', flexDirection:'column', gap:30 }}>
            
            <div style={{ display:'flex', flexWrap:'wrap', gap:20, alignItems:'center', justifyContent:'space-between', paddingBottom:24, borderBottom:'1.5px solid #DDE6F0' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:60, height:60, borderRadius:16, background:'linear-gradient(135deg,#1047A9,#3D6FC7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, boxShadow:'0 4px 14px rgba(16,71,169,.26)' }}>
                  {(selectedPatient.nombre?.charAt(0) || 'P')}
                </div>
                <div>
                  <h3 style={{ fontSize:22, fontWeight:800, color:'#0B1F3A', margin:0 }}>{selectedPatient.nombre} {selectedPatient.apellidos}</h3>
                  <p style={{ fontSize:13, color:'#4E6B8C', margin:0, marginTop:4 }}>Expediente: <span style={{fontFamily:'monospace', fontWeight:800, color:'#1047A9', background:'#EEF3FA', padding:'2px 6px', borderRadius:6}}>{selectedPatient.expediente}</span> • {selectedPatient.edad} años</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                {!isPatient && (
                  <>
                    <button onClick={() => setSelectedPatient(null)} style={{ padding:'10px 18px', borderRadius:11, border:'1.5px solid #DDE6F0', background:'#fff', fontWeight:700, fontSize:13, color:'#4E6B8C', cursor:'pointer' }}>Cerrar Expediente</button>
                    <button onClick={() => setPanelOpen(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:11, border:'none', background:'#1047A9', fontWeight:700, fontSize:13, color:'#fff', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,71,169,.26)' }}>
                      <Plus size={16} /> Agregar Consulta
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Línea de Tiempo (Historial) con Diseño de Acordeón */}
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'#EEF3FA', color:'#1047A9', display:'flex', alignItems:'center', justifyContent:'center' }}><ClipboardList size={16} /></div>
                  <h4 style={{ fontSize:16, fontWeight:800, color:'#0B1F3A', margin:0 }}>Consultas Anteriores</h4>
                </div>
                <p style={{ fontSize: 12, color: '#4E6B8C', margin: 0 }}>{history.length} consultas registradas</p>
              </div>

              {loadingHistory ? (
                <div style={{ padding:40, textAlign:'center', color:'#4E6B8C' }}>Cargando historial...</div>
              ) : history.length === 0 ? (
                <div style={{ padding:40, textAlign:'center', background:'#FAFBFD', borderRadius:16, border:'1.5px dashed #DDE6F0' }}>
                  <ClipboardList size={40} color="#DDE6F0" style={{ margin:'0 auto 10px' }}/>
                  <p style={{ fontSize:14, color:'#4E6B8C', fontWeight:600 }}>No hay consultas registradas para este paciente.</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Línea vertical central */}
                  <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#1047A9,#DDE6F0)', borderRadius: 2, zIndex: 0 }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {history.map((rec, idx) => {
                      const isOpen = expandedRecord === rec.id;
                      return (
                        <motion.div key={rec.id}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * .07 }}
                          style={{ display: 'flex', gap: 16, paddingBottom: 16, position: 'relative', zIndex: 1 }}
                        >
                          {/* Dot del timeline */}
                          <div style={{ flexShrink: 0 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: idx === 0 ? 'linear-gradient(135deg,#1047A9,#3D6FC7)' : '#EEF3FA',
                              border: '2.5px solid #fff',
                              boxShadow: '0 0 0 2px ' + (idx === 0 ? '#1047A9' : '#DDE6F0'),
                              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                            }}>
                              <Stethoscope size={16} color={idx === 0 ? '#fff' : '#1047A9'} />
                            </div>
                          </div>

                          {/* Tarjeta de Consulta Expansible */}
                          <div className="med-record"
                            onClick={() => setExpandedRecord(isOpen ? null : rec.id)}
                            style={{ flex: 1, borderRadius: 16, border: '1.5px solid #EEF3FA', overflow: 'hidden' }}
                          >
                            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 5 }}>
                                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>{rec.diagnostico}</h4>
                                  {idx === 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, background: '#EEF3FA', color: '#1047A9', padding: '2px 8px', borderRadius: 20 }}>
                                      Más reciente
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 12, color: '#4E6B8C', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={11} /> {rec.fecha}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#4E6B8C', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <User size={11} /> {rec.medico}
                                    {rec.especialidad && <span style={{ color: '#1047A9', fontWeight: 600 }}> · {rec.especialidad}</span>}
                                  </span>
                                </div>
                              </div>
                              <div style={{ color: '#4E6B8C', flexShrink: 0 }}>
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>

                            {/* Contenido Expandido */}
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                    <div style={{ background: '#F8FAFF', borderRadius: 10, padding: 14, border: '1px solid #DBEAFE' }}>
                                      <p style={{ fontSize: 9, fontWeight: 800, color: '#1047A9', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>
                                        <FileText size={10} style={{ display: 'inline', marginRight: 3 }} />Tratamiento
                                      </p>
                                      <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.6, margin: 0 }}>{rec.tratamiento || '—'}</p>
                                    </div>
                                    <div style={{ background: '#F0FDF4', borderRadius: 10, padding: 14, border: '1px solid #BBF7D0' }}>
                                      <p style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>
                                        <Pill size={10} style={{ display: 'inline', marginRight: 3 }} />Medicamentos
                                      </p>
                                      <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.6, margin: 0 }}>{rec.medicamentos || '—'}</p>
                                    </div>
                                    {rec.observaciones && (
                                      <div style={{ gridColumn: '1 / -1', background: '#FFFBEB', borderRadius: 10, padding: 14, border: '1px solid #FDE68A' }}>
                                        <p style={{ fontSize: 9, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Notas Clínicas</p>
                                        <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.6, margin: 0 }}>{rec.observaciones}</p>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* ══ PANEL LATERAL: AGREGAR CONSULTA (DRAWER) ══ */}
      <AnimatePresence>
        {panelOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', background:'rgba(11,31,58,.45)', backdropFilter:'blur(4px)' }}>
            <div style={{ flex:1 }} onClick={() => setPanelOpen(false)} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring', damping:30, stiffness:200 }} className="med-scroll" style={{ width:'100%', maxWidth:550, height:'100%', background:'#fff', display:'flex', flexDirection:'column', overflowY:'auto' }}>
              
              <div style={{ padding:'22px 24px 18px', borderBottom:'1.5px solid #DDE6F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:10 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:'#0B1F3A', margin:0 }}>Registrar Consulta</h2>
                  <p style={{ fontSize:12, color:'#4E6B8C', marginTop:2 }}>Agrega un nuevo registro al historial clínico.</p>
                </div>
                <button onClick={() => setPanelOpen(false)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4E6B8C' }}><X size={18} /></button>
              </div>

              <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:32, flex:1 }}>
                <form id="history-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:32 }}>
                  
                  <section>
                    <SectionDivider icon={User} label="Información General" />
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Field label="Médico Tratante" required span={2}>
                        <select className="med-input-focus" required name="medicoId" value={form.medicoId} onChange={setField} style={inputBase}>
                          <option value="">Selecciona un médico...</option>
                          {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.nombre} {d.apellidos} - {d.especialidad}</option>)}
                        </select>
                      </Field>
                      <Field label="Fecha de Consulta" required span={2}>
                        <input className="med-input-focus" required type="date" name="fecha" value={form.fecha} onChange={setField} style={inputBase}/>
                      </Field>
                    </div>
                  </section>

                  <section style={{ background:'#F8FAFD', padding:16, borderRadius:16, border:'1px solid #E2E8F0' }}>
                    <SectionDivider icon={Activity} label="Detalle Clínico" />
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <Field label="Diagnóstico Principal" required>
                        <input className="med-input-focus" required type="text" name="diagnostico" value={form.diagnostico} onChange={setField} placeholder="Ej: Faringitis aguda..." style={inputBase}/>
                      </Field>
                      <Field label="Tratamiento Indicado" required>
                        <textarea className="med-input-focus" required name="tratamiento" value={form.tratamiento} onChange={setField} placeholder="Indicaciones, reposo, dieta..." style={{ ...inputBase, minHeight:70, resize:'none' }} />
                      </Field>
                      <Field label="Medicamentos / Receta">
                        <textarea className="med-input-focus" name="medicamentos" onChange={(e) => setForm(f => ({ ...f, medicamentos: e.target.value }))} placeholder="Fármaco, dosis y duración..." style={{ ...inputBase, minHeight:70, resize:'none' }} />
                      </Field>
                    </div>
                  </section>

                  <section>
                    <SectionDivider icon={FileText} label="Notas Finales" />
                    <Field label="Observaciones Adicionales">
                      <textarea className="med-input-focus" name="observaciones" value={form.observaciones} onChange={setField} placeholder="Recomendaciones extra, próxima cita, etc..." style={{ ...inputBase, minHeight:70, resize:'none' }} />
                    </Field>
                  </section>

                </form>
              </div>

              <div style={{ padding:'20px 24px', borderTop:'1.5px solid #DDE6F0', display:'flex', gap:10, position:'sticky', bottom:0, background:'#fff' }}>
                <button type="button" onClick={() => setPanelOpen(false)} style={{ flex:1, borderRadius:11, border:'1.5px solid #DDE6F0', padding:'12px', fontWeight:700, fontSize:13, color:'#4E6B8C', background:'#fff', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" form="history-form" disabled={isSubmitting} style={{ flex:2, borderRadius:11, border:'none', padding:'12px', fontWeight:700, fontSize:13, color:'#fff', background:'linear-gradient(135deg,#1047A9,#3D6FC7)', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,71,169,.26)', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MedicalHistoryPage;