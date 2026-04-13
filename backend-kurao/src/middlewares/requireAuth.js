const pool = require('../config/database');
const { verifyToken, hashToken } = require('../utils/jwt');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const tokenHash = hashToken(token);
    const { rows } = await pool.query(
      'SELECT id FROM sessions WHERE token_hash = $1 AND revoked = false AND expires_at > NOW()',
      [tokenHash]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    req.user = decoded;
    req.sessionId = rows[0].id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = requireAuth;
