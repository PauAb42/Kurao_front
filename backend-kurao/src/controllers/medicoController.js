const pool = require('../config/database');

const medicoController = {
  async list(req, res) {
    try {
      const { q = '' } = req.query;

      let whereClause = '';
      const params = [];

      if (q) {
        whereClause = 'WHERE m.nombre ILIKE $1 OR m.apellido ILIKE $1 OR m.especialidad ILIKE $1 OR m.cedula ILIKE $1';
        params.push(`%${q}%`);
      }

      const { rows } = await pool.query(
        `SELECT m.id, m.nombre, m.apellido, m.especialidad, m.cedula, m.telefono, m.email, m.horario, m.activo
         FROM medicos m ${whereClause}
         ORDER BY m.id ASC`,
        params
      );

      res.json(rows);
    } catch (error) {
      console.error('Error listando médicos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const medico = await pool.query(
        'SELECT * FROM medicos WHERE id = $1',
        [id]
      );

      if (medico.rows.length === 0) {
        return res.status(404).json({ error: 'Médico no encontrado' });
      }

      const citas = await pool.query(
        `SELECT c.id, c.fecha, c.hora, c.motivo, c.estado,
                p.nombre || ' ' || p.apellido AS paciente_nombre
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         WHERE c.medico_id = $1
         ORDER BY c.fecha DESC, c.hora DESC
         LIMIT 20`,
        [id]
      );

      res.json({
        ...medico.rows[0],
        citas: citas.rows,
      });
    } catch (error) {
      console.error('Error obteniendo médico:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async create(req, res) {
    try {
      const { nombre, apellido, especialidad, cedula, telefono, email, horario } = req.body;

      if (!nombre || !apellido || !especialidad) {
        return res.status(400).json({ error: 'Nombre, apellido y especialidad son requeridos' });
      }

      const { rows } = await pool.query(
        `INSERT INTO medicos (nombre, apellido, especialidad, cedula, telefono, email, horario)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [nombre, apellido, especialidad, cedula, telefono, email, horario ? JSON.stringify(horario) : '{}']
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'La cédula ya está registrada' });
      }
      console.error('Error creando médico:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, especialidad, cedula, telefono, email, horario, activo } = req.body;

      const { rows } = await pool.query(
        `UPDATE medicos SET
          nombre = COALESCE($1, nombre),
          apellido = COALESCE($2, apellido),
          especialidad = COALESCE($3, especialidad),
          cedula = COALESCE($4, cedula),
          telefono = COALESCE($5, telefono),
          email = COALESCE($6, email),
          horario = COALESCE($7, horario),
          activo = COALESCE($8, activo),
          updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [nombre, apellido, especialidad, cedula, telefono, email, horario ? JSON.stringify(horario) : null, activo, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Médico no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'La cédula ya está registrada' });
      }
      console.error('Error actualizando médico:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const { rowCount } = await pool.query(
        'DELETE FROM medicos WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Médico no encontrado' });
      }

      res.json({ message: 'Médico eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando médico:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = medicoController;
