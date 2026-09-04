const express = require('express');
const router = express.Router();
const { Feedback } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { ok, fail } = require('../utils/http');

router.post('/', authMiddleware, async (req, res) => {
  const { category, content, contact } = req.body || {};
  const trimmedContent = typeof content === 'string' ? content.trim() : '';
  const trimmedContact = typeof contact === 'string' ? contact.trim() : '';

  if (!['suggestion', 'issue', 'experience', 'other'].includes(category)) {
    return fail(res, 400, '反馈类型无效');
  }
  if (trimmedContent.length < 5 || trimmedContent.length > 500) {
    return fail(res, 400, '反馈内容应为5至500个字符');
  }
  if (trimmedContact.length > 100) {
    return fail(res, 400, '联系方式不能超过100个字符');
  }

  try {
    const feedback = await Feedback.create({
      userId: req.user.id,
      category,
      content: trimmedContent,
      contact: trimmedContact || null,
    });
    ok(
      res,
      { id: String(feedback.id), status: feedback.status },
      '反馈已提交',
      201,
    );
  } catch (error) {
    console.error('提交反馈失败:', error);
    fail(res, 500, '提交反馈失败');
  }
});

module.exports = router;
