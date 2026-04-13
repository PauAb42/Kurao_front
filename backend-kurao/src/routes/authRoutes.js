const { Router } = require('express');
const authController = require('../controllers/authController');
const requireAuth = require('../middlewares/requireAuth');

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [admin, medico, recepcionista]
 *                 default: recepcionista
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: El email ya está registrado
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Perfil del usuario
 */
router.get('/me', requireAuth, authController.getProfile);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Actualizar perfil del usuario actual
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/me', requireAuth, authController.updateProfile);

/**
 * @swagger
 * /auth/me/accesibilidad:
 *   get:
 *     summary: Obtener preferencias de accesibilidad
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Preferencias de accesibilidad
 */
router.get('/me/accesibilidad', requireAuth, authController.getAccesibilidad);

/**
 * @swagger
 * /auth/me/accesibilidad:
 *   put:
 *     summary: Actualizar preferencias de accesibilidad
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tamano_texto:
 *                 type: string
 *                 enum: [Pequeño, Normal, Grande, Muy Grande]
 *               alto_contraste:
 *                 type: boolean
 *               espaciado_texto:
 *                 type: boolean
 *               subrayar_enlaces:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferencias actualizadas
 */
router.put('/me/accesibilidad', requireAuth, authController.updateAccesibilidad);

module.exports = router;
