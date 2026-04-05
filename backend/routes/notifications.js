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
              u.full_name AS created_by,
              CASE WHEN nr.id IS NULL THEN 0 ELSE 1 END AS is_read
       FROM notifications n
       LEFT JOIN users u ON u.id = n.created_by_user_id
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       WHERE (n.target_user_id IS NULL OR n.target_user_id = ?)
         AND (n.target_role IS NULL OR n.target_role = ?)
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [req.user.id, req.user.id, req.user.role]
    );

    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.get('/notifications/unread-count', requireAuth(), async (req, res) => {
  try {
    const query = req.app.locals.query;
    const db = req.app.locals.db;

    const rows = await query(
      db,
      `SELECT COUNT(*) AS c
       FROM notifications n
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       WHERE (n.target_user_id IS NULL OR n.target_user_id = ?)
         AND (n.target_role IS NULL OR n.target_role = ?)
         AND nr.id IS NULL`,
      [req.user.id, req.user.id, req.user.role]
    );

    res.json({ unread: rows?.[0]?.c || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/notifications/:id/read', requireAuth(), async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    if (!notificationId) return res.status(400).json({ message: 'Invalid id' });

    const query = req.app.locals.query;
    const db = req.app.locals.db;

    await query(
      db,
      'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
      [notificationId, req.user.id]
    );

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
