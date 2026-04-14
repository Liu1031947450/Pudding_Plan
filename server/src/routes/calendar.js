const express = require('express');
const router = express.Router();
const db = require('../data/database');
const { authMiddleware } = require('../middleware/auth');

const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error
  });
};

// 获取日历数据（需要认证）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return sendResponse(res, false, null, '', '请提供年份和月份');
    }

    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return sendResponse(res, false, null, '', '请提供有效的年份和月份');
    }

    const calendarData = await db.getCalendarMonthDataByUserId(req.userId, year, month);
    sendResponse(res, true, calendarData, '获取日历数据成功');
  } catch (error) {
    console.error('获取日历数据失败:', error);
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 获取每日 quote
router.get('/quote', (req, res) => {
  try {
    const quotes = [
      {
        text: '生活就像海洋，只有意志坚强的人，才能到达彼岸。',
        author: '马原',
      },
      { text: '不要等待机会，而要创造机会。', author: '无名' },
      { text: '成功的秘诀在于对目标的执着追求。', author: '本杰明·富兰克林' },
      {
        text: '行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。',
        author: '无名氏',
      },
      { text: '真正的高贵应该是优于过去的自己。', author: '海明威' },
    ];
    const today = new Date().getDate();

    sendResponse(res, true, quotes[today % quotes.length], '获取每日语录成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

// 更新日历数据
router.patch('/', authMiddleware, (req, res) => {
  try {
    const { day, hasActivity, activityType } = req.body;

    if (day === undefined) {
      return sendResponse(res, false, null, '', '请提供日期');
    }

    sendResponse(res, true, {
      day,
      hasActivity,
      activityType,
    }, '日历数据更新成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
