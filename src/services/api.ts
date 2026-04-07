// Mock data for the demo
const MOCK_USER = {
  id: "1",
  nombre: "Admin Kurao",
  email: "admin@kurao.com",
  rol: "admin"
};

const MOCK_STATS = {
  totalPatients: 6,
  appointmentsToday: 45,
  activeDoctors: 28,
  pendingAppointments: 12,
  upcomingAppointments: [
    { id: 1, patient: "Juan Pérez", doctor: "Dra. Elena García", time: "09:00 AM", status: "Confirmada" },
    { id: 2, patient: "María García", doctor: "Dr. Ricardo Martínez", time: "10:30 AM", status: "Pendiente" },
    { id: 3, patient: "Carlos López", doctor: "Dra. Elena García", time: "11:15 AM", status: "Confirmada" },
    { id: 4, patient: "Ana Beltrán", doctor: "Dr. Roberto Sánchez", time: "12:00 PM", status: "Cancelada" },
  ]
};

const MOCK_PATIENTS = [
  { 
    id: 1, nombre: "Juan", apellidos: "Pérez", edad: 45, genero: "M", sexo: "Masculino", 
    ultimaVisita: "2024-03-15", estado: "Activo", expediente: "EXP-001", fecha_nacimiento: "1979-05-20",
    curp: "PERJ790520HDFRRR01", ocupacion: "Ingeniero", telefono: "(618) 123-4567", email: "juan.perez@example.com",
    direccion: "Av. 20 de Noviembre 123", contactoEmergencia: "María Pérez", telEmergencia: "(618) 987-6543",
    tipo_sangre: "O+", alergias: "Penicilina", antecedentes: "Hipertensión arterial controlada.", 
    medicamentos: "Losartán 50mg", peso: "78.5", altura: "176", presion: "120/80", temp: "36.5", notas: "Paciente regular, buena adherencia al tratamiento."
  },
  { 
    id: 2, nombre: "María", apellidos: "García", edad: 32, genero: "F", sexo: "Femenino", 
    ultimaVisita: "2024-03-18", estado: "En tratamiento", expediente: "EXP-002", fecha_nacimiento: "1992-08-14",
    curp: "GARM920814MDFRRR02", ocupacion: "Diseñadora", telefono: "(618) 333-4444", email: "maria.g@example.com",
    direccion: "Avenida Siempre Viva 742", contactoEmergencia: "Luis García", telEmergencia: "(618) 444-5555",
    tipo_sangre: "A-", alergias: "Polen, Ácaros", antecedentes: "Asma leve.", 
    medicamentos: "Salbutamol (PRN)", peso: "62", altura: "165", presion: "115/75", temp: "36.8", notas: "Control de asma favorable."
  },
  { 
    id: 3, nombre: "Carlos", apellidos: "López", edad: 58, genero: "M", sexo: "Masculino", 
    ultimaVisita: "2024-03-10", estado: "Crítico", expediente: "EXP-003", fecha_nacimiento: "1966-11-03",
    curp: "LOPC661103HDFRRR03", ocupacion: "Comerciante", telefono: "(618) 555-6666", email: "carlos.l@example.com",
    direccion: "Boulevard Principal 456", contactoEmergencia: "Carmen Ruiz", telEmergencia: "(618) 666-7777",
    tipo_sangre: "B+", alergias: "Ninguna", antecedentes: "Diabetes Tipo 2.", 
    medicamentos: "Metformina 850mg", peso: "90", altura: "170", presion: "145/90", temp: "37.2", notas: "Monitoreo estricto de glucosa requerido."
  },
];

// LISTADO DE 12 DOCTORES CON INFORMACIÓN COMPLETA
const MOCK_DOCTORS = [
  { id: 1, nombre: "Elena", apellidos: "García", especialidad: "Cardiología", cedula: "7723144", email: "elena.garcia@kurao.com", telefono: "555-0101", consultorio: "A-102", horarioInicio: "08:00", horarioFin: "16:00", estado: "Activo" },
  { id: 2, nombre: "Ricardo", apellidos: "Martínez", especialidad: "Pediatría", cedula: "8821900", email: "ricardo.mtz@kurao.com", telefono: "555-0102", consultorio: "B-205", horarioInicio: "09:00", horarioFin: "17:00", estado: "Activo" },
  { id: 3, nombre: "Sofía", apellidos: "Sánchez", especialidad: "Dermatología", cedula: "9910223", email: "sofia.sanchez@kurao.com", telefono: "555-0103", consultorio: "C-301", horarioInicio: "10:00", horarioFin: "18:00", estado: "Inactivo" },
  { id: 4, nombre: "Miguel", apellidos: "Hernández", especialidad: "Neurología", cedula: "4567890", email: "miguel.hdz@kurao.com", telefono: "555-0104", consultorio: "A-404", horarioInicio: "08:00", horarioFin: "14:00", estado: "Activo" },
  { id: 5, nombre: "Laura", apellidos: "Flores", especialidad: "Ginecología", cedula: "1122334", email: "laura.flores@kurao.com", telefono: "555-0105", consultorio: "D-108", horarioInicio: "07:00", horarioFin: "15:00", estado: "Activo" },
  { id: 6, nombre: "Carlos", apellidos: "Reyes", especialidad: "Medicina General", cedula: "9988776", email: "carlos.reyes@kurao.com", telefono: "555-0106", consultorio: "G-100", horarioInicio: "09:00", horarioFin: "18:00", estado: "Inactivo" },
  { id: 7, nombre: "Patricia", apellidos: "Luna", especialidad: "Oftalmología", cedula: "2233445", email: "patricia.luna@kurao.com", telefono: "555-0107", consultorio: "E-502", horarioInicio: "11:00", horarioFin: "19:00", estado: "Activo" },
  { id: 8, nombre: "Roberto", apellidos: "Solis", especialidad: "Ortopedia", cedula: "3344556", email: "roberto.solis@kurao.com", telefono: "555-0108", consultorio: "B-202", horarioInicio: "08:00", horarioFin: "16:00", estado: "Activo" },
  { id: 9, nombre: "Adriana", apellidos: "Torres", especialidad: "Psiquiatría", cedula: "4455667", email: "adriana.torres@kurao.com", telefono: "555-0109", consultorio: "C-105", horarioInicio: "12:00", horarioFin: "20:00", estado: "Activo" },
  { id: 10, nombre: "Fernando", apellidos: "Gómez", especialidad: "Urología", cedula: "5566778", email: "fernando.gomez@kurao.com", telefono: "555-0110", consultorio: "A-303", horarioInicio: "09:00", horarioFin: "15:00", estado: "Activo" },
  { id: 11, nombre: "Mónica", apellidos: "Díaz", especialidad: "Endocrinología", cedula: "6677889", email: "monica.diaz@kurao.com", telefono: "555-0111", consultorio: "D-204", horarioInicio: "08:00", horarioFin: "16:00", estado: "Activo" },
  { id: 12, nombre: "Jorge", apellidos: "Vega", especialidad: "Gastroenterología", cedula: "7788990", email: "jorge.vega@kurao.com", telefono: "555-0112", consultorio: "E-101", horarioInicio: "10:00", horarioFin: "18:00", estado: "Activo" },
];

// --- AUTH ---
export const login = async (credentials: any) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users: any = {
    'admin@kurao.com': { id: '1', name: 'Admin Kurao', email: 'admin@kurao.com', role: 'admin' },
    'paciente@kurao.com': { id: '2', name: 'Juan Pérez', email: 'paciente@kurao.com', role: 'patient', age: 45, gender: 'M' },
    'doctor@kurao.com': { id: '3', name: 'Dra. Elena García', email: 'doctor@kurao.com', role: 'doctor', specialty: 'Cardiología' },
    'recepcion@kurao.com': { id: '4', name: 'Ana Martínez', email: 'recepcion@kurao.com', role: 'reception' },
  };
  const user = users[credentials.email];
  if (user && credentials.password === "kurao123") {
    return { token: "mock_token_" + user.id, user };
  } else {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }
};

export const updateProfile = async (id: string | number, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { id, ...data };
};

export const logout = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true };
};

// --- DASHBOARD ---
export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_STATS;
};

// --- PACIENTES ---
export const getPatients = async (page = 1, limit = 10, search = "") => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    pacientes: MOCK_PATIENTS,
    patients: MOCK_PATIENTS,
    total: MOCK_PATIENTS.length,
    paginas: 1
  };
};

export const getPatientById = async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PATIENTS.find(p => p.id === Number(id)) || MOCK_PATIENTS[0];
};

export const createPatient = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Math.random(), ...data };
};

export const updatePatient = async (id: string | number, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, ...data };
};

export const deletePatient = async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
};

// --- MÉDICOS ---
export const getDoctors = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS;
};

export const getDoctorById = async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const doctor = MOCK_DOCTORS.find(d => d.id === Number(id));
    return doctor || MOCK_DOCTORS[0];
};

export const createDoctor = async (data: any) => ({ id: Math.random(), ...data });
export const updateDoctor = async (id: string | number, data: any) => ({ id, ...data });
export const deleteDoctor = async (id: string | number) => ({ success: true });

// --- CITAS ---
// Usamos let para poder modificar el arreglo simulando una base de datos
let MOCK_APPOINTMENTS = [
  { id: 'FOL-101', paciente: "Juan Pérez", medico: "Dra. Elena García", fecha: "2024-03-20", hora: "09:00 AM", estado: "Completada", motivo: "Chequeo de rutina" },
  { id: 'FOL-102', paciente: "María García", medico: "Dr. Ricardo Martínez", fecha: "2024-03-20", hora: "11:30 AM", estado: "Programada", motivo: "Seguimiento de asma" },
  { id: 'FOL-103', paciente: "Carlos López", medico: "Dra. Elena García", fecha: "2024-03-21", hora: "10:15 AM", estado: "Cancelada", motivo: "Dolor en el pecho" },
  { id: 'FOL-104', paciente: "Ana Beltrán", medico: "Dr. Roberto Solis", fecha: "2024-03-22", hora: "16:00", estado: "Programada", motivo: "Dolor articular" },
  { id: 'FOL-105', paciente: "Juan Pérez", medico: "Dra. Adriana Torres", fecha: "2024-03-25", hora: "12:00", estado: "Programada", motivo: "Consulta de seguimiento" },
];

export const getAppointments = async (filters: any = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...MOCK_APPOINTMENTS];
  
  // Filtrar por estado
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(a => a.estado === filters.status);
  }
  
  // Filtrar por doctor (para la vista de detalle de doctor)
  if (filters.doctorId) {
      const doctor = MOCK_DOCTORS.find(d => d.id === Number(filters.doctorId));
      if (doctor) {
          filtered = filtered.filter(a => a.medico.includes(doctor.apellidos));
      }
  }

  // Truco de compatibilidad
  const result: any = [...filtered];
  result.appointments = result; 
  return result;
};

export const getAppointmentById = async (id: string | number) => {
    return MOCK_APPOINTMENTS.find(a => a.id === id) || MOCK_APPOINTMENTS[0];
};

export const createAppointment = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newApt = {
        id: `FOL-${100 + MOCK_APPOINTMENTS.length + 1}`,
        ...data,
        estado: 'Programada'
    };
    MOCK_APPOINTMENTS = [newApt, ...MOCK_APPOINTMENTS];
    return newApt;
};

export const updateAppointment = async (id: string | number, data: any) => ({ id, ...data });

export const cancelAppointment = async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.map(apt => 
        apt.id === id ? { ...apt, estado: 'Cancelada' } : apt
    );
    return { success: true };
};

export const completeAppointment = async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.map(apt => 
        apt.id === id ? { ...apt, estado: 'Completada' } : apt
    );
    return { success: true };
};

// --- HISTORIAL CLÍNICO ---
export const getMedicalHistory = async (patientId: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const history = [
        { id: 1, fecha: '10 Mar 2024', hora: '10:00 AM', medico: 'Dra. Elena García', especialidad: 'Cardiología', diagnostico: 'Faringitis aguda con inflamación severa.', tratamiento: 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.', medicamentos: 'Amoxicilina, Paracetamol', observaciones: 'Paciente refiere dolor al tragar desde hace 48h.', notas: 'Cultivo faríngeo positivo. Sin complicaciones.' },
        { id: 2, fecha: '15 Ene 2024', hora: '11:30 AM', medico: 'Dr. Ricardo Martínez', especialidad: 'Medicina General', diagnostico: 'Control de Hipertensión Arterial', tratamiento: 'Enalapril 10mg diario. Dieta hiposódica.', medicamentos: 'Enalapril 10mg', observaciones: 'Presión arterial estable 120/80.', notas: 'Presión arterial estable 120/80. Próximo control en 3 meses.' },
    ] as any;
    history.records = history;
    return history;
};

export const createMedicalRecord = async (patientId: string | number, data: any) => ({ id: Math.random(), ...data });