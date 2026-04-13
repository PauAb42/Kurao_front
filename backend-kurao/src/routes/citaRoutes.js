const { Router } = require('express');
const citaController = require('../controllers/citaController');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = Router();

/**
 * @swagger
 * /citas:
 *   get:
 *     summary: Listar citas con filtros
 *     tags: [Citas]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por paciente o médico
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Pendiente, Confirmada, Completada, Cancelada]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de citas
 */
router.get('/', requireAuth, citaController.list);

/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Detalle de cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle de la cita
 */
router.get('/:id', requireAuth, citaController.getById);

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Agendar nueva cita
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paciente_id, medico_id, fecha, hora]
 *             properties:
 *               paciente_id:
 *                 type: integer
 *               medico_id:
 *                 type: integer
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cita creada
 */
router.post('/', requireAuth, requireRole('admin', 'recepcionista'), citaController.create);

/**
 * @swagger
 * /citas/{id}:
 *   put:
 *     summary: Modificar cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita actualizada
 */
router.put('/:id', requireAuth, requireRole('admin', 'recepcionista'), citaController.update);

/**
 * @swagger
 * /citas/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, Confirmada, Completada, Cancelada]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:id/estado', requireAuth, requireRole('admin', 'recepcionista', 'medico'), citaController.updateEstado);

/**
 * @swagger
 * /citas/{id}:
 *   delete:
 *     summary: Eliminar cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita eliminada
 */
router.delete('/:id', requireAuth, requireRole('admin'), citaController.delete);

module.exports = router;
