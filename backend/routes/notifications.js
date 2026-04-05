const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/notifications/my', requireAuth(), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const rows = await query(
      db,
      `SELECT n.id, n.title, n.message, n.target_role, n.target_user_id, n.created_at,
              u.full_name AS created_by
       FROM notifications n
       LEFT JOIN users u ON u.id = n.created_by_user_id
       WHERE (n.target_user_id IS NULL OR n.target_user_id = ?)
         AND (n.target_role IS NULL OR n.target_role = ?)
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [req.user.id, req.user.role]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
