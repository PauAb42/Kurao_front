-- =============================================
-- Kurao - Sistema de Gestión Hospitalaria
-- Script de inicialización de base de datos
-- =============================================

-- Crear base de datos (ejecutar manualmente si es necesario)
-- CREATE DATABASE kurao;

-- =============================================
-- TABLAS
-- =============================================

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'medico', 'recepcionista')),
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  expediente VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  edad INT,
  genero VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(150),
  direccion TEXT,
  estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
  ultima_visita DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicos (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100) NOT NULL,
  cedula VARCHAR(50) UNIQUE,
  telefono VARCHAR(20),
  email VARCHAR(150),
  horario JSONB DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id INT NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  motivo TEXT,
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Completada', 'Cancelada')),
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_clinico (
  id SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  medico_id INT NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preferencias_accesibilidad (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tamano_texto VARCHAR(20) DEFAULT 'Normal',
  alto_contraste BOOLEAN DEFAULT false,
  espaciado_texto BOOLEAN DEFAULT false,
  subrayar_enlaces BOOLEAN DEFAULT false
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_sessions_usuario ON sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_pacientes_expediente ON pacientes(expediente);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre, apellido);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad);
CREATE INDEX IF NOT EXISTS idx_medicos_cedula ON medicos(cedula);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_historial_paciente ON historial_clinico(paciente_id);

-- =============================================
-- DATOS SEED
-- =============================================

-- Admin: admin@kurao.com / admin123
-- Hash generado con bcryptjs (10 rounds)
INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, direccion) VALUES
  ('Admin Kurao', 'admin@kurao.com', '$2b$10$pGNd/mwNrZGzxRPA2ty4XuR9jSwJ4jbBu.FHAEXu1SMNVlm1j8v..', 'admin', '555-0123', 'Ciudad de México, México')
ON CONFLICT (email) DO NOTHING;

-- Usuarios médicos
INSERT INTO usuarios (nombre, email, password_hash, rol, telefono) VALUES
  ('Dra. Elena García', 'elena.garcia@kurao.com', '$2b$10$pGNd/mwNrZGzxRPA2ty4XuR9jSwJ4jbBu.FHAEXu1SMNVlm1j8v..', 'medico', '555-0201'),
  ('Dr. Ricardo Martínez', 'ricardo.martinez@kurao.com', '$2b$10$pGNd/mwNrZGzxRPA2ty4XuR9jSwJ4jbBu.FHAEXu1SMNVlm1j8v..', 'medico', '555-0202'),
  ('Dr. Roberto Sánchez', 'roberto.sanchez@kurao.com', '$2b$10$pGNd/mwNrZGzxRPA2ty4XuR9jSwJ4jbBu.FHAEXu1SMNVlm1j8v..', 'medico', '555-0203')
ON CONFLICT (email) DO NOTHING;

-- Usuario recepcionista
INSERT INTO usuarios (nombre, email, password_hash, rol, telefono) VALUES
  ('María Recepción', 'recepcion@kurao.com', '$2b$10$pGNd/mwNrZGzxRPA2ty4XuR9jSwJ4jbBu.FHAEXu1SMNVlm1j8v..', 'recepcionista', '555-0300')
ON CONFLICT (email) DO NOTHING;

-- Médicos
INSERT INTO medicos (usuario_id, nombre, apellido, especialidad, cedula, telefono, email, horario) VALUES
  (2, 'Elena', 'García', 'Cardiología', 'CED-001', '555-0201', 'elena.garcia@kurao.com',
    '{"lunes":"09:00-17:00","martes":"09:00-17:00","miercoles":"09:00-17:00","jueves":"09:00-17:00","viernes":"09:00-14:00"}'),
  (3, 'Ricardo', 'Martínez', 'Medicina General', 'CED-002', '555-0202', 'ricardo.martinez@kurao.com',
    '{"lunes":"08:00-16:00","martes":"08:00-16:00","miercoles":"08:00-16:00","jueves":"08:00-16:00","viernes":"08:00-13:00"}'),
  (4, 'Roberto', 'Sánchez', 'Pediatría', 'CED-003', '555-0203', 'roberto.sanchez@kurao.com',
    '{"lunes":"10:00-18:00","martes":"10:00-18:00","miercoles":"10:00-18:00","jueves":"10:00-18:00","viernes":"10:00-15:00"}')
ON CONFLICT (cedula) DO NOTHING;

-- Pacientes
INSERT INTO pacientes (expediente, nombre, apellido, fecha_nacimiento, edad, genero, telefono, email, direccion, estado, ultima_visita) VALUES
  ('EXP-001', 'Juan', 'Pérez', '1979-05-15', 45, 'Masculino', '555-0101', 'juan.perez@email.com', 'Col. Centro, CDMX', 'Activo', '2024-03-10'),
  ('EXP-002', 'María', 'López', '1992-08-22', 32, 'Femenino', '555-0102', 'maria.lopez@email.com', 'Col. Roma, CDMX', 'Activo', '2024-03-15'),
  ('EXP-003', 'Carlos', 'Ruiz', '1996-11-03', 28, 'Masculino', '555-0103', 'carlos.ruiz@email.com', 'Col. Condesa, CDMX', 'Inactivo', '2024-02-20'),
  ('EXP-004', 'Ana', 'Beltrán', '1970-02-14', 54, 'Femenino', '555-0104', 'ana.beltran@email.com', 'Col. Polanco, CDMX', 'Activo', '2024-03-18')
ON CONFLICT (expediente) DO NOTHING;

-- Citas
INSERT INTO citas (paciente_id, medico_id, fecha, hora, motivo, estado) VALUES
  (1, 1, '2024-03-20', '10:00', 'Consulta de seguimiento cardiológico', 'Confirmada'),
  (2, 3, '2024-03-20', '11:30', 'Revisión pediátrica', 'Pendiente'),
  (3, 1, '2024-03-21', '09:00', 'Electrocardiograma de control', 'Confirmada'),
  (4, 2, '2024-03-21', '12:00', 'Control de hipertensión', 'Cancelada')
ON CONFLICT DO NOTHING;

-- Historial clínico
INSERT INTO historial_clinico (paciente_id, medico_id, fecha, diagnostico, tratamiento, observaciones) VALUES
  (1, 1, '2024-03-10', 'Faringitis aguda con inflamación severa.', 'Amoxicilina 500mg c/8h por 7 días, Paracetamol 500mg c/6h.', 'Paciente refiere dolor al tragar desde hace 48h.'),
  (1, 2, '2024-01-15', 'Control de Hipertensión Arterial', 'Enalapril 10mg diario. Dieta hiposódica.', 'Presión arterial estable 120/80.'),
  (2, 2, '2024-03-15', 'Infección de vías respiratorias superiores', 'Azitromicina 500mg por 3 días. Reposo.', 'Cuadro de 3 días de evolución con tos y rinorrea.'),
  (4, 1, '2024-03-18', 'Arritmia sinusal leve', 'Monitoreo con Holter 24h. Control en 2 semanas.', 'Paciente asintomática, hallazgo incidental en ECG de rutina.')
ON CONFLICT DO NOTHING;
