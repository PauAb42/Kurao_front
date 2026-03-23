import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { getDoctors, deleteDoctor } from '../services/api';
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  X,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const DoctorsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, loading, error, refetch } = useApi(getDoctors);

  const doctors = data || [
    { id: 1, nombre: 'Elena', apellidos: 'García', especialidad: 'Cardiología', cedula: '1234567', email: 'elena.garcia@kurao.com', estado: 'Activo' },
    { id: 2, nombre: 'Ricardo', apellidos: 'Martínez', especialidad: 'Pediatría', cedula: '7654321', email: 'ricardo.mtz@kurao.com', estado: 'Activo' },
    { id: 3, nombre: 'Sofía', apellidos: 'Sánchez', especialidad: 'Dermatología', cedula: '9876543', email: 'sofia.sanchez@kurao.com', estado: 'Inactivo' },
    { id: 4, nombre: 'Miguel', apellidos: 'Hernández', especialidad: 'Neurología', cedula: '4567890', email: 'miguel.hdz@kurao.com', estado: 'Activo' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Médicos</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Directorio de especialistas y personal médico</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] active:scale-95"
        >
          <Plus size={20} />
          Nuevo Médico
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] shadow-sm"
          />
        </div>
        <div className="flex rounded-xl bg-[var(--color-surface)] p-1 shadow-sm border border-[var(--color-border)]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-gray-100'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setViewMode('table')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-gray-100'}`}
          >
            Tabla
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-2xl bg-white border border-[var(--color-border)]" />)}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor) => (
            <motion.div 
              key={doctor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)] transition-all hover:shadow-md"
            >
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] font-bold text-2xl group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                  {(doctor.nombre?.charAt(0) || '')}{(doctor.apellidos?.charAt(0) || '')}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Dr. {doctor.nombre} {doctor.apellidos}</h3>
                <p className="text-sm font-semibold text-[var(--color-primary)]">{doctor.especialidad}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Cédula: {doctor.cedula}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                    doctor.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {doctor.estado}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-3 border-t border-[var(--color-border)] pt-4">
                <Link to={`/doctors/${doctor.id}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Eye size={18} /></Link>
                <button className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Pencil size={18} /></button>
                <button onClick={() => setConfirmDelete(doctor)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"><Trash2 size={18} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                <th className="pb-4 pl-4">Médico</th>
                <th className="pb-4">Especialidad</th>
                <th className="pb-4">Cédula</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Estado</th>
                <th className="pb-4 text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="text-sm transition-colors hover:bg-gray-50">
                  <td className="py-4 pl-4 font-medium">Dr. {doctor.nombre} {doctor.apellidos}</td>
                  <td className="py-4 text-[var(--color-primary)] font-semibold">{doctor.especialidad}</td>
                  <td className="py-4 font-mono">{doctor.cedula}</td>
                  <td className="py-4">{doctor.email}</td>
                  <td className="py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                      doctor.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {doctor.estado}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/doctors/${doctor.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-primary)] hover:bg-blue-100"><Eye size={16} /></Link>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><Pencil size={16} /></button>
                      <button onClick={() => setConfirmDelete(doctor)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[var(--color-danger)] hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Médico */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Registrar Nuevo Médico</h2>
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
                    <label className="text-sm font-semibold">Especialidad *</label>
                    <select className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]">
                      <option>Cardiología</option>
                      <option>Pediatría</option>
                      <option>Dermatología</option>
                      <option>Neurología</option>
                      <option>Ginecología</option>
                      <option>Oftalmología</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Cédula Profesional *</label>
                    <input type="text" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Teléfono *</label>
                    <input type="tel" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Email *</label>
                    <input type="email" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Horario de Atención</label>
                  <input type="text" placeholder="Ej: Lunes a Viernes 09:00 - 14:00" className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-[var(--color-border)] py-4 font-bold text-[var(--color-text-muted)] hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="button" className="flex-1 rounded-xl bg-[var(--color-primary)] py-4 font-bold text-white shadow-lg hover:bg-[var(--color-primary-dark)]">
                    Guardar Médico
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <h3 className="mb-2 text-xl font-bold text-[var(--color-text)]">¿Eliminar médico?</h3>
              <p className="mb-6 text-[var(--color-text-muted)]">
                Esta acción eliminará permanentemente el perfil del <strong>Dr. {confirmDelete.nombre} {confirmDelete.apellidos}</strong>.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-xl border border-[var(--color-border)] py-3 font-bold text-[var(--color-text-muted)] hover:bg-gray-50">Cancelar</button>
                <button className="flex-1 rounded-xl bg-[var(--color-danger)] py-3 font-bold text-white hover:bg-red-700">Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorsPage;
