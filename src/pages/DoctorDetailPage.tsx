import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { getDoctorById, getAppointments } from '../services/api';
import { 
  ChevronLeft, 
  UserRound, 
  Calendar, 
  Pencil, 
  Phone, 
  Mail, 
  Award,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion } from 'motion/react';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  const { data: doctor, loading: loadingDoctor } = useApi(() => getDoctorById(id), [id]);
  const { data: appointments, loading: loadingApts } = useApi(() => getAppointments({ doctorId: id }), [id]);

  if (loadingDoctor) return <div className="animate-pulse space-y-8">
    <div className="h-32 rounded-2xl bg-white" />
    <div className="h-96 rounded-2xl bg-white" />
  </div>;

  const doctorData = doctor || {
    id: 1,
    nombre: 'Elena',
    apellidos: 'García',
    especialidad: 'Cardiología',
    cedula: '1234567',
    telefono: '555-0201',
    email: 'elena.garcia@kurao.com',
    horario: 'Lunes a Viernes 09:00 - 14:00',
    estado: 'Activo',
    biografia: 'Especialista en cardiología intervencionista con más de 10 años de experiencia en el tratamiento de enfermedades cardiovasculares complejas.'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/doctors" className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          <ChevronLeft size={20} />
        </Link>
        <nav className="flex text-sm text-[var(--color-text-muted)]">
          <Link to="/doctors" className="hover:text-[var(--color-primary)]">Médicos</Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-[var(--color-text)]">Dr. {doctorData.nombre} {doctorData.apellidos}</span>
        </nav>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface)] p-8 shadow-sm border border-[var(--color-border)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] font-bold text-3xl">
              {(doctorData.nombre?.charAt(0) || '')}{(doctorData.apellidos?.charAt(0) || '')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[var(--color-text)]">Dr. {doctorData.nombre} {doctorData.apellidos}</h1>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  doctorData.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {doctorData.estado}
                </span>
              </div>
              <p className="text-lg font-semibold text-[var(--color-primary)] mt-1">{doctorData.especialidad}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Cédula Profesional: <span className="font-mono font-bold">{doctorData.cedula}</span></p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-6 py-3 font-bold text-[var(--color-text)] hover:bg-gray-50 transition-all">
            <Pencil size={18} />
            Editar Datos
          </button>
        </div>

        <div className="mt-8 flex border-b border-[var(--color-border)]">
          {[
            { id: 'info', label: 'Información Profesional', icon: Award },
            { id: 'citas', label: 'Citas Asignadas', icon: Calendar },
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
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Biografía</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {doctorData.biografia}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[var(--color-text)]">Contacto</h3>
                  <div className="flex items-center gap-4 rounded-xl bg-[var(--color-bg)] p-4">
                    <Phone className="text-[var(--color-primary)]" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Teléfono</p>
                      <p className="font-medium">{doctorData.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-[var(--color-bg)] p-4">
                    <Mail className="text-[var(--color-primary)]" size={20} />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Email</p>
                      <p className="font-medium">{doctorData.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Disponibilidad</h3>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[var(--color-primary)]">
                      <Clock size={20} />
                    </div>
                    <p className="font-bold text-[var(--color-primary)]">Horario de Atención</p>
                  </div>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {doctorData.horario}
                  </p>
                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-3">Consultorio</p>
                    <p className="text-sm font-semibold">Torre Médica A, Consultorio 402</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Próximas Citas</h3>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    <div className="h-2 w-2 rounded-full bg-blue-500" /> Programadas
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    <div className="h-2 w-2 rounded-full bg-green-500" /> Completadas
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                      <th className="pb-4">Paciente</th>
                      <th className="pb-4">Fecha</th>
                      <th className="pb-4">Hora</th>
                      <th className="pb-4">Motivo</th>
                      <th className="pb-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {[
                      { id: 1, paciente: 'Juan Pérez', fecha: '2024-03-20', hora: '09:00 AM', motivo: 'Chequeo General', estado: 'Programada' },
                      { id: 2, paciente: 'María López', fecha: '2024-03-20', hora: '10:30 AM', motivo: 'Seguimiento', estado: 'Completada' },
                      { id: 3, paciente: 'Ana Beltrán', fecha: '2024-03-21', hora: '12:00 PM', motivo: 'Urgencia', estado: 'Programada' },
                    ].map((apt) => (
                      <tr key={apt.id} className="text-sm transition-colors hover:bg-gray-50">
                        <td className="py-4 font-medium">{apt.paciente}</td>
                        <td className="py-4">{apt.fecha}</td>
                        <td className="py-4">{apt.hora}</td>
                        <td className="py-4">{apt.motivo}</td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                            apt.estado === 'Programada' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
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
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
