const Colors = {
  primaryContainer: '#E8DEF8',
  secondaryContainer: '#E8DEF8',
  tertiaryContainer: '#E8DEF8',
};

const templateDetails = {
  1: {
    id: '1',
    title: '晨间瑜伽与冥想',
    subtitle: '开启活力一天',
    duration: 21,
    icon: 'self-improvement',
    color: Colors.primaryContainer,
    category: '身心健康',
    description:
      '通过每天早晨的瑜伽和冥想练习，帮助你建立健康的生活节奏，提升身心状态。',
    goals: ['养成早起习惯', '提升身体柔韧性', '减轻压力和焦虑', '增强专注力'],
    checkpoints: [
      {
        day: 7,
        title: '第一周完成',
        description: '恭喜你坚持了第一周！身体开始适应晨练节奏。',
      },
      {
        day: 14,
        title: '习惯养成中',
        description: '已经坚持两周了，继续保持！',
      },
      {
        day: 21,
        title: '挑战完成',
        description: '太棒了！你已经完成21天挑战，养成了晨练习惯。',
      },
    ],
    tips: [
      '建议在早上6-8点之间进行',
      '准备一张瑜伽垫',
      '空腹或轻食后1小时进行',
      '从简单动作开始，循序渐进',
    ],
    difficulty: 'easy',
    frequency: '每天早晨',
  },
  2: {
    id: '2',
    title: '早起挑战',
    subtitle: '养成早睡早起习惯',
    duration: 30,
    icon: 'wb-sunny',
    color: Colors.secondaryContainer,
    category: '生活习惯',
    description:
      '通过30天的早起训练，调整生物钟，养成健康的作息习惯，提升一天的效率。',
    goals: ['建立规律作息', '提升早晨精力', '增加可支配时间', '改善睡眠质量'],
    checkpoints: [
      {
        day: 7,
        title: '适应期完成',
        description: '身体开始适应新的作息时间。',
      },
      {
        day: 15,
        title: '习惯初成',
        description: '早起不再困难，开始享受清晨时光。',
      },
      {
        day: 30,
        title: '早起达人',
        description: '成功养成早起习惯，开启高效人生！',
      },
    ],
    tips: [
      '逐步提前起床时间，每天提前15分钟',
      '晚上提前30分钟上床',
      '避免睡前使用电子设备',
      '准备一个舒适的闹钟',
    ],
    difficulty: 'medium',
    frequency: '每天',
  },
  3: {
    id: '3',
    title: '阅读计划',
    subtitle: '每天阅读30分钟',
    duration: 60,
    icon: 'menu-book',
    color: Colors.tertiaryContainer,
    category: '学习成长',
    description:
      '每天投入30分钟阅读，两个月读完3-4本书，拓展知识面，提升思维能力。',
    goals: ['养成阅读习惯', '完成3-4本书', '拓展知识面', '提升专注力'],
    checkpoints: [
      {
        day: 15,
        title: '第一本书完成',
        description: '恭喜完成第一本书的阅读！',
      },
      {
        day: 30,
        title: '阅读习惯养成',
        description: '阅读已经成为你的日常习惯。',
      },
      {
        day: 60,
        title: '阅读达人',
        description: '60天坚持阅读，知识储备大幅提升！',
      },
    ],
    tips: [
      '选择感兴趣的书籍',
      '固定阅读时间段',
      '准备笔记本记录感悟',
      '可以从轻松的书开始',
    ],
    difficulty: 'easy',
    frequency: '每天30分钟',
  },
  4: {
    id: '4',
    title: '健身减脂',
    subtitle: '科学运动塑形',
    duration: 90,
    icon: 'fitness-center',
    color: Colors.primaryContainer,
    category: '身心健康',
    description: '通过90天系统训练，科学减脂塑形，打造健康体魄。',
    goals: ['减脂5-10kg', '提升体能', '塑造身材', '养成运动习惯'],
    checkpoints: [
      {
        day: 30,
        title: '初见成效',
        description: '体重开始下降，体能有所提升。',
      },
      {
        day: 60,
        title: '显著变化',
        description: '身材变化明显，运动能力大幅提升。',
      },
      {
        day: 90,
        title: '蜕变完成',
        description: '恭喜你完成90天挑战，收获全新自己！',
      },
    ],
    tips: [
      '结合有氧和力量训练',
      '控制饮食，少油少盐',
      '保证充足睡眠',
      '循序渐进，避免受伤',
    ],
    difficulty: 'hard',
    frequency: '每周5次',
  },
  5: {
    id: '5',
    title: '戒糖挑战',
    subtitle: '远离高糖食物',
    duration: 21,
    icon: 'restaurant',
    color: Colors.secondaryContainer,
    category: '生活习惯',
    description: '21天戒糖挑战，减少糖分摄入，改善皮肤状态，提升健康水平。',
    goals: ['戒除糖瘾', '改善皮肤', '控制体重', '提升精力'],
    checkpoints: [
      {
        day: 7,
        title: '戒断期完成',
        description: '最难的一周过去了，糖瘾开始减弱。',
      },
      {
        day: 14,
        title: '习惯改变',
        description: '不再渴望甜食，口味变清淡。',
      },
      {
        day: 21,
        title: '戒糖成功',
        description: '成功戒糖21天，身体状态明显改善！',
      },
    ],
    tips: [
      '用水果代替甜食',
      '阅读食品标签，避免隐形糖',
      '多喝水，减少饮料',
      '准备健康零食',
    ],
    difficulty: 'medium',
    frequency: '每天',
  },
  6: {
    id: '6',
    title: '学习新技能',
    subtitle: '每天练习1小时',
    duration: 100,
    icon: 'track-changes',
    color: Colors.tertiaryContainer,
    category: '学习成长',
    description: '100天专注学习一项新技能，从入门到精通，投资自己的未来。',
    goals: ['掌握新技能', '建立学习习惯', '提升竞争力', '拓展职业发展'],
    checkpoints: [
      {
        day: 30,
        title: '入门完成',
        description: '已经掌握基础知识，可以开始实践。',
      },
      {
        day: 60,
        title: '进阶阶段',
        description: '技能水平显著提升，可以独立完成项目。',
      },
      {
        day: 100,
        title: '技能精通',
        description: '恭喜你！100天坚持，新技能已经掌握！',
      },
    ],
    tips: ['制定详细学习计划', '理论结合实践', '加入学习社群', '定期复习巩固'],
    difficulty: 'hard',
    frequency: '每天1小时',
  },
};

module.exports = { templateDetails };
