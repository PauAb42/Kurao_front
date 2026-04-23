import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import {
  getPatientById,
  getMedicalHistory,
  getAppointments,
  updatePatient,
  createAppointment,
  createMedicalRecord,
  getDoctors
} from '../services/api';
import {
  ChevronLeft, User, Calendar, ClipboardList, Pencil,
  Phone, Mail, MapPin, Droplets, AlertTriangle, Plus,
  Download, FileText, CheckCircle, X, Stethoscope,
  Activity, Heart, ShieldCheck, Clock, Pill,
  Thermometer, Loader2, ChevronDown, ChevronUp, Weight, Ruler,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ─────────────────────────────────────────
   FONTS & STYLES
───────────────────────────────────────── */
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap';

if (typeof document !== 'undefined' && !document.getElementById('pd-fonts')) {
  const link = document.createElement('link');
  link.id = 'pd-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_LINK;
  document.head.appendChild(link);
}

const STYLES = `
  .pd-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .pd-serif  { font-family: 'DM Serif Display', serif; }
  .pd-tab { transition: all .18s; cursor: pointer; border: none; background: none; white-space: nowrap; flex-shrink: 0; }
  .pd-tab:hover { color: #1047A9 !important; }
  .pd-info-row:hover { background: #F4F7FB !important; }
  .pd-record { transition: border-color .2s, box-shadow .2s; background: #fff; cursor: pointer; }
  .pd-record:hover { border-color: #1047A9 !important; box-shadow: 0 6px 24px rgba(16,71,169,.1) !important; }
  .pd-apt-row { transition: background .13s; border-bottom: 1px solid #EEF3FA; }
  .pd-apt-row:hover { background: #F4F7FB; }
  .pd-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
  .pd-scroll::-webkit-scrollbar-thumb { background: #DDE6F0; border-radius: 10px; }
  .pd-input-focus:focus { border-color: #1047A9 !important; outline: none; box-shadow: 0 0 0 3px rgba(16,71,169,.1); }
  .pd-save-btn { transition: transform .15s, box-shadow .15s; }
  .pd-save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,71,169,.3) !important; }
  .pd-vital { transition: box-shadow .15s; }
  .pd-vital:hover { box-shadow: 0 4px 16px rgba(16,71,169,.1); }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin { animation: spin 1s linear infinite; display:inline-flex; }

  /* ─────────────────────────────────────────
     RESPONSIVE UTILITY CLASSES
  ───────────────────────────────────────── */
  @media (max-width: 900px) {
    .pd-header-wrap { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
    .pd-action-btns { width: 100%; justify-content: flex-start; }
  }
  @media (max-width: 768px) {
    .pd-vitals-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .pd-grid-2-mobile { grid-template-columns: 1fr !important; }
    .pd-p-mobile { padding: 16px !important; }
    .pd-tabs-container { padding: 0 16px !important; }
    .pd-modal-content { padding: 16px !important; }
    .pd-record-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
    .pd-record-header-actions { align-self: flex-end; margin-top: -24px; }
  }
  @media (max-width: 480px) {
    .pd-vitals-grid { grid-template-columns: 1fr !important; }
    .pd-avatar-wrap { flex-direction: column !important; align-items: center !important; text-align: center; width: 100%; gap: 12px !important; }
    .pd-action-btns { flex-direction: column; width: 100%; }
    .pd-action-btns button { width: 100%; justify-content: center; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('pd-styles-v4')) {
  const el = document.createElement('style');
  el.id = 'pd-styles-v4'; el.textContent = STYLES;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const calcAge = (dob) => {
  if (!dob) return '—';
  const today = new Date();
  const b = new Date(dob);
  let age = today.getFullYear() - b.getFullYear();
  if (
    today.getMonth() - b.getMonth() < 0 ||
    (today.getMonth() - b.getMonth() === 0 && today.getDate() < b.getDate())
  ) age--;
  return age;
};

const formatDate = (dob) => {
  if (!dob) return '—';
  const b = new Date(dob);
  return b.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
};

const inputBase = {
  width: '100%', borderRadius: 11, border: '1.5px solid #DDE6F0',
  padding: '10px 13px', fontSize: 13, color: '#0B1F3A',
  background: '#FAFBFD', fontFamily: 'DM Sans, sans-serif',
};

const Field = ({ label, required, children, span = 1 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: `span ${span}` }}>
    <label style={{ fontSize: 10, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.5px' }}>
      {label}{required && <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>}
    </label>
    {children}
  </div>
);

const SectionDivider = ({ label, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 8 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(16,71,169,.08)', color: '#1047A9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {Icon && <Icon size={13} />}
    </div>
    <span style={{ fontSize: 10, fontWeight: 800, color: '#1047A9', textTransform: 'uppercase', letterSpacing: '.8px', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: '#DDE6F0' }} />
  </div>
);

/* ── Status chip con la paleta correcta ── */
const StatusChip = ({ status }) => {
  const map = {
    Completada: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    Programada: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    Cancelada:  { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
    Pendiente:  { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    Activo:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
    Inactivo:   { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', dot: '#9CA3AF' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

const VitalCard = ({ icon: Icon, label, value, unit, color }) => (
  <div className="pd-vital" style={{
    background: '#fff', borderRadius: 13, padding: '14px 16px',
    border: '1.5px solid #DDE6F0', display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} />
    </div>
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.4px', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: '#0B1F3A', margin: 0, lineHeight: 1.2 }}>
        {value || <span style={{ color: '#CBD5E1' }}>—</span>}
        {value && <span style={{ fontSize: 11, fontWeight: 500, color: '#4E6B8C', marginLeft: 3 }}>{unit}</span>}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   jsPDF LOADER
───────────────────────────────────────── */
const loadJsPDF = () => new Promise((resolve, reject) => {
  if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = () => resolve(window.jspdf.jsPDF);
  s.onerror = reject;
  document.head.appendChild(s);
});

/* ─────────────────────────────────────────
   PDF GENERATOR
───────────────────────────────────────── */
const generatePDF = async (patient, history, appointments) => {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210; const M = 16; const CW = PW - M * 2;
  let y = 0;

  const navy  = [11, 31, 58];   const blue  = [16, 71, 169];
  const mint  = [0, 168, 141];  const slate = [78, 107, 140];
  const line  = [221, 230, 240]; const white = [255, 255, 255];
  const mist  = [238, 243, 250]; const red   = [220, 38, 38];
  const green = [5, 150, 105];  const amber = [217, 119, 6];
  const bg    = [248, 250, 253];

  const rgb  = (c) => doc.setTextColor(...c);
  const fill = (c) => doc.setFillColor(...c);
  const draw = (c) => doc.setDrawColor(...c);
  const lw   = (w) => doc.setLineWidth(w);
  const t    = (str, x, yy, opts) => doc.text(String(str ?? '—'), x, yy, opts);

  const addPageBranding = () => {
    fill(navy); doc.rect(0, 0, PW, 12, 'F');
    fill(mint); doc.rect(0, 12, PW, 1.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); rgb(white);
    t('Kurao', M, 8.5);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); rgb([160, 185, 210]);
    t('Expediente Médico', M + 22, 8.5);
    rgb(mint); doc.setFont('helvetica', 'bold');
    t(patient.expediente || '—', PW - M, 8.5, { align: 'right' });
    y = 20;
  };

  const sectionHead = (title) => {
    if (y > 255) { doc.addPage(); addPageBranding(); }
    y += 5;
    fill(blue); doc.roundedRect(M, y, CW, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); rgb(white);
    t(title.toUpperCase(), M + 5, y + 6.2);
    y += 14;
  };

  const infoGrid = (pairs) => {
    const colW = CW / 2 - 4;
    const rows = Math.ceil(pairs.length / 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        const idx = r * 2 + c;
        if (idx >= pairs.length) continue;
        const x = M + c * (colW + 8);
        const yy = y + r * 16;
        fill((r + c) % 2 === 0 ? bg : white); draw(line); lw(0.2);
        doc.rect(x, yy, colW, 13, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); rgb(slate);
        t(pairs[idx][0].toUpperCase(), x + 3, yy + 5);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); rgb(navy);
        const val = doc.splitTextToSize(String(pairs[idx][1] || '—'), colW - 6);
        t(val[0], x + 3, yy + 11);
      }
    }
    y += rows * 16 + 4;
  };

  /* PAGE 1 — HEADER */
  fill(navy); doc.rect(0, 0, PW, 44, 'F');
  fill(mint); doc.rect(0, 44, PW, 2.5, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); rgb(white); t('Kurao', M, 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); rgb([160, 185, 210]);
  t('Sistema de Gestión Hospitalaria', M, 29);
  t('Expediente Médico Oficial  ·  Documento Confidencial', M, 36);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); rgb(mint);
  t(patient.expediente || 'EXP-001', PW - M, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); rgb([160, 185, 210]);
  const dateStr = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  t(`Generado el ${dateStr}`, PW - M, 26, { align: 'right' });
  t('Uso interno del personal médico', PW - M, 33, { align: 'right' });
  y = 54;

  /* PATIENT BANNER */
  fill(mist); draw(line); lw(0.3); doc.roundedRect(M, y, CW, 36, 4, 4, 'FD');
  fill(blue); doc.circle(M + 18, y + 18, 13, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); rgb(white);
  const ini = `${(patient.nombre || '').charAt(0)}${(patient.apellidos || '').charAt(0)}`;
  t(ini, M + 18, y + 22, { align: 'center' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); rgb(navy);
  t(`${patient.nombre || ''} ${patient.apellidos || ''}`, M + 36, y + 13);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); rgb(slate);
  t(
    `${calcAge(patient.fecha_nacimiento)} años  ·  ${patient.sexo || ''}  ·  Nacido: ${formatDate(patient.fecha_nacimiento)}`,
    M + 36, y + 21
  );
  t(`Exp: ${patient.expediente || '—'}  ·  CURP: ${patient.curp || '—'}`, M + 36, y + 28);
  t(`${patient.telefono || '—'}  ·  ${patient.email || '—'}`, M + 36, y + 34.5);
  fill(red); doc.roundedRect(PW - M - 24, y + 11, 20, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); rgb(white);
  t(patient.tipo_sangre || 'O+', PW - M - 14, y + 20, { align: 'center' });
  y += 46;

  /* SIGNOS VITALES */
  sectionHead('Signos Vitales Recientes');
  const vitals = [
    { label: 'Peso', value: patient.peso, unit: 'kg', color: blue },
    { label: 'Altura', value: patient.altura, unit: 'cm', color: mint },
    { label: 'Presión Art.', value: patient.presion, unit: 'mmHg', color: red },
    { label: 'Temperatura', value: patient.temp, unit: '°C', color: amber },
  ];
  const vW = CW / 4 - 3;
  vitals.forEach((v, i) => {
    const x = M + i * (vW + 4);
    fill(mist); draw(line); lw(0.3); doc.roundedRect(x, y, vW, 20, 2.5, 2.5, 'FD');
    fill(v.color); doc.rect(x, y, vW, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); rgb(slate);
    t(v.label.toUpperCase(), x + 3, y + 10);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); rgb(navy);
    t(v.value || '—', x + 3, y + 17);
    if (v.value) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); rgb(slate);
      t(v.unit, x + 3 + doc.getTextWidth(String(v.value)) + 2, y + 17);
    }
  });
  y += 26;

  /* DATOS PERSONALES */
  sectionHead('Datos Personales');
  infoGrid([
    ['Nombre completo', `${patient.nombre || ''} ${patient.apellidos || ''}`],
    ['Fecha de nacimiento', formatDate(patient.fecha_nacimiento)],
    ['Edad', `${calcAge(patient.fecha_nacimiento)} años`],
    ['Sexo', patient.sexo || '—'],
    ['CURP / ID', patient.curp || '—'],
    ['Ocupación', patient.ocupacion || '—'],
  ]);

  /* CONTACTO */
  sectionHead('Información de Contacto');
  infoGrid([
    ['Teléfono', patient.telefono || '—'],
    ['Correo electrónico', patient.email || '—'],
    ['Contacto de emergencia', patient.contactoEmergencia || '—'],
    ['Tel. emergencia', patient.telEmergencia || '—'],
  ]);

  /* INFORMACIÓN MÉDICA */
  sectionHead('Antecedentes y Alertas Médicas');
  if (patient.alergias) {
    fill([254, 242, 242]); draw([254, 202, 202]); lw(0.4);
    doc.roundedRect(M, y, CW, 14, 2.5, 2.5, 'FD');
    fill(red); doc.rect(M, y, 3, 14, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); rgb(red);
    t('ALERTA DE ALERGIAS:', M + 6, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); rgb(navy);
    t(patient.alergias, M + 6, y + 11.5);
    y += 18;
  }
  infoGrid([
    ['Tipo de sangre', patient.tipo_sangre || '—'],
    ['Antecedentes patológicos', patient.antecedentes || 'Sin antecedentes registrados'],
    ['Medicamentos actuales', patient.medicamentos || 'Sin medicamentos registrados'],
  ]);
  if (patient.notas) {
    fill([239, 246, 255]); draw([191, 219, 254]); lw(0.3);
    const nl = doc.splitTextToSize(patient.notas, CW - 14);
    const nh = nl.length * 5 + 14;
    doc.roundedRect(M, y, CW, nh, 2.5, 2.5, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); rgb(blue);
    t('NOTAS DEL EXPEDIENTE', M + 5, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); rgb(navy);
    doc.text(nl, M + 5, y + 14);
    y += nh + 6;
  }

  /* PAGE 2 — HISTORIAL */
  if (history && history.length > 0) {
    doc.addPage(); addPageBranding();
    sectionHead('Historial de Consultas Médicas');
    history.forEach((rec, i) => {
      if (y > 240) { doc.addPage(); addPageBranding(); }
      const hasNotas = !!rec.notas;
      const recH = hasNotas ? 64 : 52;
      fill(i % 2 === 0 ? bg : white); draw(line); lw(0.3);
      doc.roundedRect(M, y, CW, recH, 3, 3, 'FD');
      fill(blue); doc.rect(M, y, 3.5, recH, 'F');
      fill(mist); doc.roundedRect(M + 7, y + 5, 36, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); rgb(blue);
      t(rec.fecha || '—', M + 25, y + 11, { align: 'center' });
      doc.setFontSize(7.5); rgb(slate); doc.setFont('helvetica', 'normal');
      t(rec.medico || '—', M + 7, y + 20);
      if (rec.especialidad) { rgb([0, 168, 141]); t(`· ${rec.especialidad}`, M + 7 + doc.getTextWidth((rec.medico || '') + ' '), y + 20); }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); rgb(navy);
      t(rec.diagnostico || '—', M + 48, y + 11);
      if (rec.tratamiento) {
        fill([248, 250, 253]); draw(line); lw(0.2);
        doc.rect(M + 48, y + 14, CW - 52, 14, 'FD');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); rgb(blue);
        t('TRATAMIENTO', M + 51, y + 20);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); rgb(navy);
        const tl = doc.splitTextToSize(rec.tratamiento, CW - 60);
        t(tl[0], M + 51, y + 26);
      }
      if (rec.medicamentos) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); rgb(mint);
        t('MED: ', M + 48, y + 33);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); rgb(navy);
        t(rec.medicamentos, M + 48 + doc.getTextWidth('MED: ') + 1, y + 33);
      }
      if (hasNotas) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); rgb(amber);
        t('NOTAS: ', M + 48, y + 43);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); rgb(navy);
        const notaLine = doc.splitTextToSize(rec.notas, CW - 60);
        t(notaLine[0], M + 48 + doc.getTextWidth('NOTAS: ') + 1, y + 43);
      }
      y += recH + 4;
    });
  }

  /* PAGE 3 — CITAS */
  if (appointments && appointments.length > 0) {
    doc.addPage(); addPageBranding();
    sectionHead('Agenda de Citas');
    fill(navy); doc.rect(M, y, CW, 9, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); rgb(white);
    const cols = ['Fecha', 'Hora', 'Médico', 'Motivo', 'Estado'];
    const colX = [M + 3, M + 30, M + 56, M + 110, M + 162];
    cols.forEach((c, i) => t(c, colX[i], y + 6.2));
    y += 9;
    appointments.forEach((apt, i) => {
      if (y > 265) { doc.addPage(); addPageBranding(); }
      fill(i % 2 === 0 ? mist : white); draw(line); lw(0.15);
      doc.rect(M, y, CW, 9, 'FD');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); rgb(navy);
      t(apt.fecha || '—', colX[0], y + 6.2);
      t(apt.hora  || '—', colX[1], y + 6.2);
      t(apt.medico || '—', colX[2], y + 6.2);
      const motivo = doc.splitTextToSize(apt.motivo || '—', 48);
      t(motivo[0], colX[3], y + 6.2);
      const sc = { Completada: green, Programada: amber, Cancelada: red };
      rgb(sc[apt.estado] || slate);
      doc.setFont('helvetica', 'bold');
      t(apt.estado || '—', colX[4], y + 6.2);
      y += 9;
    });
  }

  /* FOOTERS */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    fill(navy); doc.rect(0, 286, PW, 11, 'F');
    fill(mint); doc.rect(0, 286, PW, 1, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); rgb([160, 185, 210]);
    t('Kurao — Sistema de Gestión Hospitalaria  ·  Documento confidencial de uso médico exclusivo', M, 293);
    rgb(mint); doc.setFont('helvetica', 'bold');
    t(`Pág. ${p} / ${total}`, PW - M, 293, { align: 'right' });
  }

  const safeName = `${patient?.nombre || 'Paciente'}_${patient?.apellidos || ''}`.replace(/\s+/g, '_');
  doc.save(`Kurao_${safeName}_${patient?.expediente || 'EXP'}.pdf`);
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const PatientDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const canCreateHistory = user?.role === 'admin' || user?.role === 'doctor';
  const [activeTab, setActiveTab]       = useState('general');
  const [editPanelOpen, setEditOpen]    = useState(false);
  const [modalType, setModalType]       = useState(null);
  const [isSaving, setIsSaving]         = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [pdfState, setPdfState]         = useState('idle');
  const [expandedRecord, setExpanded]   = useState(null);
  const [toast, setToast]               = useState({ show: false, message: '', type: 'success' });
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const { data: patient,        loading: loadingPt, refetch: refetchPt }  = useApi(() => getPatientById(id), [id]);
  const { data: historyData,     refetch: refetchHistory }                 = useApi(() => getMedicalHistory(id), [id]);
  const { data: appointmentsData, refetch: refetchApts }                   = useApi(() => getAppointments({ patientId: id }), [id]);
  const { data: doctorsData }                                              = useApi(() => getDoctors(), []);
  const doctors = Array.isArray(doctorsData) ? doctorsData : [];

  /* ── MOCK DATA SIMULADA PARA PREVISUALIZACIÓN COMPLETA ── */
  const mockPatientFallback = {
    expediente: 'EXP-001',
    nombre: 'Juan',
    apellidos: 'Pérez',
    fecha_nacimiento: '1985-08-12',
    sexo: 'Masculino',
    curp: 'PEGJ850812HDFRRR07',
    ocupacion: 'Ingeniero de Software',
    telefono: '(618) 123-4567',
    email: 'juan.perez@example.com',
    direccion: 'Av. 20 de Noviembre 123, Zona Centro, Durango, Dgo.',
    contactoEmergencia: 'María Elena García (Madre)',
    telEmergencia: '(618) 987-6543',
    tipo_sangre: 'O+',
    alergias: 'Penicilina, Ácaros',
    antecedentes: 'Hipertensión arterial diagnosticada en 2021, controlada. Apendicectomía en 2010. Padre con Diabetes tipo 2.',
    medicamentos: 'Losartán 50mg cada 24 hrs.',
    peso: '78.5',
    altura: '176',
    presion: '120/80',
    temp: '36.5',
    notas: 'Paciente acude a chequeo regular. Se reporta con buena adherencia al tratamiento antihipertensivo. Próxima revisión sugerida en 6 meses con perfil lipídico.',
    estado: 'Activo',
  };

  const displayPatient = patient || mockPatientFallback;

  const [editForm, setEditForm] = useState({
    nombre: '', apellidos: '', fecha_nacimiento: '', sexo: 'Masculino', curp: '', ocupacion: '',
    telefono: '', email: '', direccion: '', contactoEmergencia: '', telEmergencia: '',
    tipo_sangre: 'O+', alergias: '', antecedentes: '', medicamentos: '',
    peso: '', altura: '', presion: '', temp: '', notas: '',
  });

  const setField = (e) => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const [appointmentForm, setAppointmentForm] = useState({
    id_medico: '', fecha_cita: '', hora_cita: '', motivo: '', estado: 'Programada',
  });
  const [historyForm, setHistoryForm] = useState({
    id_cita: '', medico_id: '', fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', medicamentos: '', notas: '', proxima_cita: '',
  });

  useEffect(() => {
    // Inicializar el formulario con los datos reales del paciente o los datos simulados si está vacío
    setEditForm({ ...displayPatient });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient]);

  const displayHistory = historyData?.records || [
    {
      id: 1, fecha: '10 Mar 2026', hora: '09:30 AM',
      medico: 'Dra. Elena García', especialidad: 'Medicina General',
      diagnostico: 'Faringitis Bacteriana Aguda',
      treatment: 'Reposo relativo 48h. Dieta blanda. Hidratación abundante. Retornar si fiebre persiste más de 72h.',
      medicamentos: 'Amoxicilina 500mg c/8h × 7 días · Paracetamol 500mg c/6h (PRN)',
      notas: 'Cultivo faríngeo positivo para Streptococcus pyogenes. Sin complicaciones.',
    },
    {
      id: 2, fecha: '15 Ene 2026', hora: '11:00 AM',
      medico: 'Dr. Ricardo Martínez', especialidad: 'Cardiología',
      diagnostico: 'Control de Hipertensión Arterial',
      treatment: 'Continuar con Losartán 50mg diario. Dieta baja en sodio (<2g/día). Actividad física moderada 30 min/día.',
      medicamentos: 'Losartán 50mg/día · Atorvastatina 20mg/noche',
      notas: 'PA: 128/84 mmHg. ECG sin alteraciones. Próximo control en 3 meses con laboratorios.',
    },
    {
      id: 3, fecha: '02 Sep 2025', hora: '10:15 AM',
      medico: 'Dr. Ricardo Martínez', especialidad: 'Cardiología',
      diagnostico: 'Ajuste de Tratamiento — Hipertensión',
      treatment: 'Incremento de dosis de Losartán 50mg → 75mg/día. Continuar con estatinas sin cambios.',
      medicamentos: 'Losartán 75mg/día · Atorvastatina 20mg/noche',
      notas: 'PA elevada en última semana (138/90 mmHg). Laboratorios de control solicitados: BH, QS, perfil lipídico.',
    },
  ];

  const displayApts = appointmentsData?.appointments || [
    { id: 1, fecha: '20 Abr 2026', hora: '10:00 AM', medico: 'Dr. Ricardo Martínez', motivo: 'Revisión Mensual de Hipertensión', estado: 'Programada' },
    { id: 2, fecha: '10 Mar 2026', hora: '09:30 AM', medico: 'Dra. Elena García',    motivo: 'Dolor de garganta y fiebre',       estado: 'Completada' },
    { id: 3, fecha: '15 Ene 2026', hora: '11:00 AM', medico: 'Dr. Ricardo Martínez', motivo: 'Control Cardiovascular',              estado: 'Completada' },
    { id: 4, fecha: '05 Nov 2025', hora: '08:45 AM', medico: 'Dra. Elena García',    motivo: 'Chequeo preventivo anual',            estado: 'Cancelada'  },
  ];

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try { await updatePatient(id, editForm); setEditOpen(false); refetchPt(); }
    catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try { await updatePatient(id, { notas: editForm.notas }); refetchPt(); }
    catch (err) { console.error(err); } finally { setIsSavingNotes(false); }
  };

  const handleActionSubmit = async (type) => {
    if (type === 'cita') {
      if (!appointmentForm.id_medico || !appointmentForm.fecha_cita || !appointmentForm.hora_cita || !appointmentForm.motivo) {
        showToast('Por favor completa todos los campos requeridos.', 'error');
        return;
      }
    } else {
      if (!historyForm.medico_id || !historyForm.fecha || !historyForm.diagnostico) {
        showToast('Médico, fecha y diagnóstico son requeridos.', 'error');
        return;
      }
    }
    setIsSaving(true);
    try {
      if (type === 'cita') {
        await createAppointment({
          paciente_id: Number(id),
          medico_id: Number(appointmentForm.id_medico),
          fecha: appointmentForm.fecha_cita,
          hora: appointmentForm.hora_cita,
          motivo: appointmentForm.motivo,
        });
        showToast('Cita agendada correctamente.', 'success');
      } else {
        await createMedicalRecord(id, {
          medicoId: Number(historyForm.medico_id),
          fecha: historyForm.fecha,
          diagnostico: historyForm.diagnostico,
          tratamiento: historyForm.tratamiento,
          medicamentos: historyForm.medicamentos,
          observaciones: historyForm.notas,
        });
        showToast('Consulta registrada correctamente.', 'success');
      }
      setModalType(null);
      setAppointmentForm({ id_medico: '', fecha_cita: '', hora_cita: '', motivo: '', estado: 'Programada' });
      setHistoryForm({ id_cita: '', medico_id: '', fecha: new Date().toISOString().split('T')[0], diagnostico: '', tratamiento: '', medicamentos: '', notas: '', proxima_cita: '' });
      type === 'cita' ? refetchApts() : refetchHistory();
    } catch (err) {
      console.error(err);
      showToast(err?.message || (type === 'cita' ? 'Error al crear la cita.' : 'Error al registrar la consulta.'), 'error');
    } finally { setIsSaving(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfState('loading');
    try {
      await generatePDF(displayPatient, displayHistory, displayApts);
      setPdfState('done');
      setTimeout(() => setPdfState('idle'), 2500);
    } catch (err) { console.error(err); setPdfState('idle'); }
  };

  if (loadingPt) return (
    <div className="pd-root" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[100, 380].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 18, background: '#EEF3FA' }} />
      ))}
    </div>
  );

  const tabs = [
    { id: 'general',   label: 'Información General', icon: User },
    { id: 'citas',     label: 'Citas',               icon: Calendar },
    { id: 'historial', label: 'Historial Clínico',   icon: ClipboardList },
  ];



  return (
    <div className="pd-root" style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'fixed', top: 24, right: 24, zIndex: 9999,
              background: '#fff', padding: '14px 18px', borderRadius: 14,
              boxShadow: '0 8px 30px rgba(11,31,58,0.12)', border: '1px solid #DDE6F0',
              borderLeft: toast.type === 'success' ? '4px solid #10B981' : '4px solid #EF4444',
              display: 'flex', alignItems: 'center', gap: 12, minWidth: 300, maxWidth: 400
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: toast.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: toast.type === 'success' ? '#10B981' : '#EF4444', width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }}>
              {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0B1F3A' }}>{toast.type === 'success' ? 'Operación exitosa' : 'Atención requerida'}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#4E6B8C', lineHeight: 1.4 }}>{toast.message}</p>
            </div>
            <button onClick={() => setToast(t => ({ ...t, show: false }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'flex' }}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BREADCRUMB ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: .32 }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        <Link to="/patients" style={{
          width: 36, height: 36, borderRadius: 10, border: '1.5px solid #DDE6F0',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4E6B8C', textDecoration: 'none', flexShrink: 0
        }}>
          <ChevronLeft size={18} />
        </Link>
        <span style={{ fontSize: 13, color: '#4E6B8C' }}>
          <Link to="/patients" style={{ color: '#4E6B8C', textDecoration: 'none', fontWeight: 600 }}>Pacientes</Link>
          <span style={{ margin: '0 6px', color: '#DDE6F0' }}>/</span>
          <strong style={{ color: '#0B1F3A' }}>{displayPatient.nombre} {displayPatient.apellidos}</strong>
        </span>
      </motion.div>

      {/* ── PROFILE CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .06, duration: .4, ease: [.22, 1, .36, 1] }}
        style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #DDE6F0', overflow: 'hidden' }}
      >
        <div style={{ height: 6, background: 'linear-gradient(90deg,#1047A9,#00C9A7)' }} />

        {/* header row */}
        <div className="pd-header-wrap" style={{ padding: '24px 28px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div className="pd-avatar-wrap" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* avatar */}
            <div style={{
              width: 68, height: 68, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#fff',
              boxShadow: '0 6px 22px rgba(16,71,169,.26)',
            }}>
              {(displayPatient.nombre || '').charAt(0)}{(displayPatient.apellidos || '').charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: 24, color: '#0B1F3A', lineHeight: 1.15, margin: 0, marginBottom: 8, fontWeight: 800 }}>
                {displayPatient.nombre} {displayPatient.apellidos}
              </h1>
              <span style={{ fontSize: 13, background: '#F3F4F6', color: '#374151', padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
                {calcAge(displayPatient.fecha_nacimiento)} años
              </span>
            </div>
          </div>

          {/* action buttons */}
          <div className="pd-action-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
            <button onClick={() => setEditOpen(true)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              border: '1.5px solid #DDE6F0', borderRadius: 11, padding: '9px 18px',
              background: '#fff', color: '#4E6B8C', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              <Pencil size={14} /> Editar
            </button>
            <button
              className="pd-save-btn"
              onClick={handleDownloadPDF}
              disabled={pdfState === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: 'none', borderRadius: 11, padding: '9px 20px',
                background: pdfState === 'done'
                  ? 'linear-gradient(135deg,#059669,#10B981)'
                  : 'linear-gradient(135deg,#1047A9,#3D6FC7)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16,71,169,.22)',
                opacity: pdfState === 'loading' ? .75 : 1,
              }}
            >
              {pdfState === 'loading' && <span className="spin"><Loader2 size={14} /></span>}
              {pdfState === 'idle'    && <Download size={14} />}
              {pdfState === 'done'    && <CheckCircle size={14} />}
              {pdfState === 'loading' ? 'Generando…' : pdfState === 'done' ? '¡Descargado!' : 'Expediente PDF'}
            </button>
          </div>
        </div>

        {/* vitals strip */}
        <div className="pd-vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, padding: '18px 28px 0' }}>
          <VitalCard icon={Weight}      label="Peso"    value={displayPatient.peso}    unit="kg"   color="#1047A9" />
          <VitalCard icon={Ruler}       label="Altura"   value={displayPatient.altura}   unit="cm"   color="#00A88D" />
          <VitalCard icon={Heart}       label="Presión" value={displayPatient.presion} unit="mmHg" color="#DC2626" />
          <VitalCard icon={Thermometer} label="Temp."   value={displayPatient.temp}    unit="°C"   color="#D97706" />
        </div>

        {/* TABS */}
        <div className="pd-tabs-container pd-scroll" style={{ display: 'flex', borderBottom: '1.5px solid #DDE6F0', padding: '0 28px', marginTop: 16, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} className="pd-tab" onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '13px 18px',
              borderBottom: activeTab === tab.id ? '2.5px solid #1047A9' : '2.5px solid transparent',
              color: activeTab === tab.id ? '#1047A9' : '#4E6B8C',
              fontSize: 13, fontWeight: 700, marginBottom: -1.5,
            }}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
            className="pd-p-mobile"
            style={{ padding: '24px 28px' }}
          >

            {/* ──── GENERAL ──── */}
            {activeTab === 'general' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
                {/* LEFT col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SectionDivider label="Datos de Contacto" icon={Phone} />
                  {[
                    { icon: Phone,   label: 'Teléfono',            val: displayPatient.telefono },
                    { icon: Mail,    label: 'Correo electrónico',  val: displayPatient.email },
                    { icon: ShieldCheck, label: 'Contacto emergencia', val: displayPatient.contactoEmergencia },
                    { icon: Phone,   label: 'Tel. emergencia',     val: displayPatient.telEmergencia },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="pd-info-row" style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                      borderRadius: 12, background: '#FAFBFD', border: '1px solid #EEF3FA',
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF3FA', color: '#1047A9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.4px', margin: 0 }}>{label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0B1F3A', margin: 0, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val || '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RIGHT col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SectionDivider label="Información Clínica" icon={Droplets} />

                  <div className="pd-grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '14px', border: '1px solid #FCA5A5', textAlign: 'center' }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '.4px', margin: '0 0 4px' }}>Tipo de Sangre</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: '#DC2626', margin: 0 }}>{displayPatient.tipo_sangre}</p>
                    </div>
                    <div style={{ background: '#FFFBEB', borderRadius: 12, padding: '14px', border: '1px solid #FDE68A' }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <AlertTriangle size={10} /> Alergias
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: 0, lineHeight: 1.5 }}>
                        {displayPatient.alergias || 'Ninguna conocida'}
                      </p>
                    </div>
                  </div>

                  {displayPatient.antecedentes && (
                    <div style={{ background: '#F8FAFF', borderRadius: 12, padding: 14, border: '1px solid #DBEAFE' }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#1047A9', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Antecedentes Patológicos</p>
                      <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.7, margin: 0 }}>{displayPatient.antecedentes}</p>
                    </div>
                  )}

                  {displayPatient.medicamentos && (
                    <div style={{ background: '#F0FDF4', borderRadius: 12, padding: 14, border: '1px solid #BBF7D0' }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Pill size={10} /> Medicamentos Actuales
                      </p>
                      <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.7, margin: 0 }}>{displayPatient.medicamentos}</p>
                    </div>
                  )}

                  {/* notas editables */}
                  <div style={{ background: '#F8FAFD', borderRadius: 12, padding: 14, border: '1.5px dashed #DDE6F0' }}>
                    <p style={{ fontSize: 9, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Notas del Expediente</p>
                    <textarea
                      className="pd-input-focus"
                      name="notas"
                      value={editForm.notas || displayPatient.notas || ''}
                      onChange={setField}
                      placeholder="Escribe notas o consideraciones adicionales…"
                      style={{ ...inputBase, minHeight: 80, resize: 'vertical', background: '#fff', marginBottom: 10 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleSaveNotes} disabled={isSavingNotes} style={{
                        background: '#1047A9', color: '#fff', border: 'none', borderRadius: 9,
                        padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        {isSavingNotes ? <span className="spin"><Loader2 size={13} /></span> : <CheckCircle size={13} />}
                        Guardar notas
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──── CITAS ──── */}
            {activeTab === 'citas' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>Agenda de Citas</h3>
                    <p style={{ fontSize: 12, color: '#4E6B8C', marginTop: 3 }}>{displayApts.length} citas registradas</p>
                  </div>
                  <button onClick={() => setModalType('cita')} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
                    border: 'none', borderRadius: 10, padding: '9px 16px',
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(16,71,169,.22)',
                  }}>
                    <Plus size={14} /> Nueva Cita
                  </button>
                </div>
                <div className="pd-scroll" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr style={{ background: '#FAFBFD', borderBottom: '1.5px solid #DDE6F0' }}>
                        {['Fecha', 'Hora', 'Médico', 'Motivo', 'Estado'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: '#4E6B8C', textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayApts.map((apt, idx) => (
                        <motion.tr key={apt.id} className="pd-apt-row"
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * .05 }}
                        >
                          <td style={{ padding: '13px 14px', fontSize: 13, fontWeight: 700, color: '#0B1F3A', whiteSpace: 'nowrap' }}>{apt.fecha}</td>
                          <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4E6B8C' }}>
                              <Clock size={12} /> {apt.hora}
                            </span>
                          </td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#4E6B8C', whiteSpace: 'nowrap' }}>{apt.medico}</td>
                          <td style={{ padding: '13px 14px', fontSize: 13, color: '#4E6B8C' }}>{apt.motivo}</td>
                          <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}><StatusChip status={apt.estado} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ──── HISTORIAL ──── */}
            {activeTab === 'historial' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>Historial de Consultas</h3>
                    <p style={{ fontSize: 12, color: '#4E6B8C', marginTop: 3 }}>{displayHistory.length} consultas registradas</p>
                  </div>
                  {canCreateHistory && (
                    <button onClick={() => setModalType('consulta')} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
                      border: 'none', borderRadius: 10, padding: '9px 16px',
                      color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 3px 12px rgba(16,71,169,.22)',
                    }}>
                      <Plus size={14} /> Registrar Consulta
                    </button>
                  )}
                </div>

                {/* timeline */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,#1047A9,#DDE6F0)', borderRadius: 2, zIndex: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {displayHistory.map((rec, idx) => {
                      const isOpen = expandedRecord === rec.id;
                      return (
                        <motion.div key={rec.id}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * .07 }}
                          style={{ display: 'flex', gap: 16, paddingBottom: 16, position: 'relative', zIndex: 1 }}
                        >
                          {/* dot */}
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

                          {/* card */}
                          <div className="pd-record"
                            onClick={() => setExpanded(isOpen ? null : rec.id)}
                            style={{ flex: 1, borderRadius: 16, border: '1.5px solid #EEF3FA', overflow: 'hidden' }}
                          >
                            {/* card header */}
                            <div className="pd-record-header" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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
                                    <Calendar size={11} /> {rec.fecha}{rec.hora && ` · ${rec.hora}`}
                                  </span>
                                  <span style={{ fontSize: 12, color: '#4E6B8C', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <User size={11} /> {rec.medico}
                                    {rec.especialidad && <span style={{ color: '#1047A9', fontWeight: 600 }}> · {rec.especialidad}</span>}
                                  </span>
                                </div>
                              </div>
                              <div className="pd-record-header-actions" style={{ color: '#4E6B8C', flexShrink: 0 }}>
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>

                            {/* expanded */}
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }} transition={{ duration: .22 }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="pd-grid-2-mobile" style={{ padding: '0 18px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                                    {rec.notas && (
                                      <div style={{ gridColumn: '1 / -1', background: '#FFFBEB', borderRadius: 10, padding: 14, border: '1px solid #FDE68A' }}>
                                        <p style={{ fontSize: 9, fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Notas Clínicas</p>
                                        <p style={{ fontSize: 13, color: '#0B1F3A', lineHeight: 1.6, margin: 0 }}>{rec.notas}</p>
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
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ══════════════════════════════════════
          MODALES
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {modalType && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,31,58,.55)', backdropFilter: 'blur(5px)', padding: 20 }}>
            <motion.div
              initial={{ scale: .9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: .9, opacity: 0 }} transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
              className="pd-scroll"
              style={{ background: '#fff', borderRadius: 20, maxWidth: 540, width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 60px rgba(11,31,58,.22)', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: 5, background: 'linear-gradient(90deg,#1047A9,#00C9A7)', flexShrink: 0 }} />
              <div className="pd-modal-content" style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF3FA', color: '#1047A9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {modalType === 'cita' ? <Calendar size={17} /> : <Stethoscope size={17} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                        {modalType === 'cita' ? 'Programar Nueva Cita' : 'Registrar Nueva Consulta'}
                      </h3>
                      <p style={{ fontSize: 12, color: '#4E6B8C', margin: 0 }}>
                        {displayPatient.nombre} {displayPatient.apellidos}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setModalType(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE6F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4E6B8C', flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                  {modalType === 'cita' ? (
                    <>
                      <Field label="Médico Especialista" required>
                        <select className="pd-input-focus" style={inputBase}
                          value={appointmentForm.id_medico}
                          onChange={e => setAppointmentForm({ ...appointmentForm, id_medico: e.target.value })}>
                          <option value="">Seleccionar médico...</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              Dr. {d.nombre} {d.apellidos} — {d.especialidad}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div className="pd-grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <Field label="Fecha" required>
                          <input className="pd-input-focus" type="date" style={inputBase}
                            onChange={e => setAppointmentForm({ ...appointmentForm, fecha_cita: e.target.value })} />
                        </Field>
                        <Field label="Hora" required>
                          <input className="pd-input-focus" type="time" style={inputBase}
                            onChange={e => setAppointmentForm({ ...appointmentForm, hora_cita: e.target.value })} />
                        </Field>
                      </div>
                      <Field label="Motivo de la visita" required>
                        <textarea className="pd-input-focus" style={{ ...inputBase, minHeight: 80, resize: 'none' }}
                          placeholder="Describa el motivo de la consulta..."
                          onChange={e => setAppointmentForm({ ...appointmentForm, motivo: e.target.value })} />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Médico que atiende" required>
                        <select className="pd-input-focus" style={inputBase}
                          value={historyForm.medico_id}
                          onChange={e => setHistoryForm({ ...historyForm, medico_id: e.target.value })}>
                          <option value="">Seleccionar médico...</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              Dr. {d.nombre} {d.apellidos} — {d.especialidad}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Fecha de la consulta" required>
                        <input className="pd-input-focus" type="date" style={inputBase}
                          value={historyForm.fecha}
                          onChange={e => setHistoryForm({ ...historyForm, fecha: e.target.value })} />
                      </Field>

                      <Field label="Diagnóstico Clínico" required>
                        <input className="pd-input-focus" type="text" style={inputBase}
                          placeholder="Ej: Hipertensión Arterial Nivel 1"
                          onChange={e => setHistoryForm({ ...historyForm, diagnostico: e.target.value })} />
                      </Field>

                      <Field label="Plan de Tratamiento">
                        <textarea className="pd-input-focus" style={{ ...inputBase, minHeight: 70, resize: 'none' }}
                          placeholder="Indicaciones médicas, reposo, dieta..."
                          onChange={e => setHistoryForm({ ...historyForm, tratamiento: e.target.value })} />
                      </Field>

                      <Field label="Medicamentos / Receta">
                        <textarea className="pd-input-focus" style={{ ...inputBase, minHeight: 60, resize: 'none' }}
                          placeholder="Fármaco, dosis, frecuencia y duración..."
                          onChange={e => setHistoryForm({ ...historyForm, medicamentos: e.target.value })} />
                      </Field>

                      <Field label="Notas Médicas">
                        <textarea className="pd-input-focus" style={{ ...inputBase, minHeight: 60, resize: 'none' }}
                          placeholder="Observaciones clínicas, resultados de laboratorio, hallazgos relevantes..."
                          onChange={e => setHistoryForm({ ...historyForm, notas: e.target.value })} />
                      </Field>

                      <Field label="Próximo Seguimiento">
                        <input className="pd-input-focus" type="date" style={{ ...inputBase, width: '100%' }}
                          onChange={e => setHistoryForm({ ...historyForm, proxima_cita: e.target.value })} />
                      </Field>
                    </>
                  )}
                </div>
              </div>

              <div className="pd-action-btns" style={{ padding: '14px 28px', borderTop: '1.5px solid #DDE6F0', display: 'flex', gap: 10, background: '#fff', flexShrink: 0 }}>
                <button onClick={() => setModalType(null)} style={{ flex: 1, padding: 13, borderRadius: 11, border: '1.5px solid #DDE6F0', background: '#fff', fontWeight: 700, fontSize: 13, color: '#4E6B8C', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={() => handleActionSubmit(modalType)} disabled={isSaving} style={{
                  flex: 2, padding: 13, borderRadius: 11, border: 'none',
                  background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(16,71,169,.24)',
                }}>
                  {isSaving ? <span className="spin"><Loader2 size={16} /></span> : <CheckCircle size={15} />}
                  Guardar en Expediente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          PANEL EDITAR PERFIL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {editPanelOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', background: 'rgba(11,31,58,.45)', backdropFilter: 'blur(4px)' }}>
            <div style={{ flex: 1 }} onClick={() => setEditOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="pd-scroll"
              style={{ width: '100%', maxWidth: 600, height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
            >
              <div style={{ padding: '22px 26px 18px', borderBottom: '1.5px solid #DDE6F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1047A9,#3D6FC7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Pencil size={16} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>Editar Expediente</h2>
                    <p style={{ fontSize: 12, color: '#4E6B8C', margin: 0 }}>{displayPatient.nombre} {displayPatient.apellidos}</p>
                  </div>
                </div>
                <button onClick={() => setEditOpen(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #DDE6F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4E6B8C', flexShrink: 0 }}>
                  <X size={15} />
                </button>
              </div>

              <div className="pd-p-mobile" style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 28, flex: 1 }}>
                <section>
                  <SectionDivider icon={FileText} label="Identificación del Paciente" />
                  <div className="pd-grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Nombre(s)" required><input className="pd-input-focus" name="nombre" value={editForm.nombre} onChange={setField} style={inputBase} /></Field>
                    <Field label="Apellidos" required><input className="pd-input-focus" name="apellidos" value={editForm.apellidos} onChange={setField} style={inputBase} /></Field>
                    <Field label="CURP / ID"><input className="pd-input-focus" name="curp" value={editForm.curp} onChange={setField} style={inputBase} placeholder="PEGJ790515HDFRRL07" /></Field>
                    <Field label="Fecha Nac." required><input className="pd-input-focus" name="fecha_nacimiento" type="date" value={editForm.fecha_nacimiento} onChange={setField} style={inputBase} /></Field>
                    <Field label="Sexo" required>
                      <select className="pd-input-focus" name="sexo" value={editForm.sexo} onChange={setField} style={inputBase}>
                        <option>Masculino</option><option>Femenino</option><option>Otro</option>
                      </select>
                    </Field>
                    <Field label="Ocupación"><input className="pd-input-focus" name="ocupacion" value={editForm.ocupacion} onChange={setField} style={inputBase} /></Field>
                  </div>
                </section>

                <section style={{ background: '#F8FAFD', padding: 16, borderRadius: 16, border: '1px solid #E2E8F0' }}>
                  <SectionDivider icon={Activity} label="Signos Vitales" />
                  <div className="pd-vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    <Field label="Peso (kg)"><input className="pd-input-focus" name="peso" value={editForm.peso} onChange={setField} style={inputBase} placeholder="82.0" /></Field>
                    <Field label="Altura (cm)"><input className="pd-input-focus" name="altura" value={editForm.altura} onChange={setField} style={inputBase} placeholder="175" /></Field>
                    <Field label="Presión Art."><input className="pd-input-focus" name="presion" value={editForm.presion} onChange={setField} style={inputBase} placeholder="120/80" /></Field>
                    <Field label="Temp. (°C)"><input className="pd-input-focus" name="temp" value={editForm.temp} onChange={setField} style={inputBase} placeholder="36.5" /></Field>
                  </div>
                </section>

                <section>
                  <SectionDivider icon={Heart} label="Antecedentes y Alertas" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Tipo de Sangre">
                      <select className="pd-input-focus" name="tipo_sangre" value={editForm.tipo_sangre} onChange={setField} style={{ ...inputBase, width: '100%', maxWidth: '200px' }}>
                        {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Alergias Conocidas">
                      <textarea className="pd-input-focus" name="alergias" value={editForm.alergias} onChange={setField} style={{ ...inputBase, minHeight: 56, resize: 'vertical', borderLeft: '4px solid #EF4444' }} placeholder="Medicamentos, alimentos, etc..." />
                    </Field>
                    <Field label="Antecedentes Patológicos">
                      <textarea className="pd-input-focus" name="antecedentes" value={editForm.antecedentes} onChange={setField} style={{ ...inputBase, minHeight: 72, resize: 'vertical' }} placeholder="Diabetes, hipertensión, cirugías previas..." />
                    </Field>
                    <Field label="Medicamentos Actuales">
                      <textarea className="pd-input-focus" name="medicamentos" value={editForm.medicamentos} onChange={setField} style={{ ...inputBase, minHeight: 56, resize: 'vertical' }} placeholder="Fármaco, dosis, frecuencia..." />
                    </Field>
                  </div>
                </section>

                <section>
                  <SectionDivider icon={ShieldCheck} label="Contacto y Emergencia" />
                  <div className="pd-grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Teléfono Personal"><input className="pd-input-focus" name="telefono" value={editForm.telefono} onChange={setField} style={inputBase} /></Field>
                    <Field label="Email"><input className="pd-input-focus" name="email" value={editForm.email} onChange={setField} style={inputBase} /></Field>
                    <Field label="Contacto Emergencia"><input className="pd-input-focus" name="contactoEmergencia" value={editForm.contactoEmergencia} onChange={setField} style={inputBase} /></Field>
                    <Field label="Tel. Emergencia"><input className="pd-input-focus" name="telEmergencia" value={editForm.telEmergencia} onChange={setField} style={inputBase} /></Field>
                  </div>
                </section>
              </div>

              <div className="pd-action-btns" style={{ padding: '16px 26px', borderTop: '1.5px solid #DDE6F0', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: '#fff' }}>
                <button onClick={() => setEditOpen(false)} style={{ flex: 1, borderRadius: 11, border: '1.5px solid #DDE6F0', padding: '12px', fontWeight: 700, fontSize: 13, color: '#4E6B8C', background: '#fff', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSaveEdit} disabled={isSaving} className="pd-save-btn" style={{
                  flex: 2, borderRadius: 11, border: 'none', padding: '12px', fontWeight: 700, fontSize: 13,
                  color: '#fff', background: 'linear-gradient(135deg,#1047A9,#3D6FC7)',
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,71,169,.26)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {isSaving ? <span className="spin"><Loader2 size={16} /></span> : <CheckCircle size={15} />}
                  Guardar Cambios
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