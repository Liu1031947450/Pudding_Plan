const express = require('express');
const router = express.Router();
const { mockBuddies } = require('../data/mockData/communityData');

// 获取所有伙伴（公共数据，无需鉴权）
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [...mockBuddies],
    message: 'success'
  });
});

module.exports = router;
