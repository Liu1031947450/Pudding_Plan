import type { Buddy, Circle } from '../../../types/domain';

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

export const mockCircles: Circle[] = [
  {
    id: '1',
    title: '晨读小组',
    members: '1.2k 位成员正在安静共读',
    type: 'large',
    category: '热门',
    imageUri:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC7e1EPbLFG18ZXQnqUlFa8dlguceJHlALBrnE12J49MYJcPB-bghS8lMTYRJY_retjM1ZUQDR_QAbiO1z241ph2TDLqQXPRgFjve2dYUXd_4HOO8ynn7Zoz3pgZlMNfP7-0lhcKvV5RHzS6bxFFqvQQUPt3M67_jzwIEtuVurEo92R5BHOS0Q0SD_2h3mcz0GVCSZgpUnk7Ar5qpOOW6eVRzeVBeINW6E5DWKe78MQnVxkbHZTLxs-2tKYtpzd4ELRY0wTOd-Ytad2',
  },
  {
    id: '2',
    title: '静心手工',
    members: '加入',
    type: 'small',
  },
  {
    id: '3',
    title: '深呼吸',
    members: '加入',
    type: 'small',
  },
  {
    id: '4',
    title: '睡前放松',
    members: '在休息前分享感恩时刻',
    type: 'medium',
  },
];
