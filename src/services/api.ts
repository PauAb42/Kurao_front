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

const MOCK_APPOINTMENTS = [
  { id: 1, paciente: "Juan Pérez", medico: "Dr. Smith", fecha: "2024-03-20", hora: "10:00 AM", estado: "Completada", motivo: "Chequeo de rutina" },
  { id: 2, paciente: "María García", medico: "Dra. Jones", fecha: "2024-03-20", hora: "11:30 AM", estado: "Programada", motivo: "Seguimiento de asma" },
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
export const login = async (credentials) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const users = {
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

export const updateProfile = async (id, data) => {
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

export const getPatientById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PATIENTS.find(p => p.id === Number(id)) || MOCK_PATIENTS[0];
};

export const createPatient = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Math.random(), ...data };
};

export const updatePatient = async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id, ...data };
};

export const deletePatient = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
};

// --- MÉDICOS ---
export const getDoctors = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS;
};

export const getDoctorById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const doctor = MOCK_DOCTORS.find(d => d.id === Number(id));
    return doctor || MOCK_DOCTORS[0];
};

export const createDoctor = async (data) => ({ id: Math.random(), ...data });
export const updateDoctor = async (id, data) => ({ id, ...data });
export const deleteDoctor = async (id) => ({ success: true });

// --- CITAS ---
export const getAppointments = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const result = [...MOCK_APPOINTMENTS] as any;
  result.appointments = result; 
  return result;
};

export const getAppointmentById = async (id) => MOCK_APPOINTMENTS[0];
export const createAppointment = async (data) => ({ id: Math.random(), ...data });
export const updateAppointment = async (id, data) => ({ id, ...data });
export const cancelAppointment = async (id) => ({ success: true });

// --- HISTORIAL CLÍNICO ---
export const getMedicalHistory = async (patientId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const history = [
        { id: 1, fecha: '10 Mar 2024', hora: '10:00 AM', medico: 'Dra. Elena García', especialidad: 'Cardiología', diagnostico: 'Faringitis aguda con inflamación severa.', tratamiento: 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.', medicamentos: 'Amoxicilina, Paracetamol', observaciones: 'Paciente refiere dolor al tragar desde hace 48h.', notas: 'Cultivo faríngeo positivo. Sin complicaciones.' },
        { id: 2, fecha: '15 Ene 2024', hora: '11:30 AM', medico: 'Dr. Ricardo Martínez', especialidad: 'Medicina General', diagnostico: 'Control de Hipertensión Arterial', tratamiento: 'Enalapril 10mg diario. Dieta hiposódica.', medicamentos: 'Enalapril 10mg', observaciones: 'Presión arterial estable 120/80.', notas: 'Presión arterial estable 120/80. Próximo control en 3 meses.' },
    ] as any;
    history.records = history;
    return history;
};

export const createMedicalRecord = async (patientId, data) => ({ id: Math.random(), ...data });