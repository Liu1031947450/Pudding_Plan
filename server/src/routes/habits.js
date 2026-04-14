const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

// 获取所有习惯（需要认证）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const habits = await db.getHabitsByUserId(req.userId);
    res.json({
      success: true,
      data: habits,
      message: 'success'
    });
  } catch (error) {
    console.error('获取习惯列表失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: '服务器内部错误'
    });
  }
});

// 切换习惯完成状态（需要认证）
router.post('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await db.getHabitById(id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Habit not found'
      });
    }

    // 验证习惯所有权
    if (habit.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: '无权操作此习惯'
      });
    }

    const updatedHabit = await db.updateHabit(id, { completed: !habit.completed });

    res.json({
      success: true,
      data: updatedHabit,
      message: 'success'
    });
  } catch (error) {
    console.error('切换习惯状态失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: '服务器内部错误'
    });
  }
});

// 创建习惯（需要认证）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const habitData = req.body;

    if (!habitData.title) {
      return res.status(400).json({
        success: false,
        data: null,
        error: '习惯标题不能为空'
      });
    }

    const newHabit = await db.createHabit({
      ...habitData,
      userId: req.userId,
      completed: habitData.completed || false
    });

    res.status(201).json({
      success: true,
      data: newHabit,
      message: '习惯创建成功'
    });
  } catch (error) {
    console.error('创建习惯失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: '服务器内部错误'
    });
  }
});

// 删除习惯（需要认证）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await db.getHabitById(id);

    if (!habit) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Habit not found'
      });
    }

    // 验证习惯所有权
    if (habit.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: '无权删除此习惯'
      });
    }

    await db.deleteHabit(id);

    res.json({
      success: true,
      data: true,
      message: '习惯删除成功'
    });
  } catch (error) {
    console.error('删除习惯失败:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: '服务器内部错误'
    });
  }
});

module.exports = router;
