const Colors = {
  bronze: '#D7A86E',
  silver: '#B8C2CC',
  gold: '#E6C15A',
  emerald: '#7BC6A4',
  violet: '#B39DDB',
  coral: '#FF9D8A',
  sky: '#8ECDF5',
  gray: '#DADCE0',
};

const mockBadges = [
  {
    id: 'first_check_in',
    title: '初次落印',
    description: '完成第一次打卡，开启你的坚持旅程。',
    icon: 'flare',
    color: Colors.coral,
  },
  {
    id: 'streak_3',
    title: '三日微光',
    description: '连续打卡 3 天。',
    icon: 'wb-twilight',
    color: Colors.sky,
  },
  {
    id: 'streak_7',
    title: '7天星火',
    description: '连续打卡 7 天。',
    icon: 'local-fire-department',
    color: Colors.gold,
  },
  {
    id: 'streak_14',
    title: '自律达人',
    description: '连续打卡 14 天。',
    icon: 'workspace-premium',
    color: Colors.violet,
  },
  {
    id: 'streak_30',
    title: '月度守护者',
    description: '连续打卡 30 天。',
    icon: 'shield-moon',
    color: Colors.silver,
  },
  {
    id: 'checkin_10',
    title: '十次小胜',
    description: '累计完成 10 次打卡。',
    icon: 'looks-10',
    color: Colors.emerald,
  },
  {
    id: 'checkin_50',
    title: '半百勋章',
    description: '累计完成 50 次打卡。',
    icon: 'military-tech',
    color: Colors.gold,
  },
  {
    id: 'plan_1',
    title: '计划启程',
    description: '创建并坚持至少 1 个计划。',
    icon: 'flag',
    color: Colors.coral,
  },
  {
    id: 'plan_3',
    title: '治愈收藏家',
    description: '拥有 3 个治愈计划。',
    icon: 'favorite',
    color: Colors.violet,
  },
  {
    id: 'plan_5',
    title: '生活设计师',
    description: '拥有 5 个计划并持续推进。',
    icon: 'auto-awesome',
    color: Colors.bronze,
  },
  {
    id: 'social_post_1',
    title: '圈子初见',
    description: '发布第一条动态，分享你的今日时刻。',
    icon: 'forum',
    color: Colors.sky,
  },
  {
    id: 'all_rounder',
    title: '多面成长者',
    description: '同时达成 7 天连续打卡、10 次累计打卡和 3 个计划。',
    icon: 'diamond',
    color: Colors.gold,
  },
];

module.exports = { mockBadges };
