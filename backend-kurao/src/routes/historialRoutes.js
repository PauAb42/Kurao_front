const { Router } = require('express');
const historialController = require('../controllers/historialController');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = Router();

/**
 * @swagger
 * /historial/buscar:
 *   get:
 *     summary: Buscar paciente por nombre para historial
 *     tags: [Historial Clínico]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nombre o expediente
 *     responses:
 *       200:
 *         description: Lista de pacientes encontrados
 */
router.get('/buscar', requireAuth, historialController.buscarPaciente);

/**
 * @swagger
 * /historial/paciente/{pacienteId}:
 *   get:
 *     summary: Obtener historial clínico de un paciente
 *     tags: [Historial Clínico]
 *     parameters:
 *       - in: path
 *         name: pacienteId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial del paciente
 */
router.get('/paciente/:pacienteId', requireAuth, historialController.getByPaciente);

/**
 * @swagger
 * /historial:
 *   post:
 *     summary: Agregar consulta al historial clínico
 *     tags: [Historial Clínico]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paciente_id, medico_id, fecha, diagnostico]
 *             properties:
 *               paciente_id:
 *                 type: integer
 *               medico_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               diagnostico:
 *                 type: string
 *               tratamiento:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro de historial creado
 */
router.get('/:id', requireAuth, historialController.getById);

router.post('/', requireAuth, requireRole('admin', 'medico'), historialController.create);

/**
 * @swagger
 * /historial/{id}:
 *   put:
 *     summary: Actualizar registro del historial clínico
 *     tags: [Historial Clínico]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medico_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               diagnostico:
 *                 type: string
 *               tratamiento:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registro actualizado
 */
router.put('/:id', requireAuth, requireRole('admin', 'medico'), historialController.update);

module.exports = router;
