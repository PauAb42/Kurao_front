const { Router } = require('express');
const authRoutes = require('./authRoutes');
const pacienteRoutes = require('./pacienteRoutes');
const medicoRoutes = require('./medicoRoutes');
const citaRoutes = require('./citaRoutes');
const historialRoutes = require('./historialRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/medicos', medicoRoutes);
router.use('/citas', citaRoutes);
router.use('/historial', historialRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
