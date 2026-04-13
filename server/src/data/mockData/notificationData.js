const mockNotifications = [
  {
    id: '1',
    type: 'reminder',
    title: '每日打卡提醒',
    message: '别忘了完成今天的冥想打卡哦，坚持就是胜利！',
    time: '2分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: '恭喜解锁新成就',
    message: '你已连续打卡7天，获得"7天星火"勋章！',
    time: '1小时前',
    read: false,
  },
  {
    id: '3',
    type: 'social',
    title: '好友互动',
    message: 'Elena R. 给你的计划点赞并留言：加油，一起进步！',
    time: '3小时前',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: '系统更新',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题。',
    time: '昨天',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: '系统更新2',
    message: 'PuddingPlan v2.4.0 已发布，新增圈子功能和更多主题2。',
    time: '昨天',
    read: true,
  },
];

module.exports = { mockNotifications };
