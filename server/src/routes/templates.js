const express = require('express');
const router = express.Router();
const db = require('../data/database');

router.get('/', (req, res) => {
  const data = Object.values(db.templates);
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = db.templates[id] || null;
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const data = Object.values(db.templates).filter(t => t.category === category);
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

module.exports = router;
