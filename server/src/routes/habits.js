const express = require('express');
const router = express.Router();
const db = require('../data/database');

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [...db.habits],
    message: 'success'
  });
});

router.post('/:id/toggle', (req, res) => {
  const { id } = req.params;
  const habit = db.habits.find(h => h.id === id);
  if (!habit) {
    return res.json({
      success: false,
      data: null,
      error: 'Habit not found'
    });
  }
  habit.completed = !habit.completed;
  res.json({
    success: true,
    data: habit,
    message: 'success'
  });
});

module.exports = router;
