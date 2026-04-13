const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken, hashToken } = require('../utils/jwt');
const config = require('../config');

const authController = {
  async register(req, res) {
    try {
      const { nombre, email, password, rol, telefono, direccion } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      }

      const rolesPermitidos = ['admin', 'medico', 'recepcionista'];
      const rolFinal = rolesPermitidos.includes(rol) ? rol : 'recepcionista';

      const { rows: existente } = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (existente.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const { rows } = await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, rol, telefono, direccion)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, nombre, email, rol`,
        [nombre, email, password_hash, rolFinal, telefono || null, direccion || null]
      );

      const usuario = rows[0];
      const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre };
      const token = generateToken(payload);
      const tokenHash = hashToken(token);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await pool.query(
        'INSERT INTO sessions (usuario_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [usuario.id, tokenHash, expiresAt]
      );

      res.status(201).json({ token, usuario });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const { rows } = await pool.query(
        'SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const usuario = rows[0];

      if (!usuario.activo) {
        return res.status(401).json({ error: 'Cuenta desactivada' });
      }

      const validPassword = await bcrypt.compare(password, usuario.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      };

      const token = generateToken(payload);
      const tokenHash = hashToken(token);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await pool.query(
        'INSERT INTO sessions (usuario_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [usuario.id, tokenHash, expiresAt]
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async logout(req, res) {
    try {
      await pool.query(
        'UPDATE sessions SET revoked = true WHERE id = $1',
        [req.sessionId]
      );
      res.json({ message: 'Sesión cerrada correctamente' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getProfile(req, res) {
    try {
      const { rows } = await pool.query(
        'SELECT id, nombre, email, rol, telefono, direccion, activo, created_at FROM usuarios WHERE id = $1',
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { nombre, telefono, direccion } = req.body;

      const { rows } = await pool.query(
        `UPDATE usuarios SET nombre = COALESCE($1, nombre), telefono = COALESCE($2, telefono),
         direccion = COALESCE($3, direccion), updated_at = NOW()
         WHERE id = $4 RETURNING id, nombre, email, rol, telefono, direccion`,
        [nombre, telefono, direccion, req.user.id]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async getAccesibilidad(req, res) {
    try {
      const { rows } = await pool.query(
        'SELECT tamano_texto, alto_contraste, espaciado_texto, subrayar_enlaces FROM preferencias_accesibilidad WHERE usuario_id = $1',
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.json({
          tamano_texto: 'Normal',
          alto_contraste: false,
          espaciado_texto: false,
          subrayar_enlaces: false,
        });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo accesibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async updateAccesibilidad(req, res) {
    try {
      const { tamano_texto, alto_contraste, espaciado_texto, subrayar_enlaces } = req.body;

      const { rows } = await pool.query(
        `INSERT INTO preferencias_accesibilidad (usuario_id, tamano_texto, alto_contraste, espaciado_texto, subrayar_enlaces)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (usuario_id) DO UPDATE SET
           tamano_texto = EXCLUDED.tamano_texto,
           alto_contraste = EXCLUDED.alto_contraste,
           espaciado_texto = EXCLUDED.espaciado_texto,
           subrayar_enlaces = EXCLUDED.subrayar_enlaces
         RETURNING tamano_texto, alto_contraste, espaciado_texto, subrayar_enlaces`,
        [req.user.id, tamano_texto || 'Normal', alto_contraste || false, espaciado_texto || false, subrayar_enlaces || false]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error actualizando accesibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },
};

module.exports = authController;
