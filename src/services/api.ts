// Cliente HTTP que llama al backend-kurao (Express + PostgreSQL).
// Hace mapeo entre la forma de datos del backend y la forma que esperan las páginas.

const API_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'kurao_token';

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.error || err?.message || msg;
    } catch { /* no-op */ }
    if (res.status === 401) {
      // Sesión inválida → limpia token para forzar re-login
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('kurao_user');
      } catch { /* no-op */ }
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ─────────── MAPEOS ─────────── */

const ROL_TO_ROLE: Record<string, string> = {
  admin: 'admin',
  medico: 'doctor',
  recepcionista: 'reception',
};

function mapUsuarioToUser(u: any): any {
  if (!u) return null;
  return {
    id: u.id,
    name: u.nombre,
    email: u.email,
    role: ROL_TO_ROLE[u.rol] || u.rol,
    phone: u.telefono,
    address: u.direccion,
  };
}

function mapPaciente(p: any): any {
  if (!p) return p;
  return {
    ...p,
    apellidos: p.apellido,
    sexo: p.genero,
    ultimaVisita: p.ultima_visita,
  };
}

function parseHorario(horario: any): { horarioInicio: string; horarioFin: string } {
  try {
    const h = typeof horario === 'string' ? JSON.parse(horario) : horario;
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    for (const d of dias) {
      if (h && h[d]) {
        const [ini, fin] = String(h[d]).split('-');
        return {
          horarioInicio: (ini || '').trim(),
          horarioFin: (fin || '').trim(),
        };
      }
    }
  } catch { /* no-op */ }
  return { horarioInicio: '', horarioFin: '' };
}

function mapMedico(m: any): any {
  if (!m) return m;
  const { horarioInicio, horarioFin } = parseHorario(m.horario);
  return {
    ...m,
    apellidos: m.apellido,
    horarioInicio,
    horarioFin,
    estado: m.activo === false ? 'Inactivo' : 'Activo',
    consultorio: m.consultorio || '—',
  };
}

// Backend estados: Pendiente | Confirmada | Cancelada | Completada
// Frontend estados: Programada | Completada | Cancelada
const BE_TO_FE_ESTADO: Record<string, string> = {
  Pendiente: 'Programada',
  Confirmada: 'Programada',
  Completada: 'Completada',
  Cancelada: 'Cancelada',
};
const FE_TO_BE_ESTADO: Record<string, string> = {
  Programada: 'Pendiente',
  Completada: 'Completada',
  Cancelada: 'Cancelada',
};

function mapCita(c: any): any {
  if (!c) return c;
  const rawId = c.id;
  return {
    id: `FOL-${rawId}`,
    rawId,
    paciente: c.paciente_nombre,
    medico: c.medico_nombre ? `Dr. ${c.medico_nombre}` : '',
    paciente_id: c.paciente_id,
    medico_id: c.medico_id,
    fecha: c.fecha,
    hora: typeof c.hora === 'string' ? c.hora.slice(0, 5) : c.hora,
    motivo: c.motivo || '',
    estado: BE_TO_FE_ESTADO[c.estado] || c.estado,
    notas: c.notas,
  };
}

function parseFolio(id: string | number): number {
  if (typeof id === 'number') return id;
  const m = String(id).match(/(\d+)$/);
  return m ? Number(m[1]) : Number(id);
}

function formatFecha(fecha: any): string {
  if (!fecha) return '';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return String(fecha);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(fecha);
  }
}

/* ─────────── AUTH ─────────── */

export const login = async (credentials: { email: string; password: string }) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return { token: data.token, user: mapUsuarioToUser(data.usuario) };
};

export const logout = async () => {
  try {
    return await request('/auth/logout', { method: 'POST' });
  } catch {
    return { success: true };
  }
};

export const getProfile = async () => {
  const data = await request('/auth/me');
  return mapUsuarioToUser(data);
};

export const updateProfile = async (_id: string | number, data: any) => {
  const body = {
    nombre: data.name ?? data.nombre,
    telefono: data.phone ?? data.telefono,
    direccion: data.address ?? data.direccion,
  };
  const resp = await request('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return mapUsuarioToUser(resp);
};

/* ─────────── DASHBOARD ─────────── */

export const getDashboardStats = async () => {
  const [metrics, citasHoy] = await Promise.all([
    request('/dashboard'),
    request('/dashboard/citas-hoy').catch(() => [] as any[]),
  ]);
  return {
    totalPatients: metrics?.total_pacientes ?? 0,
    appointmentsToday: metrics?.citas_hoy ?? 0,
    activeDoctors: metrics?.medicos_activos ?? 0,
    pendingAppointments: metrics?.citas_pendientes ?? 0,
    upcomingAppointments: (citasHoy || []).map((c: any) => ({
      id: c.id,
      patient: c.paciente_nombre,
      doctor: c.medico_nombre ? `Dr. ${c.medico_nombre}` : '',
      time: typeof c.hora === 'string' ? c.hora.slice(0, 5) : c.hora,
      status: BE_TO_FE_ESTADO[c.estado] || c.estado,
    })),
  };
};

/* ─────────── PACIENTES ─────────── */

export const getPatients = async (page = 1, limit = 10, search = '') => {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { q: search } : {}),
  });
  const data = await request(`/pacientes?${qs.toString()}`);
  const pacientes = (data?.data || []).map(mapPaciente);
  return {
    pacientes,
    patients: pacientes,
    total: data?.pagination?.total ?? pacientes.length,
    paginas: data?.pagination?.totalPages ?? 1,
  };
};

export const getPatientById = async (id: string | number) => {
  const p = await request(`/pacientes/${id}`);
  return mapPaciente(p);
};

export const createPatient = async (data: any) => {
  const body = {
    nombre: data.nombre,
    apellido: data.apellidos ?? data.apellido,
    fecha_nacimiento: data.fechaNacimiento ?? data.fecha_nacimiento,
    edad: data.edad !== undefined && data.edad !== '' ? Number(data.edad) : undefined,
    genero: data.sexo ?? data.genero,
    telefono: data.telefono,
    email: data.email,
    direccion: data.direccion,
  };
  return mapPaciente(
    await request('/pacientes', { method: 'POST', body: JSON.stringify(body) }),
  );
};

export const updatePatient = async (id: string | number, data: any) => {
  const body: any = {
    nombre: data.nombre,
    apellido: data.apellidos ?? data.apellido,
    fecha_nacimiento: data.fechaNacimiento ?? data.fecha_nacimiento,
    edad: data.edad !== undefined && data.edad !== '' ? Number(data.edad) : undefined,
    genero: data.sexo ?? data.genero,
    telefono: data.telefono,
    email: data.email,
    direccion: data.direccion,
    estado: data.estado,
  };
  return mapPaciente(
    await request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  );
};

export const deletePatient = async (id: string | number) => {
  return request(`/pacientes/${id}`, { method: 'DELETE' });
};

/* ─────────── MÉDICOS ─────────── */

export const getDoctors = async () => {
  const data = await request('/medicos');
  return (Array.isArray(data) ? data : []).map(mapMedico);
};

export const getDoctorById = async (id: string | number) => {
  const m = await request(`/medicos/${id}`);
  return mapMedico(m);
};

function horarioFromRange(inicio?: string, fin?: string): Record<string, string> | undefined {
  if (!inicio && !fin) return undefined;
  const rango = `${inicio || ''}-${fin || ''}`;
  return {
    lunes: rango, martes: rango, miercoles: rango, jueves: rango, viernes: rango,
  };
}

export const createDoctor = async (data: any) => {
  const body: any = {
    nombre: data.nombre,
    apellido: data.apellidos ?? data.apellido,
    especialidad: data.especialidad,
    cedula: data.cedula,
    telefono: data.telefono,
    email: data.email,
    horario: horarioFromRange(data.horarioInicio, data.horarioFin),
  };
  return mapMedico(
    await request('/medicos', { method: 'POST', body: JSON.stringify(body) }),
  );
};

export const updateDoctor = async (id: string | number, data: any) => {
  const body: any = {};
  if (data.nombre !== undefined) body.nombre = data.nombre;
  if (data.apellidos !== undefined) body.apellido = data.apellidos;
  else if (data.apellido !== undefined) body.apellido = data.apellido;
  if (data.especialidad !== undefined) body.especialidad = data.especialidad;
  if (data.cedula !== undefined) body.cedula = data.cedula;
  if (data.telefono !== undefined) body.telefono = data.telefono;
  if (data.email !== undefined) body.email = data.email;
  if (data.estado !== undefined) body.activo = data.estado === 'Activo';
  if (data.horarioInicio !== undefined || data.horarioFin !== undefined) {
    body.horario = horarioFromRange(data.horarioInicio, data.horarioFin);
  }
  return mapMedico(
    await request(`/medicos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  );
};

export const deleteDoctor = async (id: string | number) => {
  return request(`/medicos/${id}`, { method: 'DELETE' });
};

/* ─────────── CITAS ─────────── */

export const getAppointments = async (filters: any = {}) => {
  const qs = new URLSearchParams();
  if (filters?.status && filters.status !== 'all' && filters.status !== 'Todas') {
    qs.set('estado', FE_TO_BE_ESTADO[filters.status] || filters.status);
  }
  if (filters?.q) qs.set('q', filters.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const data = await request(`/citas${suffix}`);
  let mapped = (Array.isArray(data) ? data : []).map(mapCita);
  if (filters?.doctorId) {
    mapped = mapped.filter((a: any) => Number(a.medico_id) === Number(filters.doctorId));
  }
  const result: any = [...mapped];
  result.appointments = mapped;
  return result;
};

export const getAppointmentById = async (id: string | number) => {
  const realId = parseFolio(id);
  return mapCita(await request(`/citas/${realId}`));
};

export const createAppointment = async (data: any) => {
  const body = {
    paciente_id: Number(data.paciente_id ?? data.pacienteId),
    medico_id: Number(data.medico_id ?? data.medicoId),
    fecha: data.fecha,
    hora: data.hora,
    motivo: data.motivo,
  };
  return mapCita(
    await request('/citas', { method: 'POST', body: JSON.stringify(body) }),
  );
};

export const updateAppointment = async (id: string | number, data: any) => {
  const realId = parseFolio(id);
  const body: any = {};
  if (data.paciente_id !== undefined || data.pacienteId !== undefined)
    body.paciente_id = Number(data.paciente_id ?? data.pacienteId);
  if (data.medico_id !== undefined || data.medicoId !== undefined)
    body.medico_id = Number(data.medico_id ?? data.medicoId);
  if (data.fecha !== undefined) body.fecha = data.fecha;
  if (data.hora !== undefined) body.hora = data.hora;
  if (data.motivo !== undefined) body.motivo = data.motivo;
  if (data.notas !== undefined) body.notas = data.notas;
  return mapCita(
    await request(`/citas/${realId}`, { method: 'PUT', body: JSON.stringify(body) }),
  );
};

export const cancelAppointment = async (id: string | number) => {
  const realId = parseFolio(id);
  await request(`/citas/${realId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'Cancelada' }),
  });
  return { success: true };
};

export const completeAppointment = async (id: string | number) => {
  const realId = parseFolio(id);
  await request(`/citas/${realId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: 'Completada' }),
  });
  return { success: true };
};

/* ─────────── HISTORIAL CLÍNICO ─────────── */

export const getMedicalHistory = async (patientId: string | number) => {
  const data = await request(`/historial/paciente/${patientId}`);
  const list = (data?.historial || []).map((h: any) => ({
    id: h.id,
    fecha: formatFecha(h.fecha),
    hora: '',
    medico: h.medico_nombre ? `Dr. ${h.medico_nombre}` : '',
    especialidad: h.medico_especialidad,
    diagnostico: h.diagnostico,
    tratamiento: h.tratamiento,
    medicamentos: '',
    observaciones: h.observaciones,
    notas: h.observaciones,
  }));
  const result: any = [...list];
  result.records = list;
  return result;
};

export const createMedicalRecord = async (patientId: string | number, data: any) => {
  const body = {
    paciente_id: Number(patientId),
    medico_id: Number(data.medicoId ?? data.medico_id),
    fecha: data.fecha,
    diagnostico: data.diagnostico,
    tratamiento: data.tratamiento,
    observaciones: data.observaciones ?? data.notas ?? data.medicamentos ?? '',
  };
  return request('/historial', { method: 'POST', body: JSON.stringify(body) });
};
