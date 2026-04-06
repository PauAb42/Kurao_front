import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getPatientById, getMedicalHistory, getAppointments, updatePatient } from '../services/api';
import {
  ChevronLeft, User, Calendar, ClipboardList, Pencil,
  Phone, Mail, MapPin, Droplets, AlertTriangle, Plus,
  Download, FileText, Loader, CheckCircle, X, Loader2, Clock, Pill, Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ── Estilos Inyectados ── */
const STYLES = `
  .pd-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pd-tab    { transition: all .18s; cursor: pointer; border: none; background: none; }
  .pd-tab:hover { color: #1047A9 !important; }
  .pd-info-row { transition: background .13s; }
  .pd-info-row:hover { background: #F4F7FB !important; }
  .pd-record { transition: border-color .18s, box-shadow .18s; }
  .pd-record:hover { border-color: #1047A9 !important; box-shadow: 0 4px 18px rgba(16,71,169,.08) !important; }
  .pd-apt-row { transition: background .13s; }
  .pd-apt-row:hover { background: #F4F7FB; }
  .pd-pdf-btn { transition: all .2s; }
  .pd-pdf-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,71,169,.3) !important; }
  .pts-input-focus:focus { border-color: #1047A9 !important; outline: none; box-shadow: 0 0 0 3px rgba(16,71,169,.1); }
  .pd-scroll::-webkit-scrollbar { width: 6px; }
  .pd-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('pd-styles')) {
  const el = document.createElement('style');
  el.id = 'pd-styles'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ── Helpers ── */
const calcAge = (dob) => {
  if (!dob) return '—';
  const today = new Date(); const b = new Date(dob);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
};

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

const SectionDivider = ({ label, icon: Icon }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, marginTop:8 }}>
    {Icon && <Icon size={14} color="#1047A9" />}
    <span style={{ fontSize:10, fontWeight:800, color:'#1047A9', textTransform:'uppercase', letterSpacing:'.6px', whiteSpace:'nowrap' }}>{label}</span>
    <div style={{ flex:1, height:1, background:'#DDE6F0' }} />
  </div>
);

const PatientDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');
  const [pdfState, setPdfState] = useState('idle');

  // Modales y Estados de carga
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'cita' | 'consulta' | null
  const [isSaving, setIsSaving] = useState(false);

  const { data: patient, loading: loadingPt, refetch: refetchPt } = useApi(() => getPatientById(id), [id]);
  const { data: historyRaw, refetch: refetchHistory } = useApi(() => getMedicalHistory(id), [id]);
  const { data: appointmentsRaw, refetch: refetchApts } = useApi(() => getAppointments({ patientId: id }), [id]);

  const patientData = patient || {
    nombre: 'Cargando...', apellidos: '', fecha_nacimiento: '', sexo: '',
    telefono: '', email: '', direccion: '', tipo_sangre: '', alergias: '', expediente: '...'
  };

  /* ── Formulario de Edición de Paciente ── */
  const [editForm, setEditForm] = useState({
    nombre: '', apellidos: '', fecha_nacimiento: '', sexo: 'Masculino',
    telefono: '', email: '', direccion: '', tipo_sangre: 'O+', alergias: ''
  });

  /* ── Formulario de Nueva Cita (Basado en tabla 'citas') ── */
  const [appointmentForm, setAppointmentForm] = useState({
    id_medico: '', fecha_cita: '', hora_cita: '', motivo: '', estado: 'Programada'
  });

  /* ── Formulario de Nueva Consulta (Basado en tabla 'historial_clinico') ── */
  const [historyForm, setHistoryForm] = useState({
    id_cita: '', diagnostico: '', tratamiento: '', medicamentos: '', notas: '', proxima_cita: ''
  });

  // Efecto para cargar datos en el form de edición cuando el paciente llega
  useEffect(() => {
    if (patient) {
      setEditForm({
        nombre: patient.nombre || '',
        apellidos: patient.apellidos || '',
        fecha_nacimiento: patient.fecha_nacimiento || '',
        sexo: patient.sexo || 'Masculino',
        telefono: patient.telefono || '',
        email: patient.email || '',
        direccion: patient.direccion || '',
        tipo_sangre: patient.tipo_sangre || 'O+',
        alergias: patient.alergias || ''
      });
    }
  }, [patient]);

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await updatePatient(id, editForm);
      setEditPanelOpen(false);
      refetchPt();
    } catch (error) {
      alert("Error al actualizar paciente");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionSubmit = (type) => {
    // Aquí iría la llamada a tu API (ej: createAppointment o createHistory)
    console.log(`Guardando ${type}:`, type === 'cita' ? appointmentForm : historyForm);
    alert(`Registro de ${type} guardado con éxito (Simulado)`);
    setModalType(null);
    type === 'cita' ? refetchApts() : refetchHistory();
  };

  if (loadingPt) return <div className="pd-root" style={{ padding: 40 }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="pd-root" style={{ display:'flex', flexDirection:'column', gap:20 }}>
      
      {/* ── BREADCRUMB ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <Link to="/patients" style={{ width:36, height:36, borderRadius:10, border:'1.5px solid #DDE6F0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'#4E6B8C' }}>
          <ChevronLeft size={18} />
        </Link>
        <div style={{ fontSize:13, fontWeight:700, color:'#0B1F3A' }}>
          {patientData.nombre} {patientData.apellidos}
        </div>
      </div>

      {/* ── PROFILE HEADER ── */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ background:'#fff', borderRadius:20, border:'1.5px solid #DDE6F0', overflow:'hidden' }}>
        <div style={{ height:6, background:'linear-gradient(90deg,#1047A9,#00C9A7)' }} />
        <div style={{ padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:64, height:64, borderRadius:16, background:'#EEF3FA', color:'#1047A9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800 }}>
              {patientData.nombre.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:'#0B1F3A', margin:0 }}>{patientData.nombre} {patientData.apellidos}</h1>
              <p style={{ fontSize:13, color:'#4E6B8C', marginTop:4 }}>
                <strong style={{ color:'#1047A9' }}>{calcAge(patientData.fecha_nacimiento)} años</strong> · {patientData.sexo} · Exp: {patientData.expediente}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setEditPanelOpen(true)} style={{ display:'flex', alignItems:'center', gap:7, border:'1.5px solid #DDE6F0', borderRadius:11, padding:'9px 18px', background:'#fff', color:'#4E6B8C', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              <Pencil size={15} /> Editar
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:8, border:'none', borderRadius:11, padding:'9px 20px', background:'linear-gradient(135deg,#1047A9,#3D6FC7)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(16,71,169,.24)' }}>
              <Download size={15} /> PDF
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', borderBottom:'1.5px solid #DDE6F0', padding:'0 28px' }}>
          {[
            { id:'general', label:'Información General', icon: User },
            { id:'citas', label:'Citas', icon: Calendar },
            { id:'historial', label:'Historial Clínico', icon: ClipboardList }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:7, padding:'14px 20px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:700, color: activeTab === tab.id ? '#1047A9' : '#4E6B8C', borderBottom: activeTab === tab.id ? '2.5px solid #1047A9' : '2.5px solid transparent' }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={{ padding:28 }}>
          {activeTab === 'general' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:24 }}>
              <div>
                <SectionDivider label="Contacto" icon={Phone} />
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ background:'#FAFBFD', padding:14, borderRadius:12, border:'1px solid #EEF3FA' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', display:'block', marginBottom:4 }}>TELÉFONO</span>
                    <span style={{ fontSize:14, fontWeight:600, color:'#0B1F3A' }}>{patientData.telefono || 'No registrado'}</span>
                  </div>
                  <div style={{ background:'#FAFBFD', padding:14, borderRadius:12, border:'1px solid #EEF3FA' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', display:'block', marginBottom:4 }}>CORREO</span>
                    <span style={{ fontSize:14, fontWeight:600, color:'#0B1F3A' }}>{patientData.email || 'No registrado'}</span>
                  </div>
                  <div style={{ background:'#FAFBFD', padding:14, borderRadius:12, border:'1px solid #EEF3FA' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', display:'block', marginBottom:4 }}>DIRECCIÓN</span>
                    <span style={{ fontSize:14, fontWeight:600, color:'#0B1F3A' }}>{patientData.direccion || 'No registrada'}</span>
                  </div>
                </div>
              </div>
              <div>
                <SectionDivider label="Clínico" icon={Droplets} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                   <div style={{ background:'#FAFBFD', padding:14, borderRadius:12, border:'1px solid #EEF3FA' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', display:'block', marginBottom:4 }}>SANGRE</span>
                    <span style={{ fontSize:18, fontWeight:800, color:'#DC2626' }}>{patientData.tipo_sangre}</span>
                  </div>
                  <div style={{ background:'#FAFBFD', padding:14, borderRadius:12, border:'1px solid #EEF3FA' }}>
                    <span style={{ fontSize:10, fontWeight:800, color:'#4E6B8C', display:'block', marginBottom:4 }}>ALERGIAS</span>
                    <span style={{ fontSize:13, fontWeight:600, color:'#D97706' }}>{patientData.alergias || 'Ninguna'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#0B1F3A' }}>Próximas Citas</h3>
                <button onClick={() => setModalType('cita')} style={{ background:'#1047A9', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <Plus size={14} /> Nueva Cita
                </button>
              </div>
              {/* Tabla de Citas aquí... */}
              <p style={{ color:'#4E6B8C', fontSize:13 }}>No hay citas recientes para mostrar.</p>
            </div>
          )}

          {activeTab === 'historial' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize:16, fontWeight:700, color:'#0B1F3A' }}>Historial de Consultas</h3>
                <button onClick={() => setModalType('consulta')} style={{ background:'#1047A9', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                  <Plus size={14} /> Agregar Consulta
                </button>
              </div>
              {/* Listado de Consultas aquí... */}
              <p style={{ color:'#4E6B8C', fontSize:13 }}>Sin registros en el historial.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══ MODAL PARA NUEVAS CITAS / CONSULTAS ══ */}
      <AnimatePresence>
        {modalType && (
          <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,31,58,.55)', backdropFilter:'blur(5px)', padding:20 }}>
            <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.9, opacity:0 }} className="pd-scroll" style={{ background:'#fff', borderRadius:20, padding:28, maxWidth:500, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(11,31,58,.22)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
                <h3 style={{ fontSize:18, fontWeight:800, color:'#0B1F3A' }}>{modalType === 'cita' ? 'Programar Cita' : 'Registrar Consulta'}</h3>
                <button onClick={() => setModalType(null)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={20}/></button>
              </div>

              <div style={{ display:'grid', gap:16 }}>
                {modalType === 'cita' ? (
                  <>
                    <Field label="Médico Asignado" required>
                      <select style={inputBase} value={appointmentForm.id_medico} onChange={e => setAppointmentForm({...appointmentForm, id_medico: e.target.value})}>
                        <option value="">Seleccione Médico</option>
                        <option value="1">Dr. Ricardo Martínez</option>
                        <option value="2">Dra. Elena García</option>
                      </select>
                    </Field>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <Field label="Fecha" required><input type="date" style={inputBase} onChange={e => setAppointmentForm({...appointmentForm, fecha_cita: e.target.value})} /></Field>
                      <Field label="Hora" required><input type="time" style={inputBase} onChange={e => setAppointmentForm({...appointmentForm, hora_cita: e.target.value})} /></Field>
                    </div>
                    <Field label="Motivo de la Cita" required><textarea style={{...inputBase, minHeight:80}} placeholder="Dolor de cabeza, revisión..." onChange={e => setAppointmentForm({...appointmentForm, motivo: e.target.value})} /></Field>
                  </>
                ) : (
                  <>
                    <Field label="Vincular a Cita (ID)"><input type="text" style={inputBase} placeholder="ID de la cita previa" onChange={e => setHistoryForm({...historyForm, id_cita: e.target.value})} /></Field>
                    <Field label="Diagnóstico" required><input type="text" style={inputBase} placeholder="Ej. Influenza tipo A" onChange={e => setHistoryForm({...historyForm, diagnostico: e.target.value})} /></Field>
                    <Field label="Tratamiento"><textarea style={{...inputBase, minHeight:60}} placeholder="Reposo absoluto..." onChange={e => setHistoryForm({...historyForm, tratamiento: e.target.value})} /></Field>
                    <Field label="Medicamentos Recetados"><textarea style={{...inputBase, minHeight:60}} placeholder="Paracetamol 500mg..." onChange={e => setHistoryForm({...historyForm, medicamentos: e.target.value})} /></Field>
                    <Field label="Próxima Cita Sugerida"><input type="date" style={inputBase} onChange={e => setHistoryForm({...historyForm, proxima_cita: e.target.value})} /></Field>
                  </>
                )}
              </div>

              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setModalType(null)} style={{ flex:1, padding:12, borderRadius:11, border:'1.5px solid #DDE6F0', background:'#fff', fontWeight:700, color:'#4E6B8C', cursor:'pointer' }}>Cancelar</button>
                <button onClick={() => handleActionSubmit(modalType)} style={{ flex:2, padding:12, borderRadius:11, border:'none', background:'#1047A9', color:'#fff', fontWeight:700, cursor:'pointer' }}>Guardar Registro</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ PANEL EDITAR PACIENTE (Sincronizado con Nueva Cita) ══ */}
      <AnimatePresence>
        {editPanelOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:110, display:'flex', background:'rgba(11,31,58,.45)', backdropFilter:'blur(4px)' }}>
            <div style={{ flex:1 }} onClick={() => setEditPanelOpen(false)} />
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} transition={{ type:'spring', damping:28, stiffness:200 }} className="pd-scroll" style={{ width:'100%', maxWidth:490, height:'100%', background:'#fff', display:'flex', flexDirection:'column', overflowY:'auto' }}>
              <div style={{ padding:'22px 24px', borderBottom:'1.5px solid #DDE6F0', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#fff', zIndex:5 }}>
                <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1F3A' }}>Editar Expediente</h2>
                <button onClick={() => setEditPanelOpen(false)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', cursor:'pointer' }}><X size={15} /></button>
              </div>

              <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
                <SectionDivider label="Datos Personales" icon={User} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <Field label="Nombre" required><input style={inputBase} value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></Field>
                  <Field label="Apellidos" required><input style={inputBase} value={editForm.apellidos} onChange={e => setEditForm({...editForm, apellidos: e.target.value})} /></Field>
                  <Field label="Fecha Nac." required><input type="date" style={inputBase} value={editForm.fecha_nacimiento} onChange={e => setEditForm({...editForm, fecha_nacimiento: e.target.value})} /></Field>
                  <Field label="Sexo" required>
                    <select style={inputBase} value={editForm.sexo} onChange={e => setEditForm({...editForm, sexo: e.target.value})}>
                      <option>Masculino</option><option>Femenino</option><option>Otro</option>
                    </select>
                  </Field>
                </div>

                <SectionDivider label="Contacto" icon={Phone} />
                <Field label="Teléfono"><input style={inputBase} value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} /></Field>
                <Field label="Correo"><input style={inputBase} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></Field>
                <Field label="Dirección"><input style={inputBase} value={editForm.direccion} onChange={e => setEditForm({...editForm, direccion: e.target.value})} /></Field>

                <SectionDivider label="Información Clínica" icon={Stethoscope} />
                <Field label="Tipo de Sangre">
                  <select style={inputBase} value={editForm.tipo_sangre} onChange={e => setEditForm({...editForm, tipo_sangre: e.target.value})}>
                    {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Alergias"><textarea style={{...inputBase, minHeight:60}} value={editForm.alergias} onChange={e => setEditForm({...editForm, alergias: e.target.value})} /></Field>
              </div>

              <div style={{ padding:'20px 24px', borderTop:'1.5px solid #DDE6F0', display:'flex', gap:10, position:'sticky', bottom:0, background:'#fff' }}>
                <button onClick={() => setEditPanelOpen(false)} style={{ flex:1, padding:12, borderRadius:11, border:'1.5px solid #DDE6F0', background:'#fff', fontWeight:700, color:'#4E6B8C' }}>Cancelar</button>
                <button onClick={handleSaveEdit} disabled={isSaving} style={{ flex:2, padding:12, borderRadius:11, border:'none', background:'#1047A9', color:'#fff', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Guardar Cambios'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDetailPage;