const express = require('express');
const router = express.Router();
const db = require('../data/database');

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [...db.buddies],
    message: 'success'
  });
});

module.exports = router;
