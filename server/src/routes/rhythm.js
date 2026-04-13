const express = require('express');
const router = express.Router();
const db = require('../data/database');

router.get('/week', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    console.log('[API] rhythm.getWeek - userId:', userId);
  }
  res.json({
    success: true,
    data: [...db.weekRhythmData],
    message: 'success'
  });
});

router.get('/month', (req, res) => {
  const { userId } = req.query;
  if (userId) {
    console.log('[API] rhythm.getMonth - userId:', userId);
  }
  res.json({
    success: true,
    data: [...db.monthRhythmData],
    message: 'success'
  });
});

module.exports = router;
