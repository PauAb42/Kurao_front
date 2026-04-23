const pool = require('../config/database');

const citaController = {
  async list(req, res) {
    try {
      const { q = '', estado = '', paciente_id = '' } = req.query;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (q) {
        params.push(`%${q}%`);
        whereClause += ` AND (p.nombre ILIKE $${params.length} OR p.apellido ILIKE $${params.length} OR m.nombre ILIKE $${params.length} OR m.apellido ILIKE $${params.length})`;
      }

      if (estado) {
        params.push(estado);
        whereClause += ` AND c.estado = $${params.length}`;
      }

      if (paciente_id) {
        params.push(paciente_id);
        whereClause += ` AND c.paciente_id = $${params.length}`;
      }

      const { rows } = await pool.query(
        `SELECT c.id, c.fecha, c.hora, c.motivo, c.estado, c.notas,
                p.nombre || ' ' || p.apellido AS paciente_nombre,
                p.id AS paciente_id,
                m.nombre || ' ' || m.apellido AS medico_nombre,
                m.id AS medico_id
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         JOIN medicos m ON m.id = c.medico_id
         ${whereClause}
         ORDER BY c.fecha DESC, c.hora ASC`,
        params
      );

      res.json(rows);
    } catch (error) {
      console.error('Error listando citas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const { rows } = await pool.query(
        `SELECT c.*,
                p.nombre || ' ' || p.apellido AS paciente_nombre,
                p.expediente AS paciente_expediente,
                m.nombre || ' ' || m.apellido AS medico_nombre,
                m.especialidad AS medico_especialidad
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         JOIN medicos m ON m.id = c.medico_id
         WHERE c.id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async create(req, res) {
    try {
      const { paciente_id, medico_id, fecha, hora, motivo } = req.body;

      if (!paciente_id || !medico_id || !fecha || !hora) {
        return res.status(400).json({ error: 'Paciente, médico, fecha y hora son requeridos' });
      }

      const { rows } = await pool.query(
        `INSERT INTO citas (paciente_id, medico_id, fecha, hora, motivo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [paciente_id, medico_id, fecha, hora, motivo]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creando cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { paciente_id, medico_id, fecha, hora, motivo, notas } = req.body;

      const { rows } = await pool.query(
        `UPDATE citas SET
          paciente_id = COALESCE($1, paciente_id),
          medico_id = COALESCE($2, medico_id),
          fecha = COALESCE($3, fecha),
          hora = COALESCE($4, hora),
          motivo = COALESCE($5, motivo),
          notas = COALESCE($6, notas),
          updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [paciente_id, medico_id, fecha, hora, motivo, notas, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async updateEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['Pendiente', 'Confirmada', 'Completada', 'Cancelada'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Usar: Pendiente, Confirmada, Completada, Cancelada' });
      }

      const { rows } = await pool.query(
        `UPDATE citas SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [estado, id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando estado de cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const { rowCount } = await pool.query(
        'DELETE FROM citas WHERE id = $1',
        [id]
      );

      if (rowCount === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
      console.error('Error eliminando cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = citaController;
