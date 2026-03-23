import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getPatients, deletePatient } from '../services/api';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  AlertCircle,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const PatientsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useApi(() => getPatients(page, 10, searchTerm), [page, searchTerm]);

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      setConfirmDelete(null);
      refetch();
    } catch (err) {
      alert("Error al eliminar paciente: " + err.message);
    }
  };

  const patients = data?.patients || [
    { id: 1, expediente: 'EXP-001', nombre: 'Juan Pérez', edad: 45, telefono: '555-0101', ultimaVisita: '2024-03-10', estado: 'Activo' },
    { id: 2, expediente: 'EXP-002', nombre: 'María López', edad: 32, telefono: '555-0102', ultimaVisita: '2024-03-15', estado: 'Activo' },
    { id: 3, expediente: 'EXP-003', nombre: 'Carlos Ruiz', edad: 28, telefono: '555-0103', ultimaVisita: '2024-02-20', estado: 'Inactivo' },
    { id: 4, expediente: 'EXP-004', nombre: 'Ana Beltrán', edad: 54, telefono: '555-0104', ultimaVisita: '2024-03-18', estado: 'Activo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Pacientes</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Gestión y control de expedientes médicos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] active:scale-95"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o expediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                <th className="pb-4 pl-4">Expediente</th>
                <th className="pb-4">Nombre</th>
                <th className="pb-4">Edad</th>
                <th className="pb-4">Teléfono</th>
                <th className="pb-4">Última Visita</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4 text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="py-4 h-12 bg-gray-50 rounded-lg mb-2"></td>
                  </tr>
                ))
              ) : patients.map((patient) => (
                <tr key={patient.id} className="text-sm transition-colors hover:bg-gray-50">
                  <td className="py-4 pl-4 font-mono font-bold text-[var(--color-primary)]">{patient.expediente}</td>
                  <td className="py-4 font-medium">{patient.nombre}</td>
                  <td className="py-4">{patient.edad} años</td>
                  <td className="py-4">{patient.telefono}</td>
                  <td className="py-4">{patient.ultimaVisita}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                      patient.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.estado}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Link 
                        to={`/patients/${patient.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] hover:bg-blue-100"
                        title="Ver perfil"
                      >
                        <Eye size={16} />
                      </Link>
                      <button 
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(patient)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[var(--color-danger)] hover:bg-red-100"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border)] pt-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            Mostrando <span className="font-bold text-[var(--color-text)]">1-10</span> de <span className="font-bold text-[var(--color-text)]">42</span> pacientes
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] transition-colors hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Confirmación Eliminar */}
      <AnimatePresence>
        {confirmDelete && (
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
              <h3 className="mb-2 text-xl font-bold text-[var(--color-text)]">¿Eliminar paciente?</h3>
              <p className="mb-6 text-[var(--color-text-muted)]">
                Esta acción eliminará permanentemente el expediente de <strong>{confirmDelete.nombre}</strong>. No se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl border border-[var(--color-border)] py-3 font-bold text-[var(--color-text-muted)] hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="flex-1 rounded-xl bg-[var(--color-danger)] py-3 font-bold text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nuevo Paciente (Simulado) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full w-full max-w-xl bg-white p-8 shadow-2xl overflow-y-auto"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Nuevo Paciente</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Nombre *</label>
                    <input type="text" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Apellidos *</label>
                    <input type="text" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Fecha de Nacimiento *</label>
                    <input type="date" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Sexo *</label>
                    <select className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]">
                      <option>Masculino</option>
                      <option>Femenino</option>
                      <option>Otro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Teléfono *</label>
                    <input type="tel" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email</label>
                    <input type="email" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Dirección</label>
                  <input type="text" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tipo de Sangre</label>
                  <select className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]">
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Alergias</label>
                  <textarea className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] h-24" />
                </div>

                <div className="pt-6">
                  <button type="button" className="w-full rounded-xl bg-[var(--color-primary)] py-4 font-bold text-white shadow-lg hover:bg-[var(--color-primary-dark)]">
                    Guardar Paciente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientsPage;
