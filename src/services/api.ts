// Mock data for the demo
const MOCK_USER = {
  id: "1",
  nombre: "Admin Kurao",
  email: "admin@kurao.com",
  rol: "admin"
};

const MOCK_STATS = {
  totalPatients: 1250,
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
  { id: 1, nombre: "Juan Pérez", edad: 45, genero: "M", ultimaVisita: "2024-03-15", estado: "Estable" },
  { id: 2, nombre: "María García", edad: 32, genero: "F", ultimaVisita: "2024-03-18", estado: "En tratamiento" },
  { id: 3, nombre: "Carlos López", edad: 58, genero: "M", ultimaVisita: "2024-03-10", estado: "Crítico" },
];

const MOCK_APPOINTMENTS = [
  { id: 1, paciente: "Juan Pérez", medico: "Dr. Smith", fecha: "2024-03-20", hora: "10:00", estado: "Confirmada" },
  { id: 2, paciente: "María García", medico: "Dra. Jones", fecha: "2024-03-20", hora: "11:30", estado: "Pendiente" },
];

const MOCK_DOCTORS = [
  { id: 1, nombre: "Dr. Smith", especialidad: "Cardiología" },
  { id: 2, nombre: "Dra. Jones", especialidad: "Pediatría" }
];

// Auth
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
    return {
      token: "mock_token_" + user.id,
      user
    };
  } else {
    throw new Error("Credenciales inválidas. Use kurao123 como contraseña.");
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

// Dashboard
export const getDashboardStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_STATS;
};

// Pacientes
export const getPatients = async (page = 1, limit = 10, search = "") => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    pacientes: MOCK_PATIENTS,
    total: 3,
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

// Médicos
export const getDoctors = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_DOCTORS;
};

export const getDoctorById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_DOCTORS.find(d => d.id === Number(id)) || MOCK_DOCTORS[0];
};

export const createDoctor = async (data) => ({ id: Math.random(), ...data });
export const updateDoctor = async (id, data) => ({ id, ...data });
export const deleteDoctor = async (id) => ({ success: true });

// Citas
export const getAppointments = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_APPOINTMENTS;
};

export const getAppointmentById = async (id) => MOCK_APPOINTMENTS[0];
export const createAppointment = async (data) => ({ id: Math.random(), ...data });
export const updateAppointment = async (id, data) => ({ id, ...data });
export const cancelAppointment = async (id) => ({ success: true });

// Historial Clínico
export const getMedicalHistory = async (patientId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 1, fecha: '10 Mar 2024', medico: 'Dra. Elena García', especialidad: 'Cardiología', diagnostico: 'Faringitis aguda con inflamación severa.', tratamiento: 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.', observaciones: 'Paciente refiere dolor al tragar desde hace 48h.' },
        { id: 2, fecha: '15 Ene 2024', medico: 'Dr. Ricardo Martínez', especialidad: 'Medicina General', diagnostico: 'Control de Hipertensión Arterial', tratamiento: 'Enalapril 10mg diario. Dieta hiposódica.', observaciones: 'Presión arterial estable 120/80.' },
    ];
};

export const createMedicalRecord = async (patientId, data) => ({ id: Math.random(), ...data });
