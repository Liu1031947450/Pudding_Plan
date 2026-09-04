const express = require('express');
const router = express.Router();
const { Template } = require('../models');
const { ok, fail } = require('../utils/http');

// 获取所有模板
router.get('/', async (req, res) => {
  try {
    const data = await Template.findAll({
      order: [['id', 'ASC']],
    });
    ok(res, data, '获取模板列表成功');
  } catch (error) {
    console.error('获取模板列表失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

// 按分类获取模板
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const data = await Template.findAll({
      where: { category },
      order: [['id', 'ASC']],
    });
    ok(res, data, `获取 ${category} 分类模板成功`);
  } catch (error) {
    console.error('获取分类模板失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

// 根据 ID 获取单个模板
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Template.findByPk(id);
    if (!data) return fail(res, 404, '模板不存在');
    ok(res, data, '获取模板详情成功');
  } catch (error) {
    console.error('获取模板详情失败:', error);
    fail(res, 500, '服务器内部错误');
  }
});

module.exports = router;
