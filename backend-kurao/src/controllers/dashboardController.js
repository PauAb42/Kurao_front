const pool = require('../config/database');

const dashboardController = {
  async getMetrics(req, res) {
    try {
      const [totalPacientes, citasHoy, medicosActivos, citasPendientes] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM pacientes'),
        pool.query('SELECT COUNT(*) FROM citas WHERE fecha = CURRENT_DATE'),
        pool.query('SELECT COUNT(*) FROM medicos WHERE activo = true'),
        pool.query("SELECT COUNT(*) FROM citas WHERE estado = 'Pendiente'"),
      ]);

      res.json({
        total_pacientes: parseInt(totalPacientes.rows[0].count),
        citas_hoy: parseInt(citasHoy.rows[0].count),
        medicos_activos: parseInt(medicosActivos.rows[0].count),
        citas_pendientes: parseInt(citasPendientes.rows[0].count),
      });
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getCitasHoy(req, res) {
    try {
      const { rows } = await pool.query(
        `SELECT c.id, c.hora, c.estado, c.motivo,
                p.nombre || ' ' || p.apellido AS paciente_nombre,
                m.nombre || ' ' || m.apellido AS medico_nombre
         FROM citas c
         JOIN pacientes p ON p.id = c.paciente_id
         JOIN medicos m ON m.id = c.medico_id
         WHERE c.fecha = CURRENT_DATE
         ORDER BY c.hora ASC`
      );

      res.json(rows);
    } catch (error) {
      console.error('Error obteniendo citas de hoy:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = dashboardController;
