const pool = require('../config/database');

const historialController = {
  async getByPaciente(req, res) {
    try {
      const { pacienteId } = req.params;

      const paciente = await pool.query(
        'SELECT id, expediente, nombre, apellido, edad FROM pacientes WHERE id = $1',
        [pacienteId]
      );

      if (paciente.rows.length === 0) {
        return res.status(404).json({ error: 'Paciente no encontrado' });
      }

      const { rows } = await pool.query(
        `SELECT h.id, h.fecha, h.diagnostico, h.tratamiento, h.observaciones,
                m.nombre || ' ' || m.apellido AS medico_nombre,
                m.especialidad AS medico_especialidad
         FROM historial_clinico h
         JOIN medicos m ON m.id = h.medico_id
         WHERE h.paciente_id = $1
         ORDER BY h.fecha DESC`,
        [pacienteId]
      );

      res.json({
        paciente: paciente.rows[0],
        historial: rows,
      });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async create(req, res) {
    try {
      const { paciente_id, medico_id, fecha, diagnostico, tratamiento, observaciones } = req.body;

      if (!paciente_id || !medico_id || !fecha || !diagnostico) {
        return res.status(400).json({ error: 'Paciente, médico, fecha y diagnóstico son requeridos' });
      }

      const { rows } = await pool.query(
        `INSERT INTO historial_clinico (paciente_id, medico_id, fecha, diagnostico, tratamiento, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [paciente_id, medico_id, fecha, diagnostico, tratamiento, observaciones]
      );

      // Actualizar última visita del paciente
      await pool.query(
        'UPDATE pacientes SET ultima_visita = $1, updated_at = NOW() WHERE id = $2',
        [fecha, paciente_id]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creando registro de historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async buscarPaciente(req, res) {
    try {
      const { q = '' } = req.query;

      if (!q) {
        return res.json([]);
      }

      const { rows } = await pool.query(
        `SELECT id, expediente, nombre, apellido, edad
         FROM pacientes
         WHERE nombre ILIKE $1 OR apellido ILIKE $1 OR expediente ILIKE $1
         ORDER BY nombre ASC
         LIMIT 10`,
        [`%${q}%`]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error buscando paciente:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = historialController;
