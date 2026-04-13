const express = require('express');
const router = express.Router();
const db = require('../data/database');

// 统一响应格式函数
const sendResponse = (res, success, data, message = '', error = null) => {
  res.json({
    success,
    data,
    message,
    error
  });
};

// 获取日历数据
router.get('/', (req, res) => {
  try {
    const { year, month } = req.query;
    
    // 验证参数
    if (!year || !month) {
      return sendResponse(res, false, null, '', '请提供年份和月份');
    }
    
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);
    
    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return sendResponse(res, false, null, '', '请提供有效的年份和月份');
    }
    
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
    const mockedMonthData = [];
    
    const now = new Date();
    const isCurrentMonth = 
      now.getFullYear() === yearInt && now.getMonth() + 1 === monthInt;
    
    const plans = db.plans;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${yearInt}-${String(monthInt).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const completedPlanIds = plans
        .filter(p => p.completedDate.includes(dateStr))
        .map(p => p.id);
      const hasActivity = completedPlanIds.length > 0;
      const activityType = hasActivity ? 'primary' : undefined;
      
      mockedMonthData.push({
        day: i,
        hasActivity,
        isToday: isCurrentMonth && now.getDate() === i,
        isSelected: false,
        activityType,
        completedPlanIds,
      });
    }
    
    sendResponse(res, true, mockedMonthData, '获取日历数据成功');
  } catch (error) {
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
router.patch('/', (req, res) => {
  try {
    const { day, hasActivity, activityType } = req.body;
    
    // 验证参数
    if (day === undefined) {
      return sendResponse(res, false, null, '', '请提供日期');
    }
    
    const dayData = db.calendar.find(d => d.day === day);
    if (!dayData) {
      return sendResponse(res, false, null, '', '未找到日期');
    }
    
    dayData.hasActivity = hasActivity;
    dayData.activityType = activityType;
    
    sendResponse(res, true, true, '日历数据更新成功');
  } catch (error) {
    sendResponse(res, false, null, '', '服务器内部错误');
  }
});

module.exports = router;
