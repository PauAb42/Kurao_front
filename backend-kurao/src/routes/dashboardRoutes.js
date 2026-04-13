const { Router } = require('express');
const dashboardController = require('../controllers/dashboardController');
const requireAuth = require('../middlewares/requireAuth');

const router = Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtener métricas generales del hospital
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Métricas del dashboard
 */
router.get('/', requireAuth, dashboardController.getMetrics);

/**
 * @swagger
 * /dashboard/citas-hoy:
 *   get:
 *     summary: Obtener citas programadas para hoy
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Lista de citas de hoy
 */
router.get('/citas-hoy', requireAuth, dashboardController.getCitasHoy);

module.exports = router;
