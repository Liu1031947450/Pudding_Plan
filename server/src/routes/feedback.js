const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  const { category, content, contact } = req.body || {};
  const trimmedContent = typeof content === 'string' ? content.trim() : '';
  const trimmedContact = typeof contact === 'string' ? contact.trim() : '';

  if (!['suggestion', 'issue', 'experience', 'other'].includes(category)) {
    return res.status(400).json({ success: false, error: '反馈类型无效' });
  }
  if (trimmedContent.length < 5 || trimmedContent.length > 500) {
    return res
      .status(400)
      .json({ success: false, error: '反馈内容应为5至500个字符' });
  }
  if (trimmedContact.length > 100) {
    return res
      .status(400)
      .json({ success: false, error: '联系方式不能超过100个字符' });
  }

  try {
    const feedback = await Feedback.create({
      userId: req.user.id,
      category,
      content: trimmedContent,
      contact: trimmedContact || null,
    });
    res.status(201).json({
      success: true,
      data: { id: String(feedback.id), status: feedback.status },
      message: '反馈已提交',
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({ success: false, error: '提交反馈失败' });
  }
});

module.exports = router;
