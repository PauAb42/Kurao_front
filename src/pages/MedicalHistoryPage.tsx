import React, { useState } from 'react';
import { Search, ClipboardList, Plus, User, Calendar, ArrowRight, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const MedicalHistoryPage = () => {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(isPatient ? {
    id: user.id,
    nombre: user.name,
    expediente: 'EXP-001',
    edad: user.age || 45
  } : null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock search results
  const searchResults = searchTerm.length > 2 ? [
    { id: 1, nombre: 'Juan Pérez García', expediente: 'EXP-001', edad: 45 },
    { id: 2, nombre: 'Juan Alberto Torres', expediente: 'EXP-085', edad: 29 },
  ] : [];

  const history = [
    { id: 1, fecha: '10 Mar 2024', medico: 'Dra. Elena García', especialidad: 'Cardiología', diagnostico: 'Faringitis aguda con inflamación severa.', tratamiento: 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.', observaciones: 'Paciente refiere dolor al tragar desde hace 48h.' },
    { id: 2, fecha: '15 Ene 2024', medico: 'Dr. Ricardo Martínez', especialidad: 'Medicina General', diagnostico: 'Control de Hipertensión Arterial', tratamiento: 'Enalapril 10mg diario. Dieta hiposódica.', observaciones: 'Presión arterial estable 120/80.' },
    { id: 3, fecha: '05 Nov 2023', medico: 'Dra. Elena García', especialidad: 'Cardiología', diagnostico: 'Arritmia leve', tratamiento: 'Seguimiento mensual. Evitar cafeína.', observaciones: 'Realizar electrocardiograma en próxima visita.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {isPatient ? 'Mi Historial Clínico' : 'Historial Clínico'}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {isPatient ? 'Consulta tus antecedentes médicos y tratamientos' : 'Consulta y registro de antecedentes médicos'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface)] p-8 shadow-sm border border-[var(--color-border)]">
        {!isPatient && (
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Buscar expediente de paciente</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
              <input
                type="text"
                placeholder="Ingrese nombre o número de expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] py-4 pl-12 pr-4 text-lg outline-none focus:border-[var(--color-primary)] shadow-inner"
              />
              
              {/* Resultados de búsqueda rápidos */}
              <AnimatePresence>
                {searchResults.length > 0 && !selectedPatient && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl bg-white border border-[var(--color-border)] shadow-2xl overflow-hidden"
                  >
                    {searchResults.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        className="flex w-full items-center justify-between p-4 hover:bg-blue-50 transition-colors border-b border-[var(--color-border)] last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-[var(--color-primary)] font-bold">
                            {(p.nombre?.charAt(0) || '')}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-[var(--color-text)]">{p.nombre}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Exp: {p.expediente} • {p.edad} años</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {selectedPatient ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-[var(--color-border)] pb-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white font-bold text-xl">
                  {(selectedPatient.nombre?.charAt(0) || '')}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[var(--color-text)]">{selectedPatient.nombre}</h3>
                  <p className="text-[var(--color-text-muted)] font-mono">Expediente: <span className="font-bold text-[var(--color-primary)]">{selectedPatient.expediente}</span> • {selectedPatient.edad} años</p>
                </div>
              </div>
              <div className="flex gap-3">
                {!isPatient && (
                  <>
                    <button 
                      onClick={() => setSelectedPatient(null)}
                      className="rounded-xl border border-[var(--color-border)] px-6 py-3 font-bold text-[var(--color-text-muted)] hover:bg-gray-50"
                    >
                      Cambiar Paciente
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg hover:bg-[var(--color-primary-dark)]"
                    >
                      <Plus size={20} />
                      Agregar Consulta
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                <ClipboardList size={22} className="text-[var(--color-primary)]" />
                Historial de Consultas
              </h4>
              
              <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
                {history.map((record) => (
                  <div key={record.id} className="relative pl-12">
                    <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-white border-4 border-[var(--color-primary)] flex items-center justify-center z-10 shadow-sm">
                      <Calendar size={16} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[var(--color-primary)]">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-bold text-[var(--color-primary)]">{record.fecha}</p>
                          <p className="text-sm font-semibold text-[var(--color-text)]">Diagnóstico: {record.diagnostico}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase">Médico Tratante</p>
                          <p className="text-sm font-bold text-[var(--color-text)]">{record.medico}</p>
                          <p className="text-xs text-[var(--color-primary)] font-medium">{record.especialidad}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Tratamiento</p>
                          <p className="text-sm text-[var(--color-text)] leading-relaxed">{record.tratamiento}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Observaciones</p>
                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed italic">"{record.observaciones}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <ClipboardList size={80} className="mb-4 text-[var(--color-text-muted)]" />
            <p className="text-lg font-medium">Seleccione un paciente para ver su historial clínico</p>
          </div>
        )}
      </div>

      {/* Modal Agregar Consulta */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--color-text)]">Registrar Nueva Consulta</h2>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Médico Tratante *</label>
                    <select className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] bg-white">
                      <option>Dra. Elena García</option>
                      <option>Dr. Ricardo Martínez</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Fecha de Consulta *</label>
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Diagnóstico *</label>
                  <input type="text" placeholder="Ej: Gripe común, Hipertensión..." className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)]" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Tratamiento *</label>
                  <textarea placeholder="Medicamentos, dosis y duración..." className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] h-24" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Observaciones</label>
                  <textarea placeholder="Notas adicionales sobre la consulta..." className="w-full rounded-xl border border-[var(--color-border)] p-3 outline-none focus:border-[var(--color-primary)] h-24" />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-[var(--color-border)] py-4 font-bold text-[var(--color-text-muted)] hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="button" className="flex-1 rounded-xl bg-[var(--color-primary)] py-4 font-bold text-white shadow-lg hover:bg-[var(--color-primary-dark)]">
                    Guardar Registro
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

export default MedicalHistoryPage;
