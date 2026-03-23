import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getPatientById, getMedicalHistory, getAppointments } from '../services/api';
import { 
  ChevronLeft, 
  User, 
  Calendar, 
  ClipboardList, 
  Pencil, 
  Phone, 
  Mail, 
  MapPin, 
  Droplet,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

const PatientDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('general');

  const { data: patient, loading: loadingPatient } = useApi(() => getPatientById(id), [id]);
  const { data: history, loading: loadingHistory } = useApi(() => getMedicalHistory(id), [id]);
  const { data: appointments, loading: loadingApts } = useApi(() => getAppointments({ patientId: id }), [id]);

  if (loadingPatient) return <div className="animate-pulse space-y-8">
    <div className="h-32 rounded-2xl bg-white" />
    <div className="h-96 rounded-2xl bg-white" />
  </div>;

  const patientData = patient || {
    id: 1,
    expediente: 'EXP-001',
    nombre: 'Juan Pérez',
    apellidos: 'García',
    fecha_nacimiento: '1979-05-15',
    sexo: 'Masculino',
    telefono: '555-0101',
    email: 'juan.perez@email.com',
    direccion: 'Calle Falsa 123, Col. Centro, CDMX',
    tipo_sangre: 'O+',
    alergias: 'Penicilina, Polen',
    notas: 'Paciente con hipertensión controlada.',
    estado: 'Activo'
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patients" className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          <ChevronLeft size={20} />
        </Link>
        <nav className="flex text-sm text-[var(--color-text-muted)]">
          <Link to="/patients" className="hover:text-[var(--color-primary)]">Pacientes</Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-[var(--color-text)]">{patientData.nombre} {patientData.apellidos}</span>
        </nav>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface)] p-8 shadow-sm border border-[var(--color-border)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100 text-[var(--color-primary)] font-bold text-2xl">
              {(patientData.nombre?.charAt(0) || '')}{(patientData.apellidos?.charAt(0) || '')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[var(--color-text)]">{patientData.nombre} {patientData.apellidos}</h1>
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {patientData.estado}
                </span>
              </div>
              <p className="text-[var(--color-text-muted)] font-mono mt-1">Expediente: <span className="font-bold text-[var(--color-primary)]">{patientData.expediente}</span> • {calculateAge(patientData.fecha_nacimiento)} años</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 font-bold text-[var(--color-text)] hover:bg-gray-50 transition-all">
            <Pencil size={18} />
            Editar Perfil
          </button>
        </div>

        <div className="mt-8 flex border-b border-[var(--color-border)]">
          {[
            { id: 'general', label: 'Información General', icon: User },
            { id: 'citas', label: 'Citas', icon: Calendar },
            { id: 'historial', label: 'Historial Clínico', icon: ClipboardList },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Datos de contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl bg-[var(--color-bg)] p-4">
                    <Phone className="text-[var(--color-primary)]" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Teléfono</p>
                      <p className="font-medium">{patientData.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-[var(--color-bg)] p-4">
                    <Mail className="text-[var(--color-primary)]" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Email</p>
                      <p className="font-medium">{patientData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-[var(--color-bg)] p-4">
                    <MapPin className="text-[var(--color-primary)]" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Dirección</p>
                      <p className="font-medium">{patientData.direccion}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Información Médica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-[var(--color-bg)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplet className="text-red-500" size={16} />
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Tipo de Sangre</p>
                    </div>
                    <p className="text-xl font-bold">{patientData.tipo_sangre}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--color-bg)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="text-[var(--color-warning)]" size={16} />
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Alergias</p>
                    </div>
                    <p className="text-sm font-medium">{patientData.alergias}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-[var(--color-primary)] uppercase mb-2">Notas Médicas</p>
                  <p className="text-sm text-[var(--color-text)]">{patientData.notas}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Historial de Citas</h3>
                <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white">
                  <Plus size={16} /> Nueva Cita
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                      <th className="pb-4">Fecha</th>
                      <th className="pb-4">Médico</th>
                      <th className="pb-4">Motivo</th>
                      <th className="pb-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {[
                      { id: 1, fecha: '2024-03-10', medico: 'Dra. García', motivo: 'Chequeo General', estado: 'Completada' },
                      { id: 2, fecha: '2024-04-05', medico: 'Dr. Martínez', motivo: 'Seguimiento Hipertensión', estado: 'Programada' },
                    ].map((apt) => (
                      <tr key={apt.id} className="text-sm">
                        <td className="py-4 font-medium">{apt.fecha}</td>
                        <td className="py-4">{apt.medico}</td>
                        <td className="py-4">{apt.motivo}</td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                            apt.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {apt.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Consultas Médicas</h3>
                <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white">
                  <Plus size={16} /> Agregar Consulta
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { id: 1, fecha: '10 Mar 2024', medico: 'Dra. García', diagnostico: 'Faringitis aguda', tratamiento: 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.' },
                  { id: 2, fecha: '15 Ene 2024', medico: 'Dr. Martínez', diagnostico: 'Control de Hipertensión', tratamiento: 'Continuar con Enalapril 10mg diario. Dieta baja en sodio.' },
                ].map((record) => (
                  <div key={record.id} className="rounded-2xl border border-[var(--color-border)] p-6 transition-all hover:border-[var(--color-primary)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[var(--color-text-muted)]">
                          <ClipboardList size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--color-text)]">{record.fecha}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Atendido por: <span className="font-semibold text-[var(--color-primary)]">{record.medico}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Diagnóstico</p>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{record.diagnostico}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Tratamiento</p>
                        <p className="text-sm text-[var(--color-text-muted)]">{record.tratamiento}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;
