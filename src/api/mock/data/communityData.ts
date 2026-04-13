import type { Buddy } from '../../../types/domain';
import type { CircleListItem } from '../../../features/circle/types';

export const mockBuddies: Buddy[] = [
  {
    id: '1',
    name: 'Elena R.',
    goal: '目标：晨间瑜伽',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCzHNNTMZyepnzwLaDqIvgso4V35x1bl2_TDeiuDwej1bQKqOI6IUYakhakF_Jmc71ldFcX5WyVt-DLNaDhrDPP2WBGk7w7y1DVcry-meJRs24T0xuR3cd5-zJDS7tw-RQgpWDzifTvotOKXjwGG_12z3E8z8OIbV2Ik62j_1P-ZSSu4Y0QTmz3uoNTcx8ydIjz4EsAN5IAcGZo7wMdMeR0QEUcYVpS303iWx-9_xuehFs70T6196mLsS_cFKecNanVEVKFJC3Zf-6',
  },
  {
    id: '2',
    name: 'Marcus K.',
    goal: '目标：数字排毒',
    avatarUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLHmFkwx_27vL1dDGAI87sjjG_ZBPNZeAGazhUc78yBFn6QsytuyOYOLkKVVJBSzcfVFw6Azbc1y9EYYGw5zS2YENRpGlCb68a1HbCujAcmJ273s-GaVYhKvn69hPYJ_3ouEhyxbfxPDs3qnkn2zIZPjJ4txEc6mlLwgU30kCqo_KzbF2NHnXRrSm85_BfH1Y8Nwk6mm6nFivSxVC1uithNi8OqSrD0Myr5HnRYL0OoOe_wf59dTI7E_wXm3nRWRieefXIKCSG7SUJ',
  },
];

export const mockCircles: CircleListItem[] = [
  {
    id: '1',
    title: '清晨冥想室',
    description: '在第一缕阳光落下时，我们共同开启心跳与宁静的共鸣。',
    content: '在这个快节奏的世界里，寻找片刻的宁静是如此珍贵。每天清晨，我们在这里汇聚，通过冥想来唤醒身体，平复思绪。无论你身在何处，那一抹阳光总能触达内心。',
    members: '1.2k',
    type: 'waterfall',
    imageUri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    authorName: '林曦',
    authorAvatarUri: 'https://i.pravatar.cc/150?u=1',
    likes: 342,
    commentsCount: 12,
    comments: [
      { id: 'c1', userName: '月下独酌', text: '今天的冥想引导非常棒，感觉整个人都通透了。', time: '2小时前' },
      { id: 'c2', userName: '小橘子', text: '打卡！坚持第15天。', time: '1小时前' },
    ],
  },
  {
    id: '2',
    title: '手账记录本',
    description: '用笔尖触碰生活的烦理。不仅是记录，更是一场温柔的告白。',
    content: '每一张手账纸都承载着一天的温度。从拼贴到书写，手账让我们慢下来，去观察那些被忽略的生活细节。它可以是凌乱的灵感，也可以是精美的排版。',
    members: '850',
    type: 'waterfall',
    imageUri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508833319283-fcf372b7bbac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    authorName: '小予',
    authorAvatarUri: 'https://i.pravatar.cc/150?u=2',
    likes: 156,
    commentsCount: 8,
    comments: [
      { id: 'c3', userName: '纸上谈情', text: '这页的色系好舒服呀！', time: '3小时前' },
    ],
  },
  {
    id: '3',
    title: '落日收集者',
    description: '捕捉世界各地的余晖。今天你的窗外是否也有一抹温柔？',
    content: '全世界的落日都是大自然的告别吻。我们收集来自五湖四海的余晖，在忙碌的工作之余，别忘了抬头看看云端的那抹绯红。每一场落日都是独一无二的。',
    members: '2.1k',
    type: 'waterfall',
    imageUri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    authorName: '逸凡',
    authorAvatarUri: 'https://i.pravatar.cc/150?u=3',
    likes: 890,
    commentsCount: 45,
    comments: [],
  },
  {
    id: '4',
    title: '“ 如果你有一整个下午，你会如何挥霍？ ”',
    description: '已有 124 位岛友分享了他们的答案。',
    members: '124',
    type: 'topic',
    isTopic: true,
    topicTag: '精选话题',
    backgroundColor: '#DEF9CE',
    participantsAvatars: [
      'https://i.pravatar.cc/150?u=a',
      'https://i.pravatar.cc/150?u=b',
      'https://i.pravatar.cc/150?u=c',
    ],
  },
  {
    id: '5',
    title: '都市绿植社',
    description: '把森林搬进公寓。分享你的植物成长日记。',
    content: '在水泥森林里种下一片绿意。无论是羞涩的龟背竹还是活泼的虎皮兰，它们都在静静地陪伴着我们成长。分享你的养护技巧，让我们一起把家变成小森林。',
    members: '3.4k',
    type: 'waterfall',
    imageUri: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    ],
    authorName: '大树',
    authorAvatarUri: 'https://i.pravatar.cc/150?u=4',
    likes: 567,
    commentsCount: 23,
    comments: [],
  },
];

export const mockLocations = [
  { name: '上海 · 徐汇区', sub: '徐家汇街道', id: 'l1' },
  { name: '上海 · 陆家嘴', sub: '东方明珠周边', id: 'l2' },
  { name: '北京 · 朝阳公园', sub: '朝阳区朝阳公园南路', id: 'l3' },
  { name: '杭州 · 西湖', sub: '西湖风景名胜区', id: 'l4' },
  { name: '广州 · 天河区', sub: '珠江新城CBD', id: 'l5' },
  { name: '成都 · 春熙路', sub: '锦江区核心商圈', id: 'l6' },
];

export const mockTopics = [
  '清晨冥想',
  '今日手账',
  '落日收集',
  '每日一善',
  '自习室',
];
