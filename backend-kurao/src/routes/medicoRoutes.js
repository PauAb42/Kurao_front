const { Router } = require('express');
const medicoController = require('../controllers/medicoController');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = Router();

/**
 * @swagger
 * /medicos:
 *   get:
 *     summary: Listar médicos con búsqueda
 *     tags: [Médicos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nombre, especialidad o cédula
 *     responses:
 *       200:
 *         description: Lista de médicos
 */
router.get('/', requireAuth, requireRole('admin', 'recepcionista'), medicoController.list);

/**
 * @swagger
 * /medicos/{id}:
 *   get:
 *     summary: Detalle del médico con citas asignadas
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del médico
 */
router.get('/:id', requireAuth, requireRole('admin', 'recepcionista', 'medico'), medicoController.getById);

/**
 * @swagger
 * /medicos:
 *   post:
 *     summary: Crear nuevo médico
 *     tags: [Médicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, especialidad]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               especialidad:
 *                 type: string
 *               cedula:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               horario:
 *                 type: object
 *     responses:
 *       201:
 *         description: Médico creado
 */
router.post('/', requireAuth, requireRole('admin'), medicoController.create);

/**
 * @swagger
 * /medicos/{id}:
 *   put:
 *     summary: Actualizar médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Médico actualizado
 */
router.put('/:id', requireAuth, requireRole('admin'), medicoController.update);

/**
 * @swagger
 * /medicos/{id}:
 *   delete:
 *     summary: Eliminar médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Médico eliminado
 */
router.delete('/:id', requireAuth, requireRole('admin'), medicoController.delete);

module.exports = router;
