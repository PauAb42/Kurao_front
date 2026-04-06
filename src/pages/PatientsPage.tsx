import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { getPatients, deletePatient } from '../services/api';
import {
  Search, Plus, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, X,
  Users, UserCheck, UserX, Calendar,
  Droplets, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

/* ── inject styles once ── */
const STYLES = `
  .pts-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pts-serif  { font-family: 'DM Serif Display', serif; }
  .pts-row    { transition: background .13s; }
  .pts-row:hover { background: #F4F7FB; }
  .pts-btn    { transition: transform .15s; border: none; cursor: pointer;
                display: flex; align-items: center; justify-content: center; }
  .pts-btn:hover { transform: scale(1.12); }
  .pts-input-focus:focus { border-color: #1047A9 !important; outline: none;
                           box-shadow: 0 0 0 3px rgba(16,71,169,.1); }
  .pts-add-btn { transition: background .18s, color .18s, box-shadow .18s; }
  .pts-add-btn:hover { background: #1047A9 !important; color: #fff !important;
                       box-shadow: 0 4px 16px rgba(16,71,169,.28) !important; }
  .pts-filter-btn { transition: all .15s; cursor: pointer; }
  .pts-filter-btn:hover { background: #EEF3FA !important; color: #1047A9 !important; }
  .pts-scroll::-webkit-scrollbar { width: 6px; }
  .pts-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
  @keyframes shimPts {
    0%   { background-position: -500px 0; }
    100% { background-position:  500px 0; }
  }
  .shim-pts {
    background: linear-gradient(90deg,#edf1f7 25%,#f6f9fc 50%,#edf1f7 75%);
    background-size: 500px 100%; animation: shimPts 1.3s infinite; border-radius: 10px;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('pts-styles-v2')) {
  const el = document.createElement('style');
  el.id = 'pts-styles-v2'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ── sub-components ── */
const StatusDot = ({ active }) => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:5,
    background: active ? '#D1FAE5' : '#F3F4F6',
    color: active ? '#065F46' : '#6B7280',
    fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20,
  }}>
    <span style={{ width:6, height:6, borderRadius:'50%', background: active ? '#10B981' : '#9CA3AF' }} />
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

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
      <p style={{ fontSize:10, fontWeight:700, color:'#4E6B8C', textTransform:'uppercase', letterSpacing:'.5px' }}>{label}</p>
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

/* ════════════════════════════════════ */
const PatientsPage = () => {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('Todos');
  const [panelOpen, setPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  
  const initialForm = {
    nombre: '',
    fecha_nacimiento: '',
    sexo: 'Masculino',
    telefono: '',
    correo: '',
    direccion: '',
    tipo_sangre: 'O+',
    alergias: ''
  };
  const [form, setForm] = useState(initialForm);

  const ITEMS_PER_PAGE = 5;
  const { data, loading, refetch } = useApi(() => getPatients(page, 10, search), [page, search]);

  const handleDelete = async (id) => {
    try { await deletePatient(id); setDelTarget(null); refetch(); }
    catch (err) { alert('Error al eliminar paciente: ' + err.message); }
  };

  const openAddPanel = () => {
    setForm(initialForm);
    setIsEditing(false);
    setPanelOpen(true);
  };

  const openEditPanel = (p) => {
    setForm({
        ...initialForm,
        id_paciente: p.id,
        nombre: p.nombre || '',
        tipo_sangre: p.sangre || 'O+',
        telefono: p.telefono || ''
    });
    setIsEditing(true);
    setPanelOpen(true);
  };

  const setField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const mock = data?.patients || [
    { id:1, expediente:'EXP-001', nombre:'Juan Pérez', ultimaVisita:'10 Mar 2026', estado:'Activo', sangre:'O+', edad: 25, telefono: '555-0101' },
    { id:2, expediente:'EXP-002', nombre:'María López', ultimaVisita:'15 Mar 2026', estado:'Activo', sangre:'A-', edad: 32, telefono: '555-0102' },
    { id:3, expediente:'EXP-003', nombre:'Carlos Ruiz', ultimaVisita:'20 Feb 2026', estado:'Inactivo', sangre:'B+', edad: 45, telefono: '555-0103' },
  ];

  const filtered = mock.filter(p => {
    const q = search.toLowerCase();
    return (p.nombre.toLowerCase().includes(q) || p.expediente.toLowerCase().includes(q))
        && (filterStatus === 'Todos' || p.estado === filterStatus);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activos   = mock.filter(p => p.estado === 'Activo').length;
  const inactivos = mock.filter(p => p.estado === 'Inactivo').length;

  return (
    <div className="pts-root" style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* ── TITLE ROW ── */}
      <motion.div
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'flex-end', gap:14 }}
      >
        <button className="pts-add-btn" onClick={openAddPanel}
          style={{
            display:'flex', alignItems:'center', gap:8, background:'#fff', border:'2px solid #1047A9',
            borderRadius:999, padding:'10px 22px', color:'#1047A9', fontSize:13, fontWeight:700, cursor:'pointer',
          }}
        >
          <Plus size={15} strokeWidth={2.6} /> Agregar paciente
        </button>
      </motion.div>

      {/* ── MINI STATS ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14 }}>
        <MiniStat icon={Users} label="Total" value={mock.length} bg="#EEF3FA" color="#1047A9" delay={.07} />
        <MiniStat icon={UserCheck} label="Activos" value={activos} bg="#D1FAF3" color="#00A88D" delay={.13} />
        <MiniStat icon={UserX} label="Inactivos" value={inactivos} bg="#FEE2E2" color="#DC2626" delay={.19} />
        <MiniStat icon={Calendar} label="Citas mes" value="38" bg="#FEF3C7" color="#D97706" delay={.25} />
      </div>

      {/* ── TABLE CARD ── */}
      <motion.div
        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ background:'#fff', borderRadius:18, border:'1.5px solid #DDE6F0', overflow:'hidden' }}
      >
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, padding:'16px 20px', borderBottom:'1.5px solid #DDE6F0' }}>
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#4E6B8C' }} />
            <input className="pts-input-focus" type="text" placeholder="Buscar por nombre o expediente…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ ...inputBase, paddingLeft:36, background:'#F5F8FC' }}
            />
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['Todos','Activo','Inactivo'].map(s => (
              <button key={s} className="pts-filter-btn" onClick={() => { setFilter(s); setPage(1); }}
                style={{
                  padding:'7px 14px', borderRadius:999, fontSize:12, fontWeight:700,
                  border: filterStatus===s ? 'none' : '1.5px solid #DDE6F0',
                  background: filterStatus===s ? '#1047A9' : 'transparent',
                  color: filterStatus===s ? '#fff' : '#4E6B8C',
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#FAFBFD', borderBottom:'1.5px solid #DDE6F0' }}>
                {['Expediente','Paciente','Edad','Última visita','Sangre','Estado',''].map((h,i) => (
                  <th key={i} style={{
                    padding:'10px 16px', textAlign: i===6 ? 'right' : 'left',
                    fontSize:10, fontWeight:800, color:'#4E6B8C',
                    letterSpacing:'.6px', textTransform:'uppercase', whiteSpace:'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan={7} style={{ padding:'8px 16px' }}><div className="shim-pts" style={{ height:38 }} /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'44px 16px', textAlign:'center', color:'#4E6B8C', fontSize:14 }}>No se encontraron pacientes.</td></tr>
              ) : paginatedData.map((p, idx) => (
                <motion.tr key={p.id} className="pts-row" initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx * .04 }} style={{ borderBottom:'1px solid #EEF3FA' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:800, color:'#1047A9', background:'#EEF3FA', padding:'2px 8px', borderRadius:6 }}>{p.expediente}</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background: p.estado==='Activo' ? '#EEF3FA' : '#F3F4F6', color: p.estado==='Activo' ? '#1047A9' : '#9CA3AF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800 }}>
                        {p.nombre.charAt(0)}
                      </div>
                      <span style={{ fontWeight:700, color:'#0B1F3A', fontSize:13 }}>{p.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px', fontSize:13, color:'#0B1F3A', fontWeight:600 }}>
                    {p.edad} <span style={{ color:'#4E6B8C', fontWeight:400 }}>años</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'#4E6B8C' }}>
                      <Calendar size={11} color="#1047A9" /> {p.ultimaVisita}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:11, fontWeight:800, color:'#DC2626', background:'#FEE2E2', padding:'2px 8px', borderRadius:7 }}>
                      <Droplets size={10} /> {p.sangre}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <StatusDot active={p.estado==='Activo'} />
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:6 }}>
                      <Link to={`/patients/${p.id}`} className="pts-btn" style={{ width:30, height:30, borderRadius:8, background:'#EEF3FA', color:'#1047A9' }}><Eye size={13} /></Link>
                      <button onClick={() => openEditPanel(p)} className="pts-btn" style={{ width:30, height:30, borderRadius:8, background:'#F5F8FC', color:'#4E6B8C' }}><Pencil size={13} /></button>
                      <button onClick={() => setDelTarget(p)} className="pts-btn" style={{ width:30, height:30, borderRadius:8, background:'#FEE2E2', color:'#DC2626' }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', borderTop:'1.5px solid #DDE6F0', flexWrap:'wrap', gap:10 }}>
          <p style={{ fontSize:12, color:'#4E6B8C' }}>
            Mostrando <strong style={{ color:'#0B1F3A' }}>{paginatedData.length}</strong> de <strong style={{ color:'#0B1F3A' }}>{filtered.length}</strong> pacientes
          </p>
          <div style={{ display:'flex', gap:6 }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', opacity:page===1?.4:1, cursor:page===1?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4E6B8C' }}><ChevronLeft size={15} /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
               <button key={i+1} onClick={() => setPage(i+1)} style={{ width:32, height:32, borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border: page===i+1 ? 'none' : '1.5px solid #DDE6F0', background: page===i+1 ? '#1047A9' : '#fff', color: page===i+1 ? '#fff' : '#4E6B8C' }}>{i+1}</button>
            ))}
            <button disabled={page===totalPages || totalPages===0} onClick={() => setPage(p=>p+1)} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', opacity:page===totalPages?.4:1, cursor:page===totalPages?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#4E6B8C' }}><ChevronRight size={15} /></button>
          </div>
        </div>
      </motion.div>

      {/* ══ MODAL: confirmar eliminar ══ */}
      <AnimatePresence>
        {delTarget && (
          <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,31,58,.55)', backdropFilter:'blur(5px)', padding:20 }}>
            <motion.div initial={{ scale:.88, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.88, opacity:0 }} style={{ background:'#fff', borderRadius:20, padding:28, maxWidth:370, width:'100%', boxShadow:'0 24px 60px rgba(11,31,58,.22)' }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}><AlertCircle size={22} color="#DC2626" /></div>
              <h3 style={{ fontSize:18, fontWeight:800, color:'#0B1F3A', marginBottom:8 }}>¿Eliminar paciente?</h3>
              <p style={{ color:'#4E6B8C', lineHeight:1.6, marginBottom:24, fontSize:13 }}>Se eliminará permanentemente el expediente de <strong style={{ color:'#0B1F3A' }}>{delTarget.nombre}</strong>.</p>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setDelTarget(null)} style={{ flex:1, borderRadius:11, border:'1.5px solid #DDE6F0', padding:'11px', fontWeight:700, color:'#4E6B8C', background:'#fff', cursor:'pointer' }}>Cancelar</button>
                <button onClick={() => handleDelete(delTarget.id)} style={{ flex:1, borderRadius:11, border:'none', padding:'11px', fontWeight:700, color:'#fff', background:'#DC2626', cursor:'pointer' }}>Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ PANEL SIMPLIFICADO: FORMULARIO PACIENTES ══ */}
      <AnimatePresence>
        {panelOpen && (
          <div style={{ position:'fixed', inset:0, zIndex:100, display:'flex', background:'rgba(11,31,58,.45)', backdropFilter:'blur(4px)' }}>
            <div style={{ flex:1 }} onClick={() => setPanelOpen(false)} />
            <motion.div 
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }} 
              transition={{ type:'spring', damping:30, stiffness:200 }} 
              className="pts-scroll"
              style={{ width:'100%', maxWidth:500, height:'100%', background:'#fff', display:'flex', flexDirection:'column', overflowY:'auto' }}
            >
              {/* Head */}
              <div style={{ padding:'22px 24px 18px', borderBottom:'1.5px solid #DDE6F0', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:10 }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:700, color:'#0B1F3A' }}>{isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
                  <p style={{ fontSize:12, color:'#4E6B8C', marginTop:2 }}>Completa los datos del registro</p>
                </div>
                {/* ── AQUÍ ESTÁ LA CORRECCIÓN ── */}
                <button onClick={() => setPanelOpen(false)} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:32, height:32, borderRadius:8, border:'1.5px solid #DDE6F0', background:'#fff', cursor:'pointer' }}><X size={15} /></button>
              </div>

              {/* Form Content */}
              <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:20, flex:1 }}>
                <SectionDivider icon={FileText} label="Datos Personales" />
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  
                  <Field label="Nombre" required span={2}>
                    <input className="pts-input-focus" name="nombre" value={form.nombre} onChange={setField} style={inputBase} placeholder="Nombre completo" />
                  </Field>
                  
                  <Field label="Fecha de Nac." required span={1}>
                    <input className="pts-input-focus" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={setField} style={inputBase} />
                  </Field>
                  
                  <Field label="Sexo" required span={1}>
                    <select className="pts-input-focus" name="sexo" value={form.sexo} onChange={setField} style={inputBase}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </Field>

                  <Field label="Teléfono" span={1}>
                    <input className="pts-input-focus" name="telefono" value={form.telefono} onChange={setField} style={inputBase} placeholder="Ej. 555-0101" />
                  </Field>

                  <Field label="Correo" span={1}>
                    <input className="pts-input-focus" name="correo" type="email" value={form.correo} onChange={setField} style={inputBase} placeholder="ejemplo@correo.com" />
                  </Field>

                  <Field label="Dirección" span={2}>
                    <input className="pts-input-focus" name="direccion" value={form.direccion} onChange={setField} style={inputBase} placeholder="Calle, Número, Colonia..." />
                  </Field>

                  <Field label="Tipo de Sangre" span={2}>
                    <select className="pts-input-focus" name="tipo_sangre" value={form.tipo_sangre} onChange={setField} style={inputBase}>
                      {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>

                  <Field label="Alergias" span={2}>
                    <textarea className="pts-input-focus" name="alergias" value={form.alergias} onChange={setField} style={{ ...inputBase, minHeight:70, resize:'none', borderLeft:'4px solid #EF4444' }} placeholder="Especifique si tiene alergias conocidas..." />
                  </Field>

                </div>
              </div>

              {/* Footer */}
              <div style={{ padding:'20px 24px', borderTop:'1.5px solid #DDE6F0', display:'flex', gap:10, position:'sticky', bottom:0, background:'#fff' }}>
                <button onClick={() => setPanelOpen(false)} style={{ flex:1, borderRadius:11, border:'1.5px solid #DDE6F0', padding:'12px', fontWeight:700, fontSize:13, color:'#4E6B8C', background:'#fff', cursor:'pointer' }}>Cancelar</button>
                <button type="button" style={{ flex:2, borderRadius:11, border:'none', padding:'12px', fontWeight:700, fontSize:13, color:'#fff', background:'linear-gradient(135deg,#1047A9,#3D6FC7)', cursor:'pointer', boxShadow:'0 4px 14px rgba(16,71,169,.26)' }}>
                  {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientsPage;
