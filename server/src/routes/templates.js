const express = require('express');
const router = express.Router();
const { templateDetails } = require('../data/mockData/templates');

router.get('/', (req, res) => {
  const data = Object.values(templateDetails);
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const data = Object.values(templateDetails).filter(
    template => template.category === category,
  );
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = templateDetails[id] || null;
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

module.exports = router;
