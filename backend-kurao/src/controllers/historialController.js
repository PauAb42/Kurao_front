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
        `SELECT h.id, h.fecha, h.diagnostico, h.tratamiento, h.medicamentos, h.observaciones,
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
      const { paciente_id, medico_id, fecha, diagnostico, tratamiento, medicamentos, observaciones } = req.body;

      if (!paciente_id || !medico_id || !fecha || !diagnostico) {
        return res.status(400).json({ error: 'Paciente, médico, fecha y diagnóstico son requeridos' });
      }

      const { rows } = await pool.query(
        `INSERT INTO historial_clinico (paciente_id, medico_id, fecha, diagnostico, tratamiento, medicamentos, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [paciente_id, medico_id, fecha, diagnostico, tratamiento, medicamentos, observaciones]
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

  async getById(req, res) {
    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT h.*, m.nombre || ' ' || m.apellido AS medico_nombre, m.especialidad AS medico_especialidad
         FROM historial_clinico h
         JOIN medicos m ON m.id = h.medico_id
         WHERE h.id = $1`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Registro no encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo registro de historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { medico_id, fecha, diagnostico, tratamiento, medicamentos, observaciones } = req.body;

      const existing = await pool.query('SELECT * FROM historial_clinico WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Registro de historial no encontrado' });
      }

      const fields = [];
      const values = [];
      let idx = 1;

      if (medico_id !== undefined)    { fields.push(`medico_id = $${idx++}`);    values.push(medico_id); }
      if (fecha !== undefined)        { fields.push(`fecha = $${idx++}`);        values.push(fecha); }
      if (diagnostico !== undefined)  { fields.push(`diagnostico = $${idx++}`);  values.push(diagnostico); }
      if (tratamiento !== undefined)  { fields.push(`tratamiento = $${idx++}`);  values.push(tratamiento); }
      if (medicamentos !== undefined) { fields.push(`medicamentos = $${idx++}`); values.push(medicamentos); }
      if (observaciones !== undefined){ fields.push(`observaciones = $${idx++}`); values.push(observaciones); }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      values.push(id);
      const { rows } = await pool.query(
        `UPDATE historial_clinico SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando registro de historial:', error);
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
