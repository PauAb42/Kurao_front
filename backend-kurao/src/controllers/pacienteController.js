const pool = require('../config/database');

function calculateAge(fechaNacimiento) {
  if (!fechaNacimiento) return undefined;
  const birth = new Date(fechaNacimiento);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

const pacienteController = {
  async list(req, res) {
    try {
      const { page = 1, limit = 10, q = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const params = [];

      if (q) {
        whereClause = 'WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR expediente ILIKE $1';
        params.push(`%${q}%`);
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM pacientes ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      const dataParams = [...params, limit, offset];
      const { rows } = await pool.query(
        `SELECT id, expediente, nombre, apellido, edad, telefono, ultima_visita, estado, tipo_sangre
         FROM pacientes ${whereClause}
         ORDER BY id ASC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        dataParams
      );

      res.json({
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error listando pacientes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const { rows } = await pool.query(
        `SELECT * FROM pacientes WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async create(req, res) {
    try {
      const {
        nombre, apellido, fecha_nacimiento, edad, genero, telefono, email, direccion,
        curp, ocupacion, contacto_emergencia, tel_emergencia, tipo_sangre,
        alergias, antecedentes, medicamentos, peso, altura, presion, temp
      } = req.body;

      if (!nombre || !apellido) {
        return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
      }

      const computedEdad = edad !== undefined ? Number(edad) : calculateAge(fecha_nacimiento);

      // Generar expediente automático
      const lastExp = await pool.query(
        "SELECT expediente FROM pacientes ORDER BY id DESC LIMIT 1"
      );

      let nextNum = 1;
      if (lastExp.rows.length > 0) {
        const lastNum = parseInt(lastExp.rows[0].expediente.split('-')[1]);
        nextNum = lastNum + 1;
      }
      const expediente = `EXP-${String(nextNum).padStart(3, '0')}`;

      const { rows } = await pool.query(
        `INSERT INTO pacientes (expediente, nombre, apellido, fecha_nacimiento, edad, genero, telefono, email, direccion,
         curp, ocupacion, contacto_emergencia, tel_emergencia, tipo_sangre, alergias, antecedentes, medicamentos, peso, altura, presion, temp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         RETURNING *`,
        [expediente, nombre, apellido, fecha_nacimiento, computedEdad, genero, telefono, email, direccion,
         curp, ocupacion, contacto_emergencia, tel_emergencia, tipo_sangre, alergias, antecedentes, medicamentos,
         peso || null, altura || null, presion, temp || null]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creando paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre, apellido, fecha_nacimiento, edad, genero, telefono, email, direccion, estado,
        curp, ocupacion, contacto_emergencia, tel_emergencia, tipo_sangre,
        alergias, antecedentes, medicamentos, peso, altura, presion, temp, notas
      } = req.body;
      const computedEdad = edad !== undefined ? Number(edad) : calculateAge(fecha_nacimiento);

      const { rows } = await pool.query(
        `UPDATE pacientes SET
          nombre = COALESCE($1, nombre),
          apellido = COALESCE($2, apellido),
          fecha_nacimiento = COALESCE($3, fecha_nacimiento),
          edad = COALESCE($4, edad),
          genero = COALESCE($5, genero),
          telefono = COALESCE($6, telefono),
          email = COALESCE($7, email),
          direccion = COALESCE($8, direccion),
          estado = COALESCE($9, estado),
          curp = COALESCE($10, curp),
          ocupacion = COALESCE($11, ocupacion),
          contacto_emergencia = COALESCE($12, contacto_emergencia),
          tel_emergencia = COALESCE($13, tel_emergencia),
          tipo_sangre = COALESCE($14, tipo_sangre),
          alergias = COALESCE($15, alergias),
          antecedentes = COALESCE($16, antecedentes),
          medicamentos = COALESCE($17, medicamentos),
          peso = COALESCE($18, peso),
          altura = COALESCE($19, altura),
          presion = COALESCE($20, presion),
          temp = COALESCE($21, temp),
          notas = COALESCE($22, notas),
          updated_at = NOW()
         WHERE id = $23
         RETURNING *`,
        [nombre, apellido, fecha_nacimiento, computedEdad, genero, telefono, email, direccion, estado,
         curp, ocupacion, contacto_emergencia, tel_emergencia, tipo_sangre,
         alergias, antecedentes, medicamentos,
         peso !== undefined && peso !== '' ? peso : null,
         altura !== undefined && altura !== '' ? altura : null,
         presion, temp !== undefined && temp !== '' ? temp : null,
         notas, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const { rowCount } = await pool.query(
        'DELETE FROM pacientes WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      res.json({ message: 'Paciente eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = pacienteController;
