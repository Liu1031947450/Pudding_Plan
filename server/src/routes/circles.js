const express = require('express');
const router = express.Router();
const db = require('../data/database');

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [...db.circles],
    message: 'success'
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = db.circles.find(c => c.id === id) || null;
  res.json({
    success: true,
    data,
    message: 'success'
  });
});

router.post('/:id/join', (req, res) => {
  const { id } = req.params;
  const circle = db.circles.find(c => c.id === id);
  res.json({
    success: true,
    data: !!circle,
    message: 'success'
  });
});

router.post('/', (req, res) => {
  const moment = req.body;
  const newMoment = {
    id: `m_${Date.now()}`,
    title: moment.title || '',
    description: moment.description,
    content: moment.content,
    members: moment.members || '1',
    type: 'waterfall',
    imageUri: moment.imageUri,
    images: moment.images,
    category: moment.category,
    authorName: moment.authorName || '我',
    authorAvatarUri: moment.authorAvatarUri || 'https://i.pravatar.cc/150?u=me',
    likes: 0,
    commentsCount: 0,
    comments: [],
    isLiked: false,
    isCollected: false,
  };
  db.circles.unshift(newMoment);
  console.log('[API] circles.create - 发布成功:', newMoment);
  res.json({
    success: true,
    data: newMoment,
    message: 'success'
  });
});

router.get('/locations/nearby', (req, res) => {
  res.json({
    success: true,
    data: [...db.locations],
    message: 'success'
  });
});

router.get('/topics/trending', (req, res) => {
  res.json({
    success: true,
    data: [...db.topics],
    message: 'success'
  });
});

module.exports = router;
