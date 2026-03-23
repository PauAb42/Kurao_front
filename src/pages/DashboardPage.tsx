import React from 'react';
import { useApi } from '../hooks/useApi';
import { getDashboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  UserRound, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Plus,
  ArrowRight,
  ClipboardList,
  Heart,
  Activity as ActivityIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend = null, trendValue = null, color }) => (
  <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)]">
    <div className="mb-4 flex items-center justify-between">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} text-white`}>
        <Icon size={24} />
      </div>
      {trendValue && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trendValue}
        </div>
      )}
    </div>
    <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
    <h3 className="text-2xl font-bold text-[var(--color-text)]">{value}</h3>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-white border border-[var(--color-border)]" />)}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 h-96 rounded-2xl bg-white border border-[var(--color-border)]" />
      <div className="h-96 rounded-2xl bg-white border border-[var(--color-border)]" />
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, loading, error } = useApi(getDashboardStats);

  if (loading) return <SkeletonLoader />;
  if (error) return (
    <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white border border-[var(--color-border)] p-8 text-center">
      <p className="mb-4 text-[var(--color-danger)] font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-white">Reintentar</button>
    </div>
  );

  const stats = data || {
    totalPatients: 1248,
    appointmentsToday: 42,
    activeDoctors: 18,
    pendingAppointments: 12,
    upcomingAppointments: [
      { id: 1, patient: 'Juan Pérez', doctor: 'Dra. García', time: '09:00 AM', status: 'Confirmada' },
      { id: 2, patient: 'María López', doctor: 'Dr. Martínez', time: '10:30 AM', status: 'Pendiente' },
      { id: 3, patient: 'Carlos Ruiz', doctor: 'Dra. García', time: '11:15 AM', status: 'Confirmada' },
      { id: 4, patient: 'Ana Beltrán', doctor: 'Dr. Sánchez', time: '12:00 PM', status: 'Cancelada' },
    ]
  };

  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Bienvenido, {user?.name}</h1>
          <p className="text-[var(--color-text-muted)]">Panel de control de {user?.role === 'admin' ? 'Administración' : user?.role === 'doctor' ? 'Médico' : user?.role === 'patient' ? 'Paciente' : 'Recepción'}</p>
        </div>
        {isPatient && (
          <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[var(--color-primary)] border border-blue-100">
            <Heart size={16} className="text-red-500" /> Salud: Estable
          </div>
        )}
      </div>

      {isPatient ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard 
            title="Próxima Cita" 
            value="25 Mar 2024" 
            icon={Calendar} 
            color="bg-blue-500" 
          />
          <StatCard 
            title="Consultas Realizadas" 
            value="12" 
            icon={ClipboardList} 
            color="bg-[var(--color-secondary)]" 
          />
          <StatCard 
            title="Recetas Activas" 
            value="3" 
            icon={ActivityIcon} 
            color="bg-purple-500" 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title={isDoctor ? "Mis Pacientes" : "Total Pacientes"} 
            value={isDoctor ? "85" : stats.totalPatients} 
            icon={Users} 
            trend="up" 
            trendValue="+12%" 
            color="bg-blue-500" 
          />
          <StatCard 
            title={isDoctor ? "Citas Hoy" : "Citas Hoy"} 
            value={isDoctor ? "8" : stats.appointmentsToday} 
            icon={Calendar} 
            trend="up" 
            trendValue="+5%" 
            color="bg-[var(--color-secondary)]" 
          />
          <StatCard 
            title="Médicos Activos" 
            value={stats.activeDoctors} 
            icon={UserRound} 
            trend="down" 
            trendValue="-2%" 
            color="bg-purple-500" 
          />
          <StatCard 
            title="Citas Pendientes" 
            value={stats.pendingAppointments} 
            icon={Clock} 
            trend="up" 
            trendValue="+8%" 
            color="bg-[var(--color-warning)]" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--color-text)]">
              {isPatient ? 'Mis últimas consultas' : 'Próximas citas del día'}
            </h3>
            <Link to={isPatient ? "/history" : "/appointments"} className="text-sm font-medium text-[var(--color-primary)] hover:underline">Ver todas</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
                  <th className="pb-4">{isPatient ? 'Fecha' : 'Paciente'}</th>
                  <th className="pb-4">{isPatient ? 'Médico' : 'Médico'}</th>
                  <th className="pb-4">{isPatient ? 'Diagnóstico' : 'Hora'}</th>
                  <th className="pb-4">Estado</th>
                  <th className="pb-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {isPatient ? (
                  [
                    { id: 1, date: '10 Mar 2024', doctor: 'Dra. Elena García', diag: 'Faringitis aguda', status: 'Completada' },
                    { id: 2, date: '15 Ene 2024', doctor: 'Dr. Ricardo Martínez', diag: 'Control Hipertensión', status: 'Completada' },
                  ].map((apt) => (
                    <tr key={apt.id} className="text-sm">
                      <td className="py-4 font-medium">{apt.date}</td>
                      <td className="py-4">{apt.doctor}</td>
                      <td className="py-4">{apt.diag}</td>
                      <td className="py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link to="/history" className="text-[var(--color-primary)] hover:underline">Detalles</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  (stats.upcomingAppointments || []).map((apt) => (
                    <tr key={apt.id} className="text-sm">
                      <td className="py-4 font-medium">{apt.patient}</td>
                      <td className="py-4">{apt.doctor}</td>
                      <td className="py-4">{apt.time}</td>
                      <td className="py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                          apt.status === 'Confirmada' ? 'bg-green-100 text-green-700' :
                          apt.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-[var(--color-primary)] hover:underline">Detalles</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-sm border border-[var(--color-border)]">
            <h3 className="mb-6 text-lg font-bold text-[var(--color-text)]">Accesos rápidos</h3>
            <div className="space-y-3">
              {isPatient ? (
                <>
                  <Link to="/history" className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <ClipboardList size={20} />
                      </div>
                      <span className="font-semibold">Mi Historial</span>
                    </div>
                    <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                  </Link>
                  <Link to="/appointments" className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-[var(--color-secondary)]">
                        <Calendar size={20} />
                      </div>
                      <span className="font-semibold">Mis Citas</span>
                    </div>
                    <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                  </Link>
                </>
              ) : (
                <>
                  {['admin', 'reception'].includes(user?.role) && (
                    <Link to="/patients" className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-[var(--color-primary)]">
                          <Plus size={20} />
                        </div>
                        <span className="font-semibold">Nuevo Paciente</span>
                      </div>
                      <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                    </Link>
                  )}
                  <Link to="/appointments" className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-[var(--color-secondary)]">
                        <Calendar size={20} />
                      </div>
                      <span className="font-semibold">Agendar Cita</span>
                    </div>
                    <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                  </Link>
                  <Link to="/history" className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4 transition-all hover:border-[var(--color-primary)] hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <ClipboardList size={20} />
                      </div>
                      <span className="font-semibold">Ver Historial</span>
                    </div>
                    <ArrowRight size={18} className="text-[var(--color-text-muted)]" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
