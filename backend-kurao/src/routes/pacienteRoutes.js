const { Router } = require('express');
const pacienteController = require('../controllers/pacienteController');
const requireAuth = require('../middlewares/requireAuth');
const requireRole = require('../middlewares/requireRole');

const router = Router();

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Listar pacientes con paginación y búsqueda
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Registros por página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nombre o expediente
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', requireAuth, requireRole('admin', 'recepcionista', 'medico'), pacienteController.list);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Obtener detalle de paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del paciente
 */
router.get('/:id', requireAuth, requireRole('admin', 'recepcionista', 'medico'), pacienteController.getById);

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Crear nuevo paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *               edad:
 *                 type: integer
 *               genero:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente creado
 */
router.post('/', requireAuth, requireRole('admin', 'recepcionista'), pacienteController.create);

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Actualizar paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paciente actualizado
 */
router.put('/:id', requireAuth, requireRole('admin', 'recepcionista'), pacienteController.update);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Eliminar paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paciente eliminado
 */
router.delete('/:id', requireAuth, requireRole('admin'), pacienteController.delete);

module.exports = router;
