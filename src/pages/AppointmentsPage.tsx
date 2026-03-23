import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getAppointments, cancelAppointment } from '../services/api';
import { 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  User, 
  UserRound,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AppointmentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmCancel, setConfirmCancel] = useState(null);

  const { data, loading, error, refetch } = useApi(() => getAppointments({ status: filterStatus }), [filterStatus]);

  const appointments = data || [
    { id: 'FOL-101', paciente: 'Juan Pérez', medico: 'Dra. García', fecha: '2024-03-20', hora: '09:00 AM', motivo: 'Chequeo General', estado: 'Programada' },
    { id: 'FOL-102', paciente: 'María López', medico: 'Dr. Martínez', fecha: '2024-03-20', hora: '10:30 AM', motivo: 'Seguimiento', estado: 'Completada' },
    { id: 'FOL-103', paciente: 'Carlos Ruiz', medico: 'Dra. García', fecha: '2024-03-21', hora: '11:15 AM', motivo: 'Consulta', estado: 'Cancelada' },
    { id: 'FOL-104', paciente: 'Ana Beltrán', medico: 'Dr. Sánchez', fecha: '2024-03-21', hora: '12:00 PM', motivo: 'Urgencia', estado: 'Programada' },
  ];

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setConfirmCancel(null);
      refetch();
    } catch (err) {
      alert("Error al cancelar cita: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Citas Médicas</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Programación y seguimiento de consultas</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] active:scale-95"
        >
          <Plus size={20} />
          Nueva Cita
        </button>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por paciente o médico..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-[var(--color-text-muted)]" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
            >
              <option value="all">Todos los estados</option>
              <option value="Programada">Programadas</option>
              <option value="Completada">Completadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                <th className="pb-4 pl-4">Folio</th>
                <th className="pb-4">Paciente</th>
                <th className="pb-4">Médico</th>
                <th className="pb-4">Fecha / Hora</th>
                <th className="pb-4">Motivo</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4 text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                [1,2,3,4].map(i => <tr key={i} className="animate-pulse"><td colSpan={7} className="py-4 h-12 bg-gray-50 rounded-lg mb-2"></td></tr>)
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="text-sm transition-colors hover:bg-gray-50">
                  <td className="py-4 pl-4 font-mono font-bold text-[var(--color-primary)]">{apt.id}</td>
                  <td className="py-4 font-medium">{apt.paciente}</td>
                  <td className="py-4">{apt.medico}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{apt.fecha}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{apt.hora}</span>
                    </div>
                  </td>
                  <td className="py-4 max-w-[200px] truncate">{apt.motivo}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                      apt.estado === 'Programada' ? 'bg-blue-100 text-blue-700' :
                      apt.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {apt.estado}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end gap-2">
                      {apt.estado === 'Programada' && (
                        <>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[var(--color-secondary)] hover:bg-green-100" title="Completar">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => setConfirmCancel(apt)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[var(--color-danger)] hover:bg-red-100" title="Cancelar">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Cita */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Agendar Nueva Cita</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Paciente *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                    <input type="text" placeholder="Buscar paciente..." className="w-full rounded-xl border border-[var(--color-border)] py-3 pl-10 pr-4 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Médico *</label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                    <select className="w-full appearance-none rounded-xl border border-[var(--color-border)] py-3 pl-10 pr-4 outline-none focus:border-[var(--color-primary)] bg-white">
                      <option>Seleccionar médico...</option>
                      <option>Dra. Elena García (Cardiología)</option>
                      <option>Dr. Ricardo Martínez (Pediatría)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Fecha *</label>
                    <input type="date" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Hora *</label>
                    <input type="time" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Motivo de la consulta *</label>
                  <textarea placeholder="Describa brevemente el motivo..." className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] h-24" />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-[var(--color-border)] py-4 font-bold text-[var(--color-text-muted)] hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="button" className="flex-1 rounded-xl bg-[var(--color-primary)] py-4 font-bold text-white shadow-lg hover:bg-[var(--color-primary-dark)]">
                    Agendar Cita
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmación Cancelar */}
      <AnimatePresence>
        {confirmCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[var(--color-danger)]">
                <AlertCircle size={24} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--color-text)]">¿Cancelar cita?</h3>
              <p className="mb-6 text-[var(--color-text-muted)]">
                ¿Está seguro que desea cancelar la cita de <strong>{confirmCancel.paciente}</strong> con el <strong>{confirmCancel.medico}</strong>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmCancel(null)} className="flex-1 rounded-xl border border-[var(--color-border)] py-3 font-bold text-[var(--color-text-muted)] hover:bg-gray-50">No, mantener</button>
                <button onClick={() => handleCancel(confirmCancel.id)} className="flex-1 rounded-xl bg-[var(--color-danger)] py-3 font-bold text-white hover:bg-red-700">Sí, cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentsPage;
